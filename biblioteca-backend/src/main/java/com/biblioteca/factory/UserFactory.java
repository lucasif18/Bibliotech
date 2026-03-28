package com.biblioteca.factory;

import com.biblioteca.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * PADRÃO FACTORY METHOD — Fábrica Central
 *
 * Coordena qual {@link UserCreator} concreto deve ser usado.
 * O cliente (Service) interage apenas com esta classe,
 * sem conhecer as implementações concretas — garantindo
 * extensibilidade (Open/Closed Principle).
 *
 * Para adicionar um novo tipo de usuário basta:
 *   1. Criar um novo {@link UserCreator} anotado com @Component
 *   2. Incluir o mapeamento no {@code creators} abaixo
 */
@Component
@RequiredArgsConstructor
public class UserFactory {

    private final Map<String, UserCreator> creators;

    /**
     * Cria um usuário com base no tipo informado.
     *
     * @param type  "administrador" ou "visitante" (case-insensitive)
     * @param name  nome do usuário
     * @param email e-mail do usuário
     * @return instância de {@link User} pronta para persistência
     */
    public User createUser(String type, String name, String email) {
        String key = type.toLowerCase() + "Creator";
        UserCreator creator = creators.get(key);
        if (creator == null) {
            throw new IllegalArgumentException(
                    "Tipo de usuário inválido: '%s'. Use: administrador ou visitante.".formatted(type));
        }
        return creator.create(name, email);
    }
}
