package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.quiz.QuizTokenUsed;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizTokenUsedRepository extends MongoRepository<QuizTokenUsed, String> {

}
