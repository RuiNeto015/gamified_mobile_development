package isep.labdsof.ecoloop.dtos;

import lombok.Data;

import java.util.List;

@Data
public class IdsRequest {
    private List<String> ids;
}