package isep.labdsof.ecoloop.dtos;

import isep.labdsof.ecoloop.model.quiz.AnswerOptions;
import isep.labdsof.ecoloop.model.quiz.QuizDomain;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class QuizDto {

    public QuizDto(QuizDomain quiz) {
        this.id = quiz.getId();
        this.answerOptions = quiz.getAnswerOptions();
        this.question = quiz.getQuestion();
        this.correctAnswer = quiz.getCorrectAnswer();
    }

    private String id;

    private String question;

    private List<AnswerOptions> answerOptions;

    private int correctAnswer;

}
