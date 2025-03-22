package isep.labdsof.ecoloop.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class QRCodeInfo {

    private String hash;

    private Date expiresAt;

    private String token;

}
