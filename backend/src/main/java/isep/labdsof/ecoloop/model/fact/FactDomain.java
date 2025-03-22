package isep.labdsof.ecoloop.model.fact;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("fact_collection")
public class FactDomain {

    @Id
    private String id;

    private String fact;
}
