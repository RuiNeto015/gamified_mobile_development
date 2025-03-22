package isep.labdsof.ecoloop.model.deviceToken;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("device_token_collection")
public class DeviceTokenDomain {

    @Id
    private String id;

    private String deviceToken;
}
