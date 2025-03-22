package isep.labdsof.ecoloop.dtos;

import isep.labdsof.ecoloop.model.EcoMonthProgressDomain;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class EcoMonthProgressDto {

    public EcoMonthProgressDto(EcoMonthProgressDomain ecoMonthProgressDomain) {
        this.year = ecoMonthProgressDomain.getYear();
        this.month = ecoMonthProgressDomain.getMonth();
        this.monthEcoXp = ecoMonthProgressDomain.getMonthEcoXp();
        this.levels = ecoMonthProgressDomain.getLevels().stream().map((l) -> new EcoLevelDto(
                l.getLevelNo(), l.getAchieved(), l.getName(), l.getTargetEcoXp(), l.getRewardId(), l.getRewardIconUrl(),
                l.getRedeemed()
        )).toList();
    }

    private int year;

    private int month;

    private int monthEcoXp;

    private List<EcoLevelDto> levels;

}
