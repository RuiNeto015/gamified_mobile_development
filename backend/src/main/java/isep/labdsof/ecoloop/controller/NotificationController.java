package isep.labdsof.ecoloop.controller;

import isep.labdsof.ecoloop.dtos.DeviceTokenDto;
import isep.labdsof.ecoloop.services.DeviceTokenService;
import isep.labdsof.ecoloop.services.FactNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final FactNotificationService factNotificationService;

    private final DeviceTokenService deviceTokenService;

    @Autowired
    public NotificationController(FactNotificationService factNotificationService,
                                  DeviceTokenService deviceTokenService) {

        this.factNotificationService = factNotificationService;
        this.deviceTokenService = deviceTokenService;
    }

    @GetMapping("/manually-notify-with-fact")
    public ResponseEntity<Void> notifyWithFact() throws Exception {
        factNotificationService.notifyUsers();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/device-token")
    public ResponseEntity<Void> saveDeviceToken(@RequestBody DeviceTokenDto deviceTokenDto) {
        boolean saved = deviceTokenService.saveDeviceToken(deviceTokenDto);

        if (!saved) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }
}
