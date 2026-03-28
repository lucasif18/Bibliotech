'use client'

import { type ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'

/**
 * Componente que renderiza seu conteúdo apenas se o usuário for administrador.
 * Útil para esconder botões, seções ou páginas inteiras de usuários não-admin.
 *
 * @example
 * <AdminOnly>
 *   <Button>Deletar Usuário</Button>
 * </AdminOnly>
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = usePermissions()

  if (!isAdmin()) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente que renderiza seu conteúdo apenas se o usuário for visitante.
 *
 * @example
 * <VisitorOnly>
 *   <p>Você tem acesso restrito ao sistema</p>
 * </VisitorOnly>
 */
export function VisitorOnly({ children }: { children: ReactNode }) {
  const { isVisitor } = usePermissions()

  if (!isVisitor()) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente que renderiza um conjunto de elementos baseado em permissões de escrita.
 * Bastante útil para esconder todo um grupo de botões de ação.
 *
 * @example
 * <WriteAccessOnly>
 *   <Button>Editar</Button>
 *   <Button>Deletar</Button>
 * </WriteAccessOnly>
 */
export function WriteAccessOnly({ children }: { children: ReactNode }) {
  const { hasWriteAccess } = usePermissions()

  if (!hasWriteAccess()) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente que renderiza seu conteúdo apenas se o usuário puder acessar um recurso específico.
 * Perfeito para proteger detalhes de outros usuários.
 *
 * @param userId - ID do usuário proprietário do recurso
 * @param children - Conteúdo a renderizar
 *
 * @example
 * <UserResourceAccess userId={userId}>
 *   <Button>Editar Dados</Button>
 * </UserResourceAccess>
 */
export function UserResourceAccess({ userId, children }: { userId: string | number; children: ReactNode }) {
  const { canAccessUserResource } = usePermissions()

  if (!canAccessUserResource(userId)) {
    return null
  }

  return <>{children}</>
}
