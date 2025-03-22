package isep.labdsof.ecoloop.utils;

import isep.labdsof.ecoloop.dtos.QuizToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.text.ParseException;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class RecycleAndQuizCodeUtilsTest {

    @Test
    void testGenerateRecyclingToken() {
        String userId = "user123";
        long expiresAt = System.currentTimeMillis() + 100000;

        String token = RecycleAndQuizCodeUtils.generateRecyclingToken(userId, expiresAt);

        // Check if the generated token contains all required parts
        assertTrue(token.contains("id="));
        assertTrue(token.contains("user=" + userId));
        assertTrue(token.contains("expiresAt=" + expiresAt));
    }

    @Test
    void testConvertTokenStringValid() throws ParseException {
        // Construct a valid token string with the ISO8601 format date
        Date date = new Date();
        String token = "id=12345;user=user123;expiresAt=" + date.getTime();

        QuizToken quizToken = RecycleAndQuizCodeUtils.convertTokenString(token);

        // Assert that the token is correctly parsed
        assertEquals("12345", quizToken.getId());
        assertEquals("user123", quizToken.getUserId());
        assertNotNull(quizToken.getExpiresAt()); // The expiration date should be parsed correctly
    }

    @Test
    void testConvertTokenStringInvalidFormat() {
        String token = "id=12345;user=user123;expiresAt=invalidDate";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                RecycleAndQuizCodeUtils.convertTokenString(token)
        );

        assertEquals("Invalid date format for expiresAt: invalidDate", exception.getMessage());
    }

    @Test
    void testConvertTokenStringMissingFields() {
        String token = "id=12345;user=user123";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                RecycleAndQuizCodeUtils.convertTokenString(token)
        );

        assertEquals("Recycling token string format is invalid", exception.getMessage());
    }

    @Test
    void testConvertTokenStringNullOrEmpty() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                RecycleAndQuizCodeUtils.convertTokenString("")
        );

        assertEquals("Recycling token string cannot be null or empty", exception.getMessage());
    }

    @Test
    void testValidateQuizTokenNotExpired() {
        // Set an expiration date in the future
        QuizToken quizToken = new QuizToken();
        quizToken.setExpiresAt(new Date(System.currentTimeMillis() + 100000)); // Future date

        // No exception should be thrown
        RecycleAndQuizCodeUtils.validateQuizToken(quizToken);
    }

    @Test
    void testValidateQuizTokenExpired() {
        // Set an expiration date in the past
        QuizToken quizToken = new QuizToken();
        quizToken.setExpiresAt(new Date(System.currentTimeMillis() - 100000)); // Past date

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                RecycleAndQuizCodeUtils.validateQuizToken(quizToken)
        );

        assertEquals("The quiz token request expired", exception.getMessage());
    }
}