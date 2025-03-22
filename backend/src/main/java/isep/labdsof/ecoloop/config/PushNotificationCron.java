package isep.labdsof.ecoloop.config;

import isep.labdsof.ecoloop.services.FactNotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PushNotificationCron {

    private final FactNotificationService factNotificationService;

    public PushNotificationCron(FactNotificationService factNotificationService) {
        this.factNotificationService = factNotificationService;
    }

    @Scheduled(cron = "0 0 17 * * *")
    public void execute() throws Exception {
        System.out.println("Executing push notification cron");
        factNotificationService.notifyUsers();
    }
}
