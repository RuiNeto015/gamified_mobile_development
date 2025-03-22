package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.model.UserDomain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetItemRepository extends MongoRepository<AssetItem, String> {

}
