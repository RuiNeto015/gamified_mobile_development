package isep.labdsof.ecoloop.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginUserResponseDto {

    private String userId;
    private String avatarId;
    private String avatarToken;
    private String jwtToken;

    public LoginUserResponseDto(String userId, String avatarId, String avatarToken, String jwtToken) {
        this.userId = userId;
        this.avatarId = avatarId;
        this.avatarToken = avatarToken;
        this.jwtToken = jwtToken;
    }
}
