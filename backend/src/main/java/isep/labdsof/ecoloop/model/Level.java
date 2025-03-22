package isep.labdsof.ecoloop.model;

import lombok.Data;

@Data
public class Level {

    private int levelNo;

    private Boolean achieved;

    private String name;

    private int targetEcoXp;

    private String rewardId;

    private String rewardIconUrl;

    private Boolean redeemed;
}
