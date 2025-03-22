package isep.labdsof.ecoloop.dtos;

import isep.labdsof.ecoloop.model.avatar.AssetItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GiftResponseDto {

    private AssetItem item;
    private int part;
    private List<Integer> unlockedParts;
}
