package isep.labdsof.ecoloop.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import isep.labdsof.ecoloop.dtos.QuizDto;
import isep.labdsof.ecoloop.exceptions.InternalServerException;
import isep.labdsof.ecoloop.services.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Quiz Controller", description = "Endpoint for handling the logic related to the quizzes")
@RestController
@RequestMapping(path = "/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/random")
    public ResponseEntity<QuizDto> getRandomQuiz() throws InternalServerException {
        QuizDto quiz = quizService.getRandomQuiz();
        return new ResponseEntity<>(quiz, HttpStatus.OK);
    }

}
