package isep.labdsof.ecoloop.dtos;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class CreateUserDto {

    private String username;

    private String email;

    private String password;
}
