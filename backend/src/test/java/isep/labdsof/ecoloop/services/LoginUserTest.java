package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.dtos.AvatarInfoDto;
import isep.labdsof.ecoloop.dtos.LoginUserResponseDto;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
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
class LoginUserTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder encoder;

    @InjectMocks
    private UserService userService;

    @Mock
    private JwtEncoder jwtEncoder;

    private static final String emailRegex = "^[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$";

    @BeforeEach
    void setUp() {
        Jwt mockJwt = mock(Jwt.class);
        when(mockJwt.getTokenValue()).thenReturn("mockJwtToken");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);
    }

    @Test
    void testLoginUser_ValidInput() {
        String email = "valid@example.com";
        String password = "ValidPass123";
        String encodedPassword = "encodedPassword";

        UserDomain mockUser = new UserDomain();
        mockUser.setEmail(email);
        mockUser.setPassword(encodedPassword);
        mockUser.setId("id");

        AvatarInfoDomain avatarInfo = new AvatarInfoDomain();
        avatarInfo.setAvatarId("id");
        avatarInfo.setToken("avatarToken");
        mockUser.setAvatarInfo(avatarInfo);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(encoder.matches(password, encodedPassword)).thenReturn(true);

        LoginUserResponseDto response = userService.loginUser(email, password);

        assertNotNull(response);
        assertEquals("id", response.getUserId());
        assertEquals("id", response.getAvatarId());
        assertEquals("avatarToken", response.getAvatarToken());
        assertEquals("mockJwtToken", response.getJwtToken());
    }

    @Test
    void testLoginUser_InvalidEmailFormat() {
        String email = "invalidEmail";
        String password = "ValidPass123";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.loginUser(email, password);
        });

        assertEquals("Formato de email inválido.", exception.getMessage());
    }

    @Test
    void testLoginUser_EmailNotFound() {
        String email = "notfound@example.com";
        String password = "ValidPass123";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.loginUser(email, password);
        });

        assertEquals("Falha nas credenciais, tente novamente.", exception.getMessage());
    }

    @Test
    void testLoginUser_InvalidPassword() {
        String email = "valid@example.com";
        String password = "WrongPass123";
        String encodedPassword = "encodedPassword";

        UserDomain mockUser = new UserDomain();
        mockUser.setEmail(email);
        mockUser.setPassword(encodedPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(encoder.matches(password, encodedPassword)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.loginUser(email, password);
        });

        assertEquals("Falha nas credenciais, tente novamente.", exception.getMessage());
    }
}