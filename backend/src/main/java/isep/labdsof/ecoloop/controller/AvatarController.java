package isep.labdsof.ecoloop.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import isep.labdsof.ecoloop.dtos.GiftResponseDto;
import isep.labdsof.ecoloop.dtos.IdsRequest;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.model.avatar.AssetItem;
import isep.labdsof.ecoloop.services.AvatarService;
import isep.labdsof.ecoloop.services.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Avatar Controller", description = "Endpoint for handling the logic related to the avatar")
@RestController
    @RequestMapping(path = "/avatar")
public class AvatarController {

    private final AvatarService avatarService;

    private final UserService userService;


    public AvatarController(AvatarService avatarService, UserService userService) {
        this.avatarService = avatarService;
        this.userService = userService;
    }

    @PostMapping("/getByList")
    public List<AssetItem> getByList(@RequestBody IdsRequest idList) {
        return avatarService.getAssetsList(idList.getIds());
    }

    @GetMapping("/unlocking")
    public List<Map<String, List<Integer>>> getUnlocking(@RequestParam String userId) throws NotFoundException {
        return userService.getUserInfo(userId).getUnlockingAssets();
    }

    @GetMapping("/getGift")
    public GiftResponseDto getGiftItemPart(@RequestParam String userId) throws NotFoundException {
        return userService.getGift(userId);
    }
}
