package com.biblioteca.factory;

import com.biblioteca.model.User;
import org.springframework.stereotype.Component;

/**
 * PADRÃO FACTORY METHOD — Criador Concreto: Visitante
 *
 * Encapsula a lógica de criação de um usuário do tipo VISITANTE.
 * Visitantes podem ter até 2 empréstimos simultâneos.
 */
@Component("visitanteCreator")
public class VisitanteCreator implements UserCreator {

    @Override
    public User create(String name, String email) {
        return User.builder()
                .name(name)
                .email(email)
                .type(User.UserType.VISITANTE)
                .build();
    }
}
