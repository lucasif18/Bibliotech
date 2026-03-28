/**
 * Utilitários centralizados para verificação de permissões.
 * Use estas funções para controlar o acesso a funcionalidades.
 */

import type { AuthUser } from './types'

/**
 * Verifica se o usuário é administrador.
 * @param user - Usuário autenticado
 * @returns true se o usuário é administrador
 */
export function isAdmin(user: AuthUser | null): user is AuthUser {
  return user?.type === 'administrador'
}

/**
 * Verifica se o usuário é visitante.
 * @param user - Usuário autenticado
 * @returns true se o usuário é visitante
 */
export function isVisitor(user: AuthUser | null): boolean {
  return user?.type === 'visitante'
}

/**
 * Verifica se um usuário tem permissão de escrita (criar, editar, deletar).
 * Apenas administradores têm permissão de escrita.
 * @param user - Usuário autenticado
 * @returns true se o usuário pode escrever
 */
export function hasWriteAccess(user: AuthUser | null): boolean {
  return isAdmin(user)
}

/**
 * Verifica se um usuário pode acessar um recurso de outro usuário.
 * Administradores podem acessar qualquer recurso.
 * Visitantes podem acessar apenas seus próprios recursos.
 * @param user - Usuário autenticado
 * @param targetUserId - ID do usuário proprietário do recurso
 * @returns true se o usuário pode acessar o recurso
 */
export function canAccessUserResource(user: AuthUser | null, targetUserId: string | number): boolean {
  if (!user) {
    return false
  }
  
  const userId = String(user.id)
  const targetId = String(targetUserId)
  
  return isAdmin(user) || userId === targetId
}

/**
 * Obtém a lista de rotas que um usuário pode acessar.
 * @param user - Usuário autenticado
 * @returns Array com as rotas permitidas
 */
export function getAllowedRoutes(user: AuthUser | null): string[] {
  const baseRoutes = ['/dashboard', '/perfil', '/emprestimos', '/notificacoes', '/login', '/logout']
  
  if (isAdmin(user)) {
    return [...baseRoutes, '/livros', '/usuarios', '/reservas']
  }
  
  return baseRoutes
}

/**
 * Verifica se um usuário pode acessar uma rota específica.
 * @param user - Usuário autenticado
 * @param route - Rota a verificar
 * @returns true se o usuário pode acessar a rota
 */
export function canAccessRoute(user: AuthUser | null, route: string): boolean {
  return getAllowedRoutes(user).includes(route)
}
