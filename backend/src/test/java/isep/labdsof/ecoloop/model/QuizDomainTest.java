package isep.labdsof.ecoloop.model;

import isep.labdsof.ecoloop.model.quiz.AnswerOptions;
import isep.labdsof.ecoloop.model.quiz.QuizDomain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class QuizDomainTest {

    private QuizDomain quizDomain;

    @BeforeEach
    void setUp() {
        quizDomain = new QuizDomain();
    }

    @Test
    void testSetAndGetId() {
        quizDomain.setId("quiz123");
        assertEquals("quiz123", quizDomain.getId());
    }

    @Test
    void testSetAndGetQuestion() {
        quizDomain.setQuestion("What is the capital of France?");
        assertEquals("What is the capital of France?", quizDomain.getQuestion());
    }

    @Test
    void testSetAndGetAnswerOptions() {
        AnswerOptions option1 = new AnswerOptions(1, "Paris");
        AnswerOptions option2 = new AnswerOptions(2, "London");

        quizDomain.setAnswerOptions(Arrays.asList(option1, option2));

        assertEquals(2, quizDomain.getAnswerOptions().size());
        assertEquals(1, quizDomain.getAnswerOptions().get(0).getLabel());
        assertEquals("Paris", quizDomain.getAnswerOptions().get(0).getAnswerStr());
        assertEquals(2, quizDomain.getAnswerOptions().get(1).getLabel());
        assertEquals("London", quizDomain.getAnswerOptions().get(1).getAnswerStr());
    }

    @Test
    void testSetAndGetCorrectAnswer() {
        quizDomain.setCorrectAnswer(1);
        assertEquals(1, quizDomain.getCorrectAnswer());
    }

    @Test
    void testDefaultValues() {
        // Check default values initialized by Lombok
        assertNull(quizDomain.getId());
        assertNull(quizDomain.getQuestion());
        assertNull(quizDomain.getAnswerOptions());
        assertEquals(0, quizDomain.getCorrectAnswer());
    }
}