package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.fact.FactDomain;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FactRepository extends MongoRepository<FactDomain, String> {

    @Aggregation(pipeline = "{ $sample: { size: 1 } }")
    Optional<FactDomain> findOneRandom();
}
