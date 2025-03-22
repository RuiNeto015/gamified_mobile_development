package isep.labdsof.ecoloop.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "game")
@Data
public class ConfigProperties {

    private int recyclingXp;

    private float correctQuizCoefXp;

    private LevelConfDto levelOne;

    private LevelConfDto levelTwo;

    private LevelConfDto levelThree;

    @Data
    public static class LevelConfDto {

        private String name;

        private int targetEcoXp;

        private String rewardId;

        private String rewardIconUrl;
    }
}
