package isep.labdsof.ecoloop.dtos;

import lombok.Data;

@Data
public class CreateUserResponseDto {

    private String userId;
    private String token;

    public CreateUserResponseDto(String userId, String token) {
        this.userId = userId;
        this.token = token;
    }
}
