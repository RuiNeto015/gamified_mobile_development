package isep.labdsof.ecoloop.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizResultResponse {

    private UserDto user;

    private boolean wasCorrect;

    private int xpEarned;

}
