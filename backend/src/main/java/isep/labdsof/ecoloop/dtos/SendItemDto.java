package isep.labdsof.ecoloop.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SendItemDto {

    private String sendingUserId;

    private String receivingUsername;

    private String itemId;
}
