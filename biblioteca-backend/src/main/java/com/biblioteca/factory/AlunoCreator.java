package com.biblioteca.factory;

import com.biblioteca.model.User;
import org.springframework.stereotype.Component;

/**
 * PADRÃO FACTORY METHOD — Criador Concreto: Aluno
 *
 * Encapsula a lógica de criação de um usuário do tipo ALUNO.
 * Alunos podem ter até 5 empréstimos simultâneos.
 */
@Component("alunoCreator")
public class AlunoCreator implements UserCreator {

    @Override
    public User create(String name, String email) {
        return User.builder()
                .name(name)
                .email(email)
                .type(User.UserType.ALUNO)
                .build();
    }
}
