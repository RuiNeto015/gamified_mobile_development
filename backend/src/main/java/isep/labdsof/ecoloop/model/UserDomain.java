package isep.labdsof.ecoloop.model;

import isep.labdsof.ecoloop.dtos.TodayContributions;
import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@Document("user_collection")
public class UserDomain {

    // Personal information

    @Id
    private String id;

    private String username;

    private String password;

    private String email;

    // Avatar part

    private AvatarInfoDomain avatarInfo;

    private List<Map<String, List<Integer>>> unlockingAssets = new ArrayList<>();

    private List<String> availableAssets = new ArrayList<>();

    private List<String> usingAssets = new ArrayList<>();

    // Challenge part

    private int totalEcoXp;

    private int wonQuizzes;

    private TodayContributions todayContributions;

    private EcoMonthProgressDomain monthProgress;

    private int streakVisits;

    private int rewardCount;

    private Date lastVisit;

}
