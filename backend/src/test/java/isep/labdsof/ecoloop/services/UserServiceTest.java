package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.dtos.GiftResponseDto;
import isep.labdsof.ecoloop.exceptions.GameException;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.model.EcoMonthProgressDomain;
import isep.labdsof.ecoloop.model.Level;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.repositories.AssetItemRepository;
import isep.labdsof.ecoloop.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AssetItemRepository assetItemRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateUsingItems_ShouldUpdateUsingAssets() throws NotFoundException {
        // Arrange
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        user.setId(userId);
        user.setUsingAssets(Arrays.asList("asset1", "asset2"));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // New assets to add
        List<String> newUsingAssets = Arrays.asList("asset3", "asset4");

        // Act
        userService.updateUsingItems(userId, newUsingAssets);

        // Assert
        assertEquals(newUsingAssets, user.getUsingAssets());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void updateUsingItems_ShouldThrowNotFoundException_WhenUserNotFound() {
        // Arrange
        String userId = "nonExistentUserId";
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.updateUsingItems(userId, Arrays.asList("asset3", "asset4"));
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUsingItems_ShouldClearUsingAssets_WhenEmptyListProvided() throws NotFoundException {
        // Arrange
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        user.setId(userId);
        user.setUsingAssets(Arrays.asList("asset1", "asset2")); // Existing assets

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        userService.updateUsingItems(userId, Arrays.asList());

        // Assert
        assertTrue(user.getUsingAssets().isEmpty(), "Using assets should be empty");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void updateUsingItems_ShouldAllowDuplicatesInUsingAssets() throws NotFoundException {
        // Arrange
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        user.setId(userId);
        user.setUsingAssets(Arrays.asList("asset1")); // Existing assets

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Duplicates in new assets
        List<String> newUsingAssets = Arrays.asList("asset2", "asset2", "asset3");

        // Act
        userService.updateUsingItems(userId, newUsingAssets);

        // Assert
        assertEquals(newUsingAssets, user.getUsingAssets());
        assertEquals(3, user.getUsingAssets().size(), "Using assets should allow duplicates");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void redeem_ShouldRedeem() throws NotFoundException {
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        EcoMonthProgressDomain ecoMonthProgress = new EcoMonthProgressDomain();
        ecoMonthProgress.setLevels(getLevels());
        ecoMonthProgress.setMonthEcoXp(150);
        user.setMonthProgress(ecoMonthProgress);
        user.setId(userId);
        user.getMonthProgress().getLevels().get(0).setAchieved(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.redeem(userId, 1);

        assertEquals(user.getMonthProgress().getLevels().get(0).getRedeemed(), true);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void redeem_ShouldResultInErrorForNotYetAchievedLevel() throws NotFoundException {
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        EcoMonthProgressDomain ecoMonthProgress = new EcoMonthProgressDomain();
        ecoMonthProgress.setLevels(getLevels());
        ecoMonthProgress.setMonthEcoXp(140);
        user.setMonthProgress(ecoMonthProgress);
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        assertThrows(GameException.class, () -> userService.redeem(userId, 1));
    }

    @Test
    void sendItem_ShouldTransferItemSuccessfully() throws NotFoundException {
        // Arrange
        String sendingUserId = "user1";
        String receivingUsername = "user2";
        String itemId = "item1";

        // Mock sending user
        UserDomain sendingUser = new UserDomain();
        sendingUser.setId(sendingUserId);
        sendingUser.setAvailableAssets(new ArrayList<>(List.of(itemId, "item2")));

        // Mock receiving user
        UserDomain receivingUser = new UserDomain();
        receivingUser.setUsername(receivingUsername);
        receivingUser.setAvailableAssets(new ArrayList<>());

        when(userRepository.findById(sendingUserId)).thenReturn(Optional.of(sendingUser));
        when(userRepository.findByUsername(receivingUsername)).thenReturn(Optional.of(receivingUser));

        // Act
        userService.sendItem(sendingUserId, receivingUsername, itemId);

        // Assert
        // Check the updated available assets
        assertFalse(sendingUser.getAvailableAssets().contains(itemId), "Item should be removed from sender");
        assertTrue(receivingUser.getAvailableAssets().contains(itemId), "Item should be added to receiver");

        // Verify the save operations
        verify(userRepository, times(1)).save(sendingUser);
        verify(userRepository, times(1)).save(receivingUser);
    }

    @Test
    void sendItem_ShouldThrowException_WhenSendingUserNotFound() {
        // Arrange
        String sendingUserId = "invalidUser";
        String receivingUsername = "user2";
        String itemId = "item1";

        when(userRepository.findById(sendingUserId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.sendItem(sendingUserId, receivingUsername, itemId);
        });

        assertEquals("Utilizador não existe!", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void sendItem_ShouldThrowException_WhenReceivingUserNotFound() {
        // Arrange
        String sendingUserId = "user1";
        String receivingUsername = "invalidUser";
        String itemId = "item1";

        UserDomain sendingUser = new UserDomain();
        sendingUser.setId(sendingUserId);
        sendingUser.setAvailableAssets(new ArrayList<>(List.of(itemId)));

        when(userRepository.findById(sendingUserId)).thenReturn(Optional.of(sendingUser));
        when(userRepository.findByUsername(receivingUsername)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.sendItem(sendingUserId, receivingUsername, itemId);
        });

        assertEquals("Nome de utilizador não encontrado!", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void sendItem_ShouldThrowException_WhenItemNotInSenderAssets() {
        // Arrange
        String sendingUserId = "user1";
        String receivingUsername = "user2";
        String itemId = "item1";

        UserDomain sendingUser = new UserDomain();
        sendingUser.setId(sendingUserId);
        sendingUser.setAvailableAssets(new ArrayList<>(List.of("item2"))); // Item1 not present

        UserDomain receivingUser = new UserDomain();
        receivingUser.setUsername(receivingUsername);
        receivingUser.setAvailableAssets(new ArrayList<>());

        when(userRepository.findById(sendingUserId)).thenReturn(Optional.of(sendingUser));
        when(userRepository.findByUsername(receivingUsername)).thenReturn(Optional.of(receivingUser));

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.sendItem(sendingUserId, receivingUsername, itemId);
        });

        assertEquals("Asset não encontrado na lista do utilizador!", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void sendItem_ShouldThrowException_WhenReceiverAlreadyHasItem() {
        // Arrange
        String sendingUserId = "user1";
        String receivingUsername = "user2";
        String itemId = "item1";

        UserDomain sendingUser = new UserDomain();
        sendingUser.setId(sendingUserId);
        sendingUser.setAvailableAssets(new ArrayList<>(List.of(itemId, "item2")));

        UserDomain receivingUser = new UserDomain();
        receivingUser.setUsername(receivingUsername);
        receivingUser.setAvailableAssets(new ArrayList<>(List.of(itemId))); // Already has the item

        when(userRepository.findById(sendingUserId)).thenReturn(Optional.of(sendingUser));
        when(userRepository.findByUsername(receivingUsername)).thenReturn(Optional.of(receivingUser));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.sendItem(sendingUserId, receivingUsername, itemId);
        });

        assertEquals("O utilizador já possui este item!", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    private List<Level> getLevels() {
        Level levelOne = new Level();
        levelOne.setAchieved(false);
        levelOne.setLevelNo(1);
        levelOne.setTargetEcoXp(150);
        levelOne.setRewardId("1");
        levelOne.setRedeemed(false);

        Level leveTwo = new Level();
        leveTwo.setAchieved(false);
        leveTwo.setLevelNo(2);
        leveTwo.setTargetEcoXp(300);
        leveTwo.setRewardId("2");
        leveTwo.setRedeemed(false);

        Level levelThree = new Level();
        levelThree.setAchieved(false);
        levelThree.setLevelNo(3);
        levelThree.setTargetEcoXp(600);
        levelThree.setRewardId("3");
        levelThree.setRedeemed(false);

        List<Level> levels = new ArrayList<>();
        levels.add(levelOne);
        levels.add(leveTwo);
        levels.add(levelThree);
        return levels;
    }

    @Test
    void visit_ShouldUpdateLastVisitAndIncrementStreak_WhenPreviousVisitIsDifferentDay() throws NotFoundException {
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        user.setId(userId);
        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_YEAR, -1); // Set last visit to yesterday
        user.setLastVisit(yesterday.getTime());
        user.setStreakVisits(5);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.visit(userId);

        assertNotNull(user.getLastVisit());
        assertEquals(6, user.getStreakVisits(), "Streak should increment by 1");
        Calendar lastVisitCal = Calendar.getInstance();
        lastVisitCal.setTime(user.getLastVisit());
        assertEquals(Calendar.getInstance().get(Calendar.DAY_OF_YEAR), lastVisitCal.get(Calendar.DAY_OF_YEAR),
                "Last visit should be updated to today");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void visit_ShouldInitializeLastVisitAndStreak_WhenNoPreviousVisit() throws NotFoundException {
        String userId = "testUserId";
        UserDomain user = new UserDomain();
        user.setId(userId);
        user.setLastVisit(null); 
        user.setStreakVisits(0);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        userService.visit(userId);

        // Assert
        assertNotNull(user.getLastVisit(), "Last visit should be initialized");
        assertEquals(1, user.getStreakVisits(), "Streak should start at 1");
        Calendar lastVisitCal = Calendar.getInstance();
        lastVisitCal.setTime(user.getLastVisit());
        assertEquals(Calendar.getInstance().get(Calendar.DAY_OF_YEAR), lastVisitCal.get(Calendar.DAY_OF_YEAR),
                "Last visit should be updated to today");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void getGift_ShouldThrowNotFoundException_WhenUserNotFound() {
        String userId = "nonExistentUserId";
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> userService.getGift(userId));
        assertEquals("Utilizador não encontrado!", exception.getMessage());
    }
}