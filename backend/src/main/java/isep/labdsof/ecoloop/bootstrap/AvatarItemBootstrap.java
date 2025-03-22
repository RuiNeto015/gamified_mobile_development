package isep.labdsof.ecoloop.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.repositories.AssetItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.util.List;

@Configuration
public class AvatarItemBootstrap implements CommandLineRunner {

    private final AssetItemRepository assetItemRepository;

    private final ObjectMapper objectMapper;

    private final static String password = "password";

    public AvatarItemBootstrap(AssetItemRepository assetItemRepository, ObjectMapper objectMapper) {
        this.assetItemRepository = assetItemRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        ClassPathResource resource = new ClassPathResource("/bootstrap/assets.json");

        if (assetItemRepository.count() > 0) {
            return;
        }

        List<AssetItem> assetItemList = objectMapper.readValue(resource.getFile(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, AssetItem.class));

        assetItemRepository.saveAll(assetItemList);
    }

}