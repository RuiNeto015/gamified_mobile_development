package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.config.ConfigProperties;
import isep.labdsof.ecoloop.dtos.*;
import isep.labdsof.ecoloop.exceptions.GameException;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.exceptions.UnauthorizedException;
import isep.labdsof.ecoloop.model.EcoMonthProgressDomain;
import isep.labdsof.ecoloop.model.Level;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
import isep.labdsof.ecoloop.model.quiz.QuizTokenUsed;
import isep.labdsof.ecoloop.repositories.AssetItemRepository;
import isep.labdsof.ecoloop.repositories.QuizTokenUsedRepository;
import isep.labdsof.ecoloop.repositories.UserRepository;
import isep.labdsof.ecoloop.utils.DateAndTimeUtils;
import isep.labdsof.ecoloop.utils.QRCodeUtils;
import isep.labdsof.ecoloop.utils.RecycleAndQuizCodeUtils;
import org.springframework.data.util.Pair;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final AssetItemRepository assetItemRepository;

    private final QuizTokenUsedRepository quizTokenUsedRepository;

    private final QuizService quizService;

    private final ConfigProperties configProperties;

    private final JwtEncoder jwtEncoder;

    private final PasswordEncoder encoder;

    final String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$";
    final String passwordRegex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$";

    public UserService(UserRepository userRepository, AssetItemRepository assetItemRepository, QuizTokenUsedRepository quizTokenUsedRepository, QuizService quizService, ConfigProperties configProperties, JwtEncoder jwtEncoder, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.assetItemRepository = assetItemRepository;
        this.quizTokenUsedRepository = quizTokenUsedRepository;
        this.quizService = quizService;
        this.configProperties = configProperties;
        this.jwtEncoder = jwtEncoder;
        this.encoder = encoder;
    }

    public UserDto getUserInfo(String userId) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return new UserDto(userDomain);
    }

    public CreateUserResponseDto createUser(String username, String email, String password) {

        if (username.length() < 3 || username.length() > 15) {
            throw new IllegalArgumentException("O nome de utilizador deve ter entre 3 e 15 caracteres.");
        }

        if (!email.matches(emailRegex)) {
            throw new IllegalArgumentException("Formato de email inválido.");
        }

        if (!password.matches(passwordRegex)) {
            throw new IllegalArgumentException("A palavra-passe deve conter de 4 a 8 caracteres e incluir números e letras maiúsculas e minúsculas.");
        }

        String encodedPassword = encoder.encode(password);

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Nome de utilizador já existe.");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já existe.");
        }

        UserDomain newUser = createUserDomain(username, email, encodedPassword);
        userRepository.save(newUser);

        String token = generateJwtToken(email);

        return new CreateUserResponseDto(newUser.getId(), token);
    }

    public LoginUserResponseDto loginUser(String email, String password) {
        if (!email.matches(emailRegex)) {
            throw new IllegalArgumentException("Formato de email inválido.");
        }

        Optional<UserDomain> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Falha nas credenciais, tente novamente.");
        }
        UserDomain user = userOpt.get();

        // Remove the extra encoding here
        if (!encoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Falha nas credenciais, tente novamente.");
        }

        String jwtToken = generateJwtToken(user.getEmail());

        return LoginUserResponseDto.builder()
                .userId(user.getId())
                .avatarId(user.getAvatarInfo().getAvatarId())
                .avatarToken(user.getAvatarInfo().getToken())
                .jwtToken(jwtToken)
                .build();
    }

    private String generateJwtToken(String email) {
        Instant now = Instant.now();
        long expiry = 30L * 24L * 3600L;

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("example.io")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiry))
                .subject(email)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public UserDto addAvatarInfoToUser(String userId, String token, String avatarId) throws NotFoundException {

        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilizador não encontrado"));

        AvatarInfoDomain avatarInfo = new AvatarInfoDomain();
        avatarInfo.setToken(token);
        avatarInfo.setAvatarId(avatarId);
        userDomain.setAvatarInfo(avatarInfo);

        this.userRepository.save(userDomain);

        return new UserDto(userDomain);
    }

    public RecycleResponse recycle(String userId, String qrCodeString) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User " + userId + " not found"));

        // Validates the QR code info
        QRCodeInfo qrCodeRequest = QRCodeUtils.convertQRString(qrCodeString);
        QRCodeUtils.validateQrCodeRequest(qrCodeRequest);

        // Increase the XP
        Pair<Integer, Integer> actualYearAndMonth = DateAndTimeUtils.getYearAndMonth();
        int year = actualYearAndMonth.getFirst();
        int month = actualYearAndMonth.getSecond();

        EcoMonthProgressDomain ecoMonthProgressDomain = userDomain.getMonthProgress();
        if (ecoMonthProgressDomain.getYear() != year || ecoMonthProgressDomain.getMonth() != month) {
            ecoMonthProgressDomain = this.resetMonthlyProgress(year, month);
            userDomain.setMonthProgress(ecoMonthProgressDomain);
        }

        // If the last contribution is not from today puts 0
        boolean isSameDay = DateAndTimeUtils.isSameDay(new Date(), userDomain.getTodayContributions().getLastContribution());
        if (userDomain.getTodayContributions() != null && isSameDay) {
            int actualCount = userDomain.getTodayContributions().getCount();
            if (actualCount >= 2) {
                throw new IllegalArgumentException("Já fez as contribuições máximas diária!");
            }
            userDomain.getTodayContributions().setCount(userDomain.getTodayContributions().getCount() + 1);
        } else {
            userDomain.getTodayContributions().setLastContribution(new Date());
            userDomain.getTodayContributions().setCount(1);
        }

        ecoMonthProgressDomain.setMonthEcoXp(ecoMonthProgressDomain.getMonthEcoXp() + configProperties.getRecyclingXp());
        userDomain.setTotalEcoXp(userDomain.getTotalEcoXp() + configProperties.getRecyclingXp());
        this.updateMonthlyChallengeProgress(ecoMonthProgressDomain);
        this.userRepository.save(userDomain);

        // Generates and return the recycle activity token so user can respond to the quiz
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, 5);

        String token = RecycleAndQuizCodeUtils.generateRecyclingToken(userId, calendar.getTime().getTime());
        return RecycleResponse.builder()
                .updatedUser(new UserDto(userDomain))
                .xpEarned(configProperties.getRecyclingXp())
                .token(token)
                .expireAt(calendar.getTime().getTime())
                .build();
    }

    public QuizResultResponse respondQuiz(
            String userId,
            String token,
            String questionId,
            int answer
    ) throws NotFoundException, UnauthorizedException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Validates the token info
        QuizToken quizToken = RecycleAndQuizCodeUtils.convertTokenString(token);
        if (!quizToken.getUserId().equals(userDomain.getId())) {
            throw new UnauthorizedException("The token doesn't belong to the user");
        }
        RecycleAndQuizCodeUtils.validateQuizToken(quizToken);
        if (quizTokenUsedRepository.findById(quizToken.getId()).isPresent()) {
            throw new IllegalArgumentException("The token is already used");
        }

        boolean isCorrect = quizService.isAnswerCorrect(questionId, answer);
        int plusXp = 0;
        if (isCorrect) {
            plusXp = (int) (configProperties.getRecyclingXp() * configProperties.getCorrectQuizCoefXp() - configProperties.getRecyclingXp());
            EcoMonthProgressDomain ecoMonthProgressDomain = userDomain.getMonthProgress();
            ecoMonthProgressDomain.setMonthEcoXp(ecoMonthProgressDomain.getMonthEcoXp() + plusXp);
            userDomain.setTotalEcoXp(userDomain.getTotalEcoXp() + plusXp);
            userDomain.setWonQuizzes(userDomain.getWonQuizzes() + 1);
            this.updateMonthlyChallengeProgress(ecoMonthProgressDomain); // update eco month progress
            this.userRepository.save(userDomain);
        }

        // Saves the token to prevent repetition
        QuizTokenUsed quizTokenUsed = new QuizTokenUsed();
        quizTokenUsed.setId(quizToken.getId());
        quizTokenUsed.setToken(quizToken);
        quizTokenUsed.setUsedAt(new Date());
        quizTokenUsed.setDeleteAt(quizToken.getExpiresAt());
        quizTokenUsedRepository.save(quizTokenUsed);

        return QuizResultResponse.builder()
                .user(new UserDto(userDomain))
                .xpEarned(plusXp)
                .wasCorrect(isCorrect)
                .build();
    }

    public void redeem(String userId, int levelToRedeem) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Level targetLevel = userDomain.getMonthProgress().getLevels().stream()
                .filter(l -> l.getLevelNo() == levelToRedeem)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Level not found"));

        if (!targetLevel.getAchieved()) {
            throw new GameException("Illegal redeem");
        }

        userDomain.getAvailableAssets().add(targetLevel.getRewardId());
        targetLevel.setRedeemed(true);
        this.userRepository.save(userDomain);
    }

    public void sendItem(String sendingUserId, String receivingUsername, String itemId) throws NotFoundException {

        System.out.println(sendingUserId);
        System.out.println(receivingUsername);
        System.out.println(itemId);

        UserDomain sendingUserDomain = this.userRepository.findById(sendingUserId)
                .orElseThrow(() -> new NotFoundException("Utilizador não existe!"));

        UserDomain receivingUserDomain = this.userRepository.findByUsername(receivingUsername)
                .orElseThrow(() -> new NotFoundException("Nome de utilizador não encontrado!"));

        List<String> sendingUserUpdatedAvailableAssets = new ArrayList<>(sendingUserDomain.getAvailableAssets());
        if (!sendingUserUpdatedAvailableAssets.remove(itemId)) {
            throw new NotFoundException("Asset não encontrado na lista do utilizador!");
        }

        if (receivingUserDomain.getAvailableAssets().contains(itemId)) {
            throw new IllegalArgumentException("O utilizador já possui este item!");
        }

        sendingUserDomain.setAvailableAssets(sendingUserUpdatedAvailableAssets);

        List<String> receivingUserUpdatedAvailableAssets = new ArrayList<>(receivingUserDomain.getAvailableAssets());
        receivingUserUpdatedAvailableAssets.add(itemId);
        receivingUserDomain.setAvailableAssets(receivingUserUpdatedAvailableAssets);

        this.userRepository.save(sendingUserDomain);
        this.userRepository.save(receivingUserDomain);
    }

    public void updateUsingItems(String userId, List<String> usingItems) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        userDomain.setUsingAssets(usingItems);
        this.userRepository.save(userDomain);
    }

    private void updateMonthlyChallengeProgress(EcoMonthProgressDomain ecoMonthProgressDomain) {
        for (Level level : ecoMonthProgressDomain.getLevels()) {
            if (!level.getAchieved() && level.getTargetEcoXp() <= ecoMonthProgressDomain.getMonthEcoXp()) {
                level.setAchieved(true);
            }
        }
    }

    public void visit(String userId) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Date today = new Date();

        Calendar lastVisitCal = Calendar.getInstance();
        Calendar todayCal = Calendar.getInstance();
        todayCal.setTime(today);

        if (userDomain.getLastVisit() == null) {
            userDomain.setLastVisit(today);
            userDomain.setStreakVisits(1);
            this.userRepository.save(userDomain);
            return;
        }

        lastVisitCal.setTime(userDomain.getLastVisit());

        if (lastVisitCal.get(Calendar.YEAR) != todayCal.get(Calendar.YEAR) ||
            lastVisitCal.get(Calendar.DAY_OF_YEAR) < todayCal.get(Calendar.DAY_OF_YEAR)) {
            userDomain.setLastVisit(today);
            userDomain.setStreakVisits(userDomain.getStreakVisits() + 1);

            if (userDomain.getStreakVisits() % 5 == 0) {
                userDomain.setRewardCount(userDomain.getRewardCount() + 1);
            }

            this.userRepository.save(userDomain);
        }
    }

    public void removeVisit(String userId) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        userDomain.setRewardCount(Math.max(0, userDomain.getRewardCount() - 1));

        this.userRepository.save(userDomain);
    }

    public GiftResponseDto getGift(String userId) throws NotFoundException {
        UserDomain userDomain = this.userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Utilizador não encontrado!"));

        // Define allowed types
        Set<String> allowedTypes = Set.of("headwear", "facemask", "glasses", "top", "bottom", "footwear");

        // Fetch all assets and filter available ones
        List<AssetItem> allAssets = assetItemRepository.findAll();
        Map<String, AssetItem> assetMap = allAssets.stream()
                .collect(Collectors.toMap(AssetItem::getId, asset -> asset));
        List<String> availableAssets = userDomain.getAvailableAssets();

        // Filter assets to include only non-owned and allowed types
        List<AssetItem> filteredAssets = allAssets.stream()
                .filter(asset -> !availableAssets.contains(asset.getId())) // Exclude owned assets
                .filter(asset -> allowedTypes.contains(asset.getType()))   // Include only allowed types
                .filter(asset -> Objects.equals(asset.getGender(), "neutral"))   // Include only allowed types
                .toList();

        if (filteredAssets.isEmpty()) {
            throw new NotFoundException("Nenhum gift disponível para o utilizador!");
        }

        // Fetch unlocking assets
        List<Map<String, List<Integer>>> unlocking = userDomain.getUnlockingAssets();
        List<Map<String, List<Integer>>> unlockingHelper = getMaps(unlocking);

        Map.Entry<AssetItem, Integer> gift;
        if (unlocking.size() >= 3) {
            gift = providePieceFromUnlocking(unlocking, assetMap);
        } else {
            // Randomly pick a full gift and default to unlocking part "1"
            Random random = new Random();
            AssetItem randomAsset = filteredAssets.get(random.nextInt(filteredAssets.size()));
            gift = Map.entry(randomAsset, 1);
        }

        addUnlockedPartToUser(userDomain, gift.getKey().getId(), gift.getValue());

        // Find the unlocked parts for the given item
        List<Integer> unlockedParts = findUnlockedParts(unlockingHelper, gift.getKey().getId());

        // Return GiftResponseDto including unlocked parts
        return new GiftResponseDto(gift.getKey(), gift.getValue(), unlockedParts);
    }

    private static List<Map<String, List<Integer>>> getMaps(List<Map<String, List<Integer>>> unlocking) {
        List<Map<String, List<Integer>>> unlockingHelper = new ArrayList<>();

        for (Map<String, List<Integer>> map : unlocking) {
            Map<String, List<Integer>> newMap = new HashMap<>();
            for (Map.Entry<String, List<Integer>> entry : map.entrySet()) {
                // Create a new List for each entry's value
                List<Integer> newList = new ArrayList<>(entry.getValue());
                newMap.put(entry.getKey(), newList);
            }
            unlockingHelper.add(newMap);
        }
        return unlockingHelper;
    }

    // Helper method to find unlocked parts for an asset
    private List<Integer> findUnlockedParts(List<Map<String, List<Integer>>> unlockingHelper, String assetId) {
        // Retrieve the current unlocking assets

        for (Map<String, List<Integer>> assetMap : unlockingHelper) {
            if (assetMap.containsKey(assetId)) {
                return assetMap.get(assetId); // Return the list of unlocked parts for the given assetId
            }
        }
        return new ArrayList<>(); // Return empty list if no unlocked parts found
    }

    private Map.Entry<AssetItem, Integer> providePieceFromUnlocking(List<Map<String, List<Integer>>> unlocking,
                                                                    Map<String, AssetItem> assetMap) throws NotFoundException {
        Random random = new Random();
        Map<String, List<Integer>> selectedUnlocking = unlocking.get(random.nextInt(unlocking.size()));

        // Extract the assetId and its unlocked parts
        Map.Entry<String, List<Integer>> entry = selectedUnlocking.entrySet().iterator().next();
        String assetId = entry.getKey();
        List<Integer> unlockedParts = entry.getValue();

        // Define all possible parts of an item
        List<Integer> allParts = List.of(1, 2, 3, 4);

        // Find the missing parts
        List<Integer> missingParts = new ArrayList<>(allParts);
        missingParts.removeAll(unlockedParts);

        if (missingParts.isEmpty()) {
            throw new IllegalStateException("Todas as partes já estão desbloqueadas para o asset: " + assetId);
        }

        // Randomly select a missing part
        Integer partToUnlock = missingParts.get(random.nextInt(missingParts.size()));

        // Fetch the AssetItem using the cached map
        AssetItem asset = assetMap.get(assetId);
        if (asset == null) {
            throw new NotFoundException("Houve um problema a encontrar o asset.");
        }

        return Map.entry(asset, partToUnlock);
    }

    private void addUnlockedPartToUser(UserDomain userDomain, String assetId, Integer unlockedPart) {
        // Retrieve the current unlocking assets
        List<Map<String, List<Integer>>> unlockingAssets = userDomain.getUnlockingAssets();
        List<String> availableAssets = userDomain.getAvailableAssets();

        // Define all parts of an item
        List<Integer> allParts = List.of(1, 2, 3, 4);

        // Flag to track if the asset is complete
        boolean isComplete = false;
        boolean assetFound = false;

        // Iterate through unlockingAssets to find the asset
        for (Map<String, List<Integer>> assetMap : unlockingAssets) {
            if (assetMap.containsKey(assetId)) {
                assetFound = true;

                // Add the unlocked part if it's not already present
                List<Integer> unlockedParts = assetMap.get(assetId);
                if (!unlockedParts.contains(unlockedPart)) {
                    unlockedParts.add(unlockedPart);
                }

                // Check if all parts are unlocked
                if (new HashSet<>(unlockedParts).containsAll(allParts)) {
                    isComplete = true;
                    unlockingAssets.remove(assetMap); // Remove the asset from unlockingAssets
                }
                break;
            }
        }

        if (!assetFound) {
            // If the asset doesn't exist, add a new entry
            Map<String, List<Integer>> newEntry = new HashMap<>();
            newEntry.put(assetId, new ArrayList<>(List.of(unlockedPart)));
            unlockingAssets.add(newEntry);
        }

        if (isComplete) {
            // If the asset is complete, add it to the availableAssets list
            if (!availableAssets.contains(assetId)) {
                availableAssets.add(assetId);
            }
        }

        // Save the updated unlockingAssets and availableAssets back to the user repository
        userDomain.setUnlockingAssets(unlockingAssets);
        userDomain.setAvailableAssets(availableAssets);
        userRepository.save(userDomain);
    }

    private EcoMonthProgressDomain resetMonthlyProgress(int year, int month) {
        EcoMonthProgressDomain ecoMonthProgressDomain = new EcoMonthProgressDomain();
        ecoMonthProgressDomain.setYear(year);
        ecoMonthProgressDomain.setMonth(month);
        ecoMonthProgressDomain.setMonthEcoXp(0);

        Level levelOne = new Level();
        levelOne.setAchieved(false);
        levelOne.setLevelNo(1);
        levelOne.setName(configProperties.getLevelOne().getName());
        levelOne.setTargetEcoXp(configProperties.getLevelOne().getTargetEcoXp());
        levelOne.setRewardId(configProperties.getLevelOne().getRewardId());
        levelOne.setRedeemed(false);
        levelOne.setRewardIconUrl(configProperties.getLevelOne().getRewardIconUrl());

        Level leveTwo = new Level();
        leveTwo.setAchieved(false);
        leveTwo.setLevelNo(2);
        leveTwo.setName(configProperties.getLevelTwo().getName());
        leveTwo.setTargetEcoXp(configProperties.getLevelTwo().getTargetEcoXp());
        leveTwo.setRewardId(configProperties.getLevelTwo().getRewardId());
        leveTwo.setRedeemed(false);
        leveTwo.setRewardIconUrl(configProperties.getLevelTwo().getRewardIconUrl());

        Level levelThree = new Level();
        levelThree.setAchieved(false);
        levelThree.setLevelNo(3);
        levelThree.setName(configProperties.getLevelThree().getName());
        levelThree.setTargetEcoXp(configProperties.getLevelThree().getTargetEcoXp());
        levelThree.setRewardId(configProperties.getLevelThree().getRewardId());
        levelThree.setRedeemed(false);
        levelThree.setRewardIconUrl(configProperties.getLevelThree().getRewardIconUrl());

        List<Level> levels = new ArrayList<>();
        levels.add(levelOne);
        levels.add(leveTwo);
        levels.add(levelThree);

        ecoMonthProgressDomain.setLevels(levels);
        return ecoMonthProgressDomain;
    }

    private UserDomain createUserDomain(String username, String email, String password) {
        UserDomain newUser = new UserDomain();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(password);

        Pair<Integer, Integer> actualYearAndMonth = DateAndTimeUtils.getYearAndMonth();
        int year = actualYearAndMonth.getFirst();
        int month = actualYearAndMonth.getSecond();
        newUser.setMonthProgress(this.resetMonthlyProgress(year, month));

        TodayContributions todayContributions = new TodayContributions();
        todayContributions.setLastContribution(new Date());
        todayContributions.setCount(0);
        newUser.setTodayContributions(todayContributions);

        // Bootstrap assets
        newUser.setAvailableAssets(List.of(
                //headwear
                "84235780", "84237444", // "41436038", "41887474", "42028947", "42029319",
                //facemaks
                //"45755149", , "45873087", "45873633",
                //glasses
                "11800140", "10516872", "10565929",
                //top
                "146089081", // "146120116", "146120326", "146120675",
                //bottom
                "146120748", "146130067", "146142477", // "148367876", "161312422", "bWkPZhOzQI-UVmKBhAUVQA",
                //outfit
                //"109376347", // "109373713", "80144217", "82948900", "83782515", "47431267", "26549796", "29273765",
                //footwear
                "tjm2Yq4RRhC9kNEHgmZvZQ", "146120867" //, "145859028", "146089198", "146120230", "146120526"
        ));
        newUser.setUsingAssets(List.of("tjm2Yq4RRhC9kNEHgmZvZQ", "109376347"));

        AvatarInfoDomain avatarInfoDomain = new AvatarInfoDomain();
        avatarInfoDomain.setToken("");
        avatarInfoDomain.setAvatarId("");
        newUser.setAvatarInfo(avatarInfoDomain);
        return newUser;
    }
}