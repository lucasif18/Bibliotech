package com.biblioteca.dto;

import com.biblioteca.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;

    public static AuthUserDTO fromUser(User user) {
        String role;
        switch (user.getType()) {
            case ADMINISTRADOR:
                role = "bibliotecario";
                break;
            case VISITANTE:
            default:
                role = "usuario";
        }

        return AuthUserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(role)
                .build();
    }
}
