package com.biblioteca.factory;

import com.biblioteca.model.User;
import org.springframework.stereotype.Component;

/**
 * PADRÃO FACTORY METHOD — Criador Concreto: Professor
 *
 * Encapsula a lógica de criação de um usuário do tipo PROFESSOR.
 * Professores podem ter até 10 empréstimos simultâneos.
 */
@Component("professorCreator")
public class ProfessorCreator implements UserCreator {

    @Override
    public User create(String name, String email) {
        return User.builder()
                .name(name)
                .email(email)
                .type(User.UserType.PROFESSOR)
                .build();
    }
}
