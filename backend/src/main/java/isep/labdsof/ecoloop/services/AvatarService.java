package isep.labdsof.ecoloop.services;

import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.repositories.AssetItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvatarService {

    private final AssetItemRepository assetItemRepository;

    public AvatarService(AssetItemRepository assetItemRepository) {
        this.assetItemRepository = assetItemRepository;
    }

    public List<AssetItem> getAssetsList(List<String> ids) {
        return assetItemRepository.findAllById(ids);
    }

}
