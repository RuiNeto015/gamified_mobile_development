package isep.labdsof.ecoloop.dtos;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class LoginUserDto {

    private String email;

    private String password;
}
