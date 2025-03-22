package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.bootstrap.QuizBootstrap;
import isep.labdsof.ecoloop.dtos.QuizDto;
import isep.labdsof.ecoloop.exceptions.InternalServerException;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.model.quiz.QuizDomain;
import isep.labdsof.ecoloop.repositories.QuizRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    private final QuizBootstrap quizBootstrap;

    public QuizService(QuizRepository quizRepository, QuizBootstrap quizBootstrap) {
        this.quizRepository = quizRepository;
        this.quizBootstrap = quizBootstrap;
    }

    public QuizDto getRandomQuiz() throws InternalServerException {
        QuizDomain quizDomain = this.quizRepository.findOneRandom()
                .orElseThrow(() -> new InternalServerException("There is no quiz to present"));

        return new QuizDto(quizDomain);
    }

    public boolean isAnswerCorrect(String questionId, int answer) throws NotFoundException {
        QuizDomain quizDomain = this.quizRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));

        return quizDomain.getCorrectAnswer() == answer;
    }

    public void updateQuizData() throws IOException {
        this.quizRepository.deleteAll();
        this.quizBootstrap.loadQuizzes(false);
    }
}
