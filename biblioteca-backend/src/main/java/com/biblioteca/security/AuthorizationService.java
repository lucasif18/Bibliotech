package com.biblioteca.security;

import com.biblioteca.model.User;
import com.biblioteca.model.UserRole;
import org.springframework.stereotype.Service;

/**
 * Serviço centralizado para verificação de permissões.
 * Implementa a lógica de autorização do sistema.
 */
@Service
public class AuthorizationService {

    /**
     * Verifica se um usuário é administrador.
     */
    public boolean isAdmin(User user) {
        return user != null && user.getType() == User.UserType.ADMINISTRADOR;
    }

    /**
     * Verifica se um usuário é visitante.
     */
    public boolean isVisitor(User user) {
        return user != null && user.getType() == User.UserType.VISITANTE;
    }

    /**
     * Verifica se um usuário tem acesso de leitura/escrita.
     * Administradores têm acesso total, visitantes têm acesso restrito.
     */
    public boolean hasWriteAccess(User user) {
        return isAdmin(user);
    }

    /**
     * Verifica se um usuário pode acessar um recurso de outro usuário.
     * Administradores podem acessar qualquer recurso.
     * Visitantes podem acessar apenas seus próprios recursos.
     */
    public boolean canAccessUserResource(User currentUser, Long targetUserId) {
        if (currentUser == null) {
            return false;
        }
        return isAdmin(currentUser) || currentUser.getId().equals(targetUserId);
    }

    /**
     * Retorna o papel do usuário com base em seu tipo.
     */
    public UserRole getUserRole(User user) {
        if (user == null) {
            return null;
        }
        return UserRole.fromUserType(user.getType());
    }
}
