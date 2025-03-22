package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.dtos.DeviceTokenDto;
import isep.labdsof.ecoloop.model.deviceToken.DeviceTokenDomain;
import isep.labdsof.ecoloop.repositories.DeviceTokenRepository;
import org.springframework.stereotype.Service;

@Service
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    public DeviceTokenService(DeviceTokenRepository deviceTokenRepository, DeviceTokenRepository deviceTokenRepository1) {
        this.deviceTokenRepository = deviceTokenRepository1;
    }

    public boolean saveDeviceToken(DeviceTokenDto deviceTokenDto) {
        if (deviceTokenRepository.existsByDeviceToken(deviceTokenDto.getToken())) {
            return false;
        }
        DeviceTokenDomain deviceTokenDomain = new DeviceTokenDomain();
        deviceTokenDomain.setDeviceToken(deviceTokenDto.getToken());
        deviceTokenRepository.save(deviceTokenDomain);
        return true;
    }
}
