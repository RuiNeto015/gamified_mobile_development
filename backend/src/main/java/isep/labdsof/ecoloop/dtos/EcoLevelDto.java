package isep.labdsof.ecoloop.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EcoLevelDto {
    private int levelNo;

    private Boolean achieved;

    private String name;

    private int targetEcoXp;

    private String rewardId;

    private String rewardIconUrl;

    private Boolean redeemed;
}
