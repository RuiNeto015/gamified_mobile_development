package isep.labdsof.ecoloop.model.quiz;

import isep.labdsof.ecoloop.dtos.QuizToken;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document("quiz_used_collection")
public class QuizTokenUsed {

    private String id;

    private QuizToken token;

    private Date usedAt;

    private Date deleteAt;

}