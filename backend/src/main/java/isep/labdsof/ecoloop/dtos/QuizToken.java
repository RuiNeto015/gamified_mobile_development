package isep.labdsof.ecoloop.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class QuizToken {

    private String id;

    private String userId;

    private Date expiresAt;

}
