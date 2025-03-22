package isep.labdsof.ecoloop.bootstrap;

import isep.labdsof.ecoloop.model.fact.FactDomain;
import isep.labdsof.ecoloop.repositories.FactRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Configuration
@Slf4j
public class FactBootstrap implements CommandLineRunner {

    private final FactRepository factRepository;

    private static final String FACT_DATA_FILE = "bootstrap/fact-data.yml";

    public FactBootstrap(FactRepository factRepository) {
        this.factRepository = factRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (factRepository.count() == 0) {
            loadFacts();
        }
    }

    private void loadFacts() throws IOException {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(FACT_DATA_FILE);
             InputStreamReader reader = new InputStreamReader(is, StandardCharsets.UTF_8)) {

            Yaml yaml = new Yaml();
            Map<String, List<String>> data = yaml.load(reader);
            List<String> factsData = data.get("facts");

            List<FactDomain> facts = factsData.stream()
                    .map(this::convertToFact)
                    .toList();

            factRepository.saveAll(facts);
            log.info("Successfully loaded {} facts with UTF-8 encoding", facts.size());
        }
    }

    private FactDomain convertToFact(String fact) {
        FactDomain factDomain = new FactDomain();
        factDomain.setFact(fact);
        return factDomain;
    }
}
