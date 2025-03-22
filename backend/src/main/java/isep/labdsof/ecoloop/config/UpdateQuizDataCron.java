package isep.labdsof.ecoloop.config;

import isep.labdsof.ecoloop.services.QuizService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class UpdateQuizDataCron {

    private final QuizService quizService;

    public UpdateQuizDataCron(QuizService quizService) {
        this.quizService = quizService;
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void execute() throws IOException {
        System.out.println("Updating quiz data...");
        this.quizService.updateQuizData();
    }
}
