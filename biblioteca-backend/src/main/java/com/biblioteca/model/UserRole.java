package com.biblioteca.model;

/**
 * Enum com os papéis de usuário no sistema.
 * 
 * ADMINISTRADOR: Acesso total ao sistema.
 * VISITANTE: Acesso restrito (apenas visualização de seus próprios empréstimos, perfil e login/logout).
 */
public enum UserRole {
    ADMINISTRADOR("administrador", "Acesso total ao sistema"),
    VISITANTE("visitante", "Acesso restrito");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static UserRole fromUserType(User.UserType type) {
        return type == User.UserType.ADMINISTRADOR ? ADMINISTRADOR : VISITANTE;
    }
}
