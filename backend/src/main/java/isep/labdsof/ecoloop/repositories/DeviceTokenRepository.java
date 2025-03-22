package isep.labdsof.ecoloop.repositories;

import isep.labdsof.ecoloop.model.deviceToken.DeviceTokenDomain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceTokenRepository extends MongoRepository<DeviceTokenDomain, String> {
    boolean existsByDeviceToken(String deviceToken);
}
