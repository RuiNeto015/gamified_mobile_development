package isep.labdsof.ecoloop.model.quiz;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document("quiz_collection")
public class QuizDomain {

    @Id
    private String id;

    private String question;

    private List<AnswerOptions> answerOptions;

    private int correctAnswer;

}
