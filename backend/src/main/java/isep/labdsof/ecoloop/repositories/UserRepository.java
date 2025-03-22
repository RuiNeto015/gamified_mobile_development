package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.UserDomain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserDomain, String> {

    Optional<UserDomain> findByUsername(String username);

    Optional<UserDomain> findByEmail(String email);

    Optional<UserDomain> findByEmailAndPassword(String email, String password);
}
