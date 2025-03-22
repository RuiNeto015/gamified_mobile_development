package isep.labdsof.ecoloop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient firebaseCloudMessagingWebClient() {
        return WebClient.builder().baseUrl("https://fcm.googleapis.com/v1/projects/ecoloop-ec52e/messages:send").defaultHeader(HttpHeaders.CONTENT_TYPE,
                MediaType.APPLICATION_JSON_VALUE).build();
    }

    @Bean
    public WebClient oauth2WebClient() {
        return WebClient.builder().baseUrl("https://oauth2.googleapis.com/token").build();
    }
}
