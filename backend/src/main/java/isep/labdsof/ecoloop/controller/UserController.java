package isep.labdsof.ecoloop.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import isep.labdsof.ecoloop.dtos.*;
import isep.labdsof.ecoloop.exceptions.NotFoundException;
import isep.labdsof.ecoloop.exceptions.UnauthorizedException;
import isep.labdsof.ecoloop.services.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Controller", description = "Endpoint for handling the logic related to the user")
@RestController
@RequestMapping(path = "/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<CreateUserResponseDto> register(@RequestBody final CreateUserDto request) {
        CreateUserResponseDto response = userService.createUser(request.getUsername(), request.getEmail(),
                request.getPassword());

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.getToken())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginUserResponseDto> login(@RequestBody final LoginUserDto request) {
        LoginUserResponseDto response = userService.loginUser(request.getEmail(), request.getPassword());

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + response.getJwtToken())
                .body(response);
    }

    @PostMapping("/addAvatarInfo")
    public UserDto addAvatarInfo(
            @RequestParam String userId,
            @RequestParam String token,
            @RequestParam String avatarId
    ) throws IllegalArgumentException, NotFoundException {
        return userService.addAvatarInfoToUser(userId, token, avatarId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserInfo(@PathVariable String id) throws NotFoundException {
        UserDto quiz = userService.getUserInfo(id);
        return new ResponseEntity<>(quiz, HttpStatus.OK);
    }

    @GetMapping("/{id}/recycle")
    public ResponseEntity<RecycleResponse> recycle(
            @PathVariable String id,
            @RequestParam("qr") String qrString
    ) throws NotFoundException {
        RecycleResponse quiz = userService.recycle(id, qrString);
        return new ResponseEntity<>(quiz, HttpStatus.OK);
    }

    @GetMapping("/{id}/respond-quiz")
    public ResponseEntity<QuizResultResponse> respondQuiz(
            @PathVariable String id,
            @RequestParam("token") String token,
            @RequestParam("question") String question,
            @RequestParam("answer") int answer
    ) throws NotFoundException, UnauthorizedException {
        QuizResultResponse quiz = userService.respondQuiz(id, token, question, answer);
        return new ResponseEntity<>(quiz, HttpStatus.OK);
    }

    @GetMapping("/{id}/redeem")
    public ResponseEntity<Void> redeem(
            @PathVariable String id, @RequestParam("level") int level
    ) throws NotFoundException {
        this.userService.redeem(id, level);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{id}/update-items")
    public ResponseEntity<Void> redeem(
            @PathVariable String id, @RequestBody IdsRequest ids
    ) throws NotFoundException {
        this.userService.updateUsingItems(id, ids.getIds());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/sendItem")
    public ResponseEntity<Void> sendItem(
            @RequestBody SendItemDto body
    ) throws NotFoundException {
        this.userService.sendItem(body.getSendingUserId(), body.getReceivingUsername(), body.getItemId());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{id}/visit")
    public ResponseEntity<Void> sendItem(@PathVariable String id) throws NotFoundException {
        this.userService.visit(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{id}/takeReward")
    public ResponseEntity<Void> removeVisit(@PathVariable String id) throws NotFoundException {
        this.userService.removeVisit(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
