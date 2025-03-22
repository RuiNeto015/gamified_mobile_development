package isep.labdsof.ecoloop.bootstrap;

import isep.labdsof.ecoloop.model.quiz.AnswerOptions;
import isep.labdsof.ecoloop.model.quiz.QuizDomain;
import isep.labdsof.ecoloop.repositories.QuizRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Configuration
@Slf4j
public class QuizBootstrap implements CommandLineRunner {

    private final QuizRepository quizRepository;

    private static final String QUIZ_DATA_FILE = "bootstrap/quiz-data.yml";

    private static final String QUIZ_UPDATE_DATA_FILE = "bootstrap/quiz-update-data.yml";

    public QuizBootstrap(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Adds the quizzes only if the database it is empty
        if (quizRepository.count() == 0) {
            loadQuizzes(true);
        }
    }

    public void loadQuizzes(boolean defaultBehaviour) throws IOException {
        String file;

        if (defaultBehaviour) {
            file = QUIZ_DATA_FILE;
        } else {
            file = QUIZ_UPDATE_DATA_FILE;
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream(file);
             InputStreamReader reader = new InputStreamReader(is, StandardCharsets.UTF_8)) {

            Yaml yaml = new Yaml();
            Map<String, List<Map<String, Object>>> data = yaml.load(reader);
            List<Map<String, Object>> quizzesData = data.get("quizzes");

            List<QuizDomain> quizzes = quizzesData.stream()
                    .map(this::convertToQuiz)
                    .toList();

            quizRepository.saveAll(quizzes);
            log.info("Successfully loaded {} quizzes with UTF-8 encoding", quizzes.size());
        }
    }

    private QuizDomain convertToQuiz(Map<String, Object> quizData) {
        QuizDomain quiz = new QuizDomain();
        quiz.setQuestion((String) quizData.get("question"));
        quiz.setCorrectAnswer((Integer) quizData.get("correctAnswer"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> optionsData = (List<Map<String, Object>>) quizData.get("answerOptions");
        List<AnswerOptions> options = optionsData.stream()
                .map(optionData -> new AnswerOptions(
                        (Integer) optionData.get("label"),
                        (String) optionData.get("answerStr")
                ))
                .toList();

        quiz.setAnswerOptions(options);
        return quiz;
    }
}