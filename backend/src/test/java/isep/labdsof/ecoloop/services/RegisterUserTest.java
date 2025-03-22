package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.config.ConfigProperties;
import isep.labdsof.ecoloop.dtos.CreateUserResponseDto;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RegisterUserTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder encoder;

    @Mock
    private ConfigProperties configProperties;

    @InjectMocks
    private UserService userService;

    @Mock
    private JwtEncoder jwtEncoder;

    @BeforeEach
    void setUp() {
        when(configProperties.getLevelOne()).thenReturn(createMockLevel("Level One", 150, "reward1", "rewardIconUrl1"));
        when(configProperties.getLevelTwo()).thenReturn(createMockLevel("Level Two", 400, "reward2", "rewardIconUrl2"));
        when(configProperties.getLevelThree()).thenReturn(createMockLevel("Level Three", 600, "reward3", "rewardIconUrl3"));

        Jwt mockJwt = mock(Jwt.class);
        when(mockJwt.getTokenValue()).thenReturn("mockJwtToken");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);
    }

    private ConfigProperties.LevelConfDto createMockLevel(String name, int targetEcoXp, String rewardId, String rewardIconUrl) {
        ConfigProperties.LevelConfDto levelConfDto = new ConfigProperties.LevelConfDto();
        levelConfDto.setName(name);
        levelConfDto.setTargetEcoXp(targetEcoXp);
        levelConfDto.setRewardId(rewardId);
        levelConfDto.setRewardIconUrl(rewardIconUrl);
        return levelConfDto;
    }

    @Test
    void testCreateUser_ValidInput() {
        String username = "validUser";
        String email = "valid@example.com";
        String password = "Pass123";
        String encodedPassword = "encodedPassword";

        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(encoder.encode(password)).thenReturn(encodedPassword);

        assertNotNull(configProperties.getLevelOne());

        CreateUserResponseDto response = userService.createUser(username, email, password);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("mockJwtToken", response.getToken());
        verify(userRepository, times(1)).save(any(UserDomain.class));
    }

    @Test
    void testCreateUser_InvalidUsername() {
        String username = "Jo";
        String email = "valid@example.com";
        String password = "Password123";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(username, email, password);
        });
        assertEquals("O nome de utilizador deve ter entre 3 e 15 caracteres.", exception.getMessage());
    }

    @Test
    void testCreateUser_InvalidEmail() {
        String username = "validUser";
        String email = "invalidEmail";
        String password = "Pass123";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(username, email, password);
        });
        assertEquals("Formato de email inválido.", exception.getMessage());
    }

    @Test
    void testCreateUser_InvalidPassword() {
        String username = "validUser";
        String email = "valid@example.com";
        String password = "short";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(username, email, password);
        });
        assertEquals("A palavra-passe deve conter de 4 a 8 caracteres e incluir números e letras maiúsculas e minúsculas.", exception.getMessage());
    }

    @Test
    void testCreateUser_UsernameAlreadyExists() {
        String username = "existingUser";
        String email = "valid@example.com";
        String password = "Pass123";

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(new UserDomain()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(username, email, password);
        });
        assertEquals("Nome de utilizador já existe.", exception.getMessage());
    }

    @Test
    void testCreateUser_EmailAlreadyExists() {
        String username = "validUser";
        String email = "existing@example.com";
        String password = "Pass123";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(new UserDomain()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser(username, email, password);
        });
        assertEquals("Email já existe.", exception.getMessage());
    }
}
