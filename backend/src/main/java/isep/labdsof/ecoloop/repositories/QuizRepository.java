package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.quiz.QuizDomain;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizRepository extends MongoRepository<QuizDomain, String> {

    @Aggregation(pipeline = "{ $sample: { size: 1 } }")
    Optional<QuizDomain> findOneRandom();

}
