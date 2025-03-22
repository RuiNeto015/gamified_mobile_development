package isep.labdsof.ecoloop.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecycleResponse {

    private UserDto updatedUser;

    private int xpEarned;

    private String token;

    private long expireAt;

}
