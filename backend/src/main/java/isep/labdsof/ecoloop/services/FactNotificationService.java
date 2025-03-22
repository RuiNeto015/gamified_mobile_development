package isep.labdsof.ecoloop.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import isep.labdsof.ecoloop.model.deviceToken.DeviceTokenDomain;
import isep.labdsof.ecoloop.model.fact.FactDomain;
import isep.labdsof.ecoloop.repositories.DeviceTokenRepository;
import isep.labdsof.ecoloop.repositories.FactRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Service;

import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.*;

@Service
@Slf4j
@EnableScheduling
public class FactNotificationService {

    private final WebClient firebaseCloudMessagingWebClient;

    private final WebClient oauth2WebClient;

    private final FactRepository factRepository;

    private final DeviceTokenRepository deviceTokenRepository;

    public FactNotificationService(WebClient firebaseCloudMessagingWebClient, WebClient oauth2WebClient,
                                   FactRepository factRepository, DeviceTokenRepository deviceTokenRepository) {

        this.firebaseCloudMessagingWebClient = firebaseCloudMessagingWebClient;
        this.oauth2WebClient = oauth2WebClient;
        this.factRepository = factRepository;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    public void notifyUsers() throws Exception {
        Optional<FactDomain> factDomain = this.factRepository.findOneRandom();
        Oauth2Token oauth2Token = genOauth2Token();
        List<DeviceTokenDomain> deviceTokens = this.deviceTokenRepository.findAll();

        if (factDomain.isPresent()) {
            for (DeviceTokenDomain token : deviceTokens) {
                callFCM(token.getDeviceToken(), factDomain.get(), oauth2Token);
            }
        } else {
            log.warn("Error during notification sending");
        }
    }

    private void callFCM(String deviceToken, FactDomain fact, Oauth2Token oauth2Token) {
        Notification notification = new Notification("Ajuda o ambiente!", fact.getFact());
        Message message = new Message(deviceToken, notification);
        FirebasePayload payload = new FirebasePayload(message);

        firebaseCloudMessagingWebClient.post().contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + oauth2Token.access_token)
                .bodyValue(payload).retrieve()
                .bodyToMono(String.class).block();
    }

    private Oauth2Token genOauth2Token() throws Exception {
        long nowMillis = System.currentTimeMillis();

        ClassPathResource resource = new ClassPathResource("ecoloop-service-account.json");
        Map<String, Object> serviceAccount = new ObjectMapper().readValue(resource.getInputStream(), Map.class);

        Map<String, Object> encryptionPayload = new HashMap<>();
        encryptionPayload.put("iss", serviceAccount.get("client_email"));
        encryptionPayload.put("sub", serviceAccount.get("client_email"));
        encryptionPayload.put("aud", "https://oauth2.googleapis.com/token");
        encryptionPayload.put("iat", nowMillis / 1000);
        encryptionPayload.put("exp", (nowMillis + 3600 * 1000) / 1000);
        encryptionPayload.put("scope", "https://www.googleapis.com/auth/firebase.messaging");

        PrivateKey privateKey = getPrivateKeyFromPem((String) serviceAccount.get("private_key"));

        String jwtToken = Jwts.builder().content(new ObjectMapper().writeValueAsString(encryptionPayload))
                .signWith(privateKey, SignatureAlgorithm.RS256).compact();

        String formData = "grant_type="
                + URLEncoder.encode("urn:ietf:params:oauth:grant-type:jwt-bearer", StandardCharsets.UTF_8)
                + "&assertion=" + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);

        return oauth2WebClient.post().contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(formData).retrieve()
                .bodyToMono(Oauth2Token.class).block();
    }

    private RSAPrivateKey getPrivateKeyFromPem(String pem) throws Exception {
        pem = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] decoded = Base64.getDecoder().decode(pem);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    }

    @Data
    private static class Oauth2Token {
        String access_token;
        long expires_in;
        String token_type;
    }

    @Data
    @AllArgsConstructor
    private static class FirebasePayload {
        Message message;
    }

    @Data
    @AllArgsConstructor
    private static class Message {
        String token;
        Notification notification;
    }

    @Data
    @AllArgsConstructor
    private static class Notification {
        String title;
        String body;
    }
}
