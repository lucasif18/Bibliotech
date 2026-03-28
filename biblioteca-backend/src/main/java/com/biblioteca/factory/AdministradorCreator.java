package com.biblioteca.factory;

import com.biblioteca.model.User;
import org.springframework.stereotype.Component;

/**
 * PADRÃO FACTORY METHOD — Criador Concreto: Administrador
 *
 * Encapsula a lógica de criação de um usuário do tipo ADMINISTRADOR.
 * Administradores podem ter até 10 empréstimos simultâneos.
 */
@Component("administradorCreator")
public class AdministradorCreator implements UserCreator {

    @Override
    public User create(String name, String email) {
        return User.builder()
                .name(name)
                .email(email)
                .type(User.UserType.ADMINISTRADOR)
                .build();
    }
}
