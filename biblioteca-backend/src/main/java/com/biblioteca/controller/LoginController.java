package com.biblioteca.controller;

import com.biblioteca.dto.*;
import com.biblioteca.model.User;
import com.biblioteca.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        UserDTO user = userService.authenticate(request.getEmail(), request.getPassword());

        String rawToken = "user:" + user.getId();
        String token = Base64.getEncoder().encodeToString(rawToken.getBytes(StandardCharsets.UTF_8));

        AuthUserDTO authUser = AuthUserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(mapTypeToRole(user.getType()))
                .type(user.getType().toString().toLowerCase())
                .build();

        return ResponseEntity.ok(LoginResponseDTO.builder()  
                .user(authUser)
                .token(token)
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserDTO> me(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        return getAuthUserFromHeader(authorization)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthUserDTO> updateProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                                      @Valid @RequestBody UpdateProfileDTO request) {
        return getUserIdFromBearerToken(authorization)
                .map(id -> {
                    UserDTO updated = userService.updateProfile(id, request.getName());
                    AuthUserDTO authUser = AuthUserDTO.builder()
                            .id(updated.getId())
                            .name(updated.getName())
                            .email(updated.getEmail())
                            .role(mapTypeToRole(updated.getType()))
                            .type(updated.getType().toString().toLowerCase())
                            .build();
                    return ResponseEntity.ok(authUser);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                               @Valid @RequestBody UpdatePasswordDTO request) {
        var userId = getUserIdFromBearerToken(authorization);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        userService.updatePassword(userId.get(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    private String mapTypeToRole(String type) {
        if ("administrador".equalsIgnoreCase(type)) {
            return "bibliotecario";
        }
        return "usuario";
    }

    private java.util.Optional<Long> getUserIdFromBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return java.util.Optional.empty();
        }
        String token = authorization.substring(7);
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            if (!decoded.startsWith("user:")) {
                return java.util.Optional.empty();
            }
            return java.util.Optional.of(Long.parseLong(decoded.substring(5)));
        } catch (Exception e) {
            return java.util.Optional.empty();
        }
    }

    private java.util.Optional<AuthUserDTO> getAuthUserFromHeader(String authorization) {
        return getUserIdFromBearerToken(authorization)
                .map(userService::findEntityById)
                .map(AuthUserDTO::fromUser);
    }
}

