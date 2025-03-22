package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.dtos.UserDto;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.model.EcoMonthProgressDomain;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
import isep.labdsof.ecoloop.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddAvatarInfoToUserTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private UserDomain userDomain;

    @BeforeEach
    void setUp() {
        userDomain = new UserDomain();
        userDomain.setId("12345");
        userDomain.setUsername("testUser");
        userDomain.setEmail("test@example.com");

        userDomain.setTotalEcoXp(500);
        userDomain.setWonQuizzes(10);
        EcoMonthProgressDomain ecoMonthProgressDomain = new EcoMonthProgressDomain();
        ecoMonthProgressDomain.setMonth(11);
        ecoMonthProgressDomain.setYear(2024);
        ecoMonthProgressDomain.setMonthEcoXp(100);
        ecoMonthProgressDomain.setLevels(new ArrayList<>());
        userDomain.setMonthProgress(ecoMonthProgressDomain);

        AvatarInfoDomain avatarInfoDomain = new AvatarInfoDomain();
        avatarInfoDomain.setToken("token123");
        avatarInfoDomain.setAvatarId("avatar123");
    }

    @Test
    void testAddAvatarInfoToUser() throws NotFoundException {
        String userId = "12345";
        String token = "token123";
        String avatarId = "avatar123";

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(userDomain));

        UserDto result = userService.addAvatarInfoToUser(userId, token, avatarId);

        assertNotNull(result);
        assertEquals(userDomain.getId(), result.getId());
        assertNotNull(result.getAvatarInfoDto());
        assertEquals(token, result.getAvatarInfoDto().getToken());
        assertEquals(avatarId, result.getAvatarInfoDto().getAvatarId());

        verify(userRepository, times(1)).save(userDomain);
    }

    @Test
    void testAddAvatarInfoToUser_UserNotFound() {
        String userId = "nonexistentUser";
        String token = "token123";
        String avatarId = "avatar123";

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty());

        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.addAvatarInfoToUser(userId, token, avatarId);
        });

        assertEquals("Utilizador não encontrado", exception.getMessage());
    }
}
