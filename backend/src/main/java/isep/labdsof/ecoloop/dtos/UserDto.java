package isep.labdsof.ecoloop.dtos;

import isep.labdsof.ecoloop.model.UserDomain;
import isep.labdsof.ecoloop.utils.DateAndTimeUtils;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class UserDto {

    public UserDto(UserDomain user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();

        // If the last contribution is not from today puts 0
        if (user.getTodayContributions() != null &&
            DateAndTimeUtils.isSameDay(new Date(), user.getTodayContributions().getLastContribution())) {
            this.todayContributions = user.getTodayContributions().getCount();
        } else {
            this.todayContributions = 0;
        }

        this.totalEcoXp = user.getTotalEcoXp();
        this.wonQuizzes = user.getWonQuizzes();
        this.ecoMonthProgressDto = new EcoMonthProgressDto(user.getMonthProgress());
        this.avatarInfoDto = new AvatarInfoDto(user.getAvatarInfo());
        this.availableAssets = user.getAvailableAssets();
        this.usingAssets = user.getUsingAssets();
        this.streakVisits = user.getStreakVisits();
        this.lastVisit = user.getLastVisit();
        this.unlockingAssets = user.getUnlockingAssets();
        this.rewardCounter = user.getRewardCount();
    }

    // Personal information

    private String id;

    private String username;

    private String email;

    // Challenge part

    private int totalEcoXp;

    private int wonQuizzes;

    private int todayContributions;

    private EcoMonthProgressDto ecoMonthProgressDto;

    // Avatar part

    private AvatarInfoDto avatarInfoDto;

    private List<String> availableAssets;

    private List<String> usingAssets;

    private int streakVisits;

    private int rewardCounter;

    private Date lastVisit;

    private List<Map<String, List<Integer>>> unlockingAssets;

}
