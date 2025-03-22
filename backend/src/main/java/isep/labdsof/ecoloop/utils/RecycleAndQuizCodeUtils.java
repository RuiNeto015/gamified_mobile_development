package isep.labdsof.ecoloop.utils;

import isep.labdsof.ecoloop.dtos.QuizToken;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

public class RecycleAndQuizCodeUtils {

    public static String generateRecyclingToken(String userId, long expiresAt) {
        // Build token
        StringBuilder sb = new StringBuilder();
        sb.append("id=");
        sb.append(UUID.randomUUID());
        sb.append(";user=");
        sb.append(userId);
        sb.append(";expiresAt=");
        sb.append(expiresAt);

        // todo: encrypt with our rsa key
        return sb.toString();
    }

    public static QuizToken convertTokenString(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Recycling token string cannot be null or empty");
        }

        Map<String, String> qrParts = new HashMap<>();
        String[] pairs = token.split(";");

        for (String pair : pairs) {
            String[] keyValue = pair.split("=");
            if (keyValue.length != 2) {
                throw new IllegalArgumentException("Recycling token string format is invalid");
            }
            qrParts.put(keyValue[0].trim(), keyValue[1].trim());
        }

        if (!qrParts.containsKey("id") || !qrParts.containsKey("user") || !qrParts.containsKey("expiresAt")) {
            throw new IllegalArgumentException("Recycling token string format is invalid");
        }

        // Extract and validate each field
        String id = qrParts.get("id");
        String userId = qrParts.get("user");
        String expiresAtStr = qrParts.get("expiresAt");
        Date date;

        try {
            date = DateAndTimeUtils.convertTimestampToDate(expiresAtStr);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format for expiresAt: " + expiresAtStr);
        }

        QuizToken quizToken = new QuizToken();
        quizToken.setId(id);
        quizToken.setUserId(userId);
        quizToken.setExpiresAt(date);

        return quizToken;
    }


    public static void validateQuizToken(QuizToken quizToken) {
        if (quizToken.getExpiresAt().before(new Date())) {
            throw new IllegalArgumentException("The quiz token request expired");
        }

        // todo: verify the integrity of the payload with the hash and signature
    }

}

