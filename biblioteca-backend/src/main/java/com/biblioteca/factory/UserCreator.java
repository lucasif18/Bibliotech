package com.biblioteca.factory;

import com.biblioteca.model.User;

/**
 * PADRÃO FACTORY METHOD
 *
 * Interface que declara o método fábrica para criação de usuários.
 * Cada implementação concreta sabe como instanciar e configurar
 * um tipo específico de usuário (Administrador, Visitante).
 */
public interface UserCreator {

    /**
     * Método fábrica — cria e retorna uma instância de {@link User}
     * com o tipo e atributos adequados para cada categoria.
     *
     * @param name  nome completo do usuário
     * @param email endereço de e-mail (único no sistema)
     * @return instância de {@link User} pronta para ser persistida
     */
    User create(String name, String email);
}
