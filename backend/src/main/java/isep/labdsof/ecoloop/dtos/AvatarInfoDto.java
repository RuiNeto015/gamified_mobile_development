package isep.labdsof.ecoloop.dtos;

import isep.labdsof.ecoloop.model.avatar.AvatarInfoDomain;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AvatarInfoDto {

    public AvatarInfoDto(AvatarInfoDomain avatarInfo) {
        this.token = avatarInfo.getToken();
        this.avatarId = avatarInfo.getAvatarId();
    }

    private String token;

    private String avatarId;
}
