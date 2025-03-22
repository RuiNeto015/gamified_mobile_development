package isep.labdsof.ecoloop.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDomainTest {

    private UserDomain userDomain;

    @BeforeEach
    void setUp() {
        userDomain = new UserDomain();
    }

    @Test
    void testSetAndGetId() {
        userDomain.setId("12345");
        assertEquals("12345", userDomain.getId());
    }

    @Test
    void testSetAndGetUsername() {
        userDomain.setUsername("testUser");
        assertEquals("testUser", userDomain.getUsername());
    }

    @Test
    void testSetAndGetPassword() {
        userDomain.setPassword("password123");
        assertEquals("password123", userDomain.getPassword());
    }

    @Test
    void testSetAndGetEmail() {
        userDomain.setEmail("test@example.com");
        assertEquals("test@example.com", userDomain.getEmail());
    }

    @Test
    void testSetAndGetTotalEcoXp() {
        userDomain.setTotalEcoXp(50);
        assertEquals(50, userDomain.getTotalEcoXp());
    }

    @Test
    void testSetAndGetWonQuizzes() {
        userDomain.setWonQuizzes(10);
        assertEquals(10, userDomain.getWonQuizzes());
    }

    @Test
    void testDefaultValues() {
        // Check default values initialized by Lombok
        assertNull(userDomain.getId());
        assertNull(userDomain.getUsername());
        assertNull(userDomain.getPassword());
        assertNull(userDomain.getEmail());
        assertEquals(0, userDomain.getTotalEcoXp());
        assertEquals(0, userDomain.getWonQuizzes());
        assertNull(userDomain.getMonthProgress());
    }

    @Test
    void testEmailValidation() {
        userDomain.setEmail("invalidEmail");

        // Assuming you would want to validate the email format
        assertFalse(isValidEmail(userDomain.getEmail())); // You need to implement isValidEmail
    }

    // Helper method to validate email format
    private boolean isValidEmail(String email) {
        // Simple regex for email validation
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}