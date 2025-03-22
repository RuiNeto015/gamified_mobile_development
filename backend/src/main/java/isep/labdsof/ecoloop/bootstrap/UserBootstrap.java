package isep.labdsof.ecoloop.bootstrap;

import isep.labdsof.ecoloop.config.ConfigProperties;
import isep.labdsof.ecoloop.dtos.TodayContributions;
import isep.labdsof.ecoloop.model.EcoMonthProgressDomain;
import isep.labdsof.ecoloop.model.Level;
import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
import isep.labdsof.ecoloop.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class UserBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final ConfigProperties configProperties;

    public UserBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder, ConfigProperties configProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.configProperties = configProperties;
    }

    private final static String password = "password";

    @Override
    public void run(String... args) throws Exception {
        List<Level> levels = getLevels();

        UserDomain user1 = new UserDomain();
        user1.setId("6737a9caa26a6418b970f764");
        user1.setUsername("bob");
        user1.setPassword(passwordEncoder.encode(password));
        user1.setEmail("bob@example.com");
        user1.setTotalEcoXp(500);
        user1.setWonQuizzes(10);
        EcoMonthProgressDomain ecoMonthProgressDomain1 = new EcoMonthProgressDomain();
        ecoMonthProgressDomain1.setMonth(11);
        ecoMonthProgressDomain1.setYear(2024);
        ecoMonthProgressDomain1.setMonthEcoXp(100);
        ecoMonthProgressDomain1.setLevels(levels);
        user1.setMonthProgress(ecoMonthProgressDomain1);
        TodayContributions todayContributions = new TodayContributions();
        todayContributions.setLastContribution(new Date());
        todayContributions.setCount(0);
        user1.setTodayContributions(todayContributions);
        AvatarInfoDomain avatarInfo = new AvatarInfoDomain();
        avatarInfo.setAvatarId("avatar-id");
        avatarInfo.setToken("token-id");
        user1.setAvatarInfo(avatarInfo);
        user1.setAvailableAssets(List.of(
                //hair
                "9247420", "9247422", "9247422", "9247575", "9247573", "9247570", "9247556",
                //headwear
                "84235780", "84237444", "41436038", "41887474", "42021554", "42021757", "42028947", "42029319",
                //facemaks
                "45755149", "45756480", "45868646", "45870153", "45873039", "45873087", "45873633",
                //glasses
                "48055947", "23393768", "40606583", "10516368", "10516872", "10565929",
                //top
                "145064511", "145857239", "146089081", "146120116", "146120326", "146120675",
                //bottom
                "146120748", "146130067", "146142477", "148367876", "161312422", "bWkPZhOzQI-UVmKBhAUVQA",
                //outfit
                "75228028", "75463405", "80144217", "82948900", "83782515", "47431267", "26549796", "29273765",
                //footwear
                "3o24rmzlRcu_asveSKdnkQ", "145859028", "146089198", "146120230", "146120526", "146120867"
        ));
        user1.setUsingAssets(List.of("9247420", "41436038", "40606583", "145857239", "146142477", "146089198"));

        UserDomain user2 = new UserDomain();
        user2.setId("67250888c2e60728c955dbcc");
        user2.setUsername("alice");
        user2.setPassword(passwordEncoder.encode(password));
        user2.setEmail("alice@example.com");
        user2.setTotalEcoXp(300);
        user2.setWonQuizzes(5);
        EcoMonthProgressDomain ecoMonthProgressDomain2 = new EcoMonthProgressDomain();
        ecoMonthProgressDomain2.setMonth(11);
        ecoMonthProgressDomain2.setYear(2024);
        ecoMonthProgressDomain2.setMonthEcoXp(100);
        ecoMonthProgressDomain2.setLevels(levels);
        user2.setMonthProgress(ecoMonthProgressDomain2);
        user2.setTodayContributions(todayContributions);
        user2.setAvatarInfo(avatarInfo);

        addUserIfNotExists(user1);
        addUserIfNotExists(user2);
    }

    private List<Level> getLevels() {
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
        return levels;
    }

    private void addUserIfNotExists(UserDomain user) {
        boolean exists = userRepository.findByUsername(user.getUsername()).isPresent();
        if (!exists) {
            userRepository.save(user);
        }
    }
}