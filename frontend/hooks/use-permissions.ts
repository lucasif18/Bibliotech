'use client'

import { useAuthContext } from '@/components/auth/auth-provider'
import { isAdmin, isVisitor, hasWriteAccess, canAccessUserResource, getAllowedRoutes, canAccessRoute } from '@/lib/permissions'
import type { AuthUser } from '@/lib/types'

/**
 * Hook para verificar permissões no frontend.
 * Centraliza todas as verificações de acesso.
 */
export function usePermissions() {
  const { user } = useAuthContext()

  return {
    user,
    isAdmin: () => isAdmin(user),
    isVisitor: () => isVisitor(user),
    hasWriteAccess: () => hasWriteAccess(user),
    canAccessUserResource: (userId: string | number) => canAccessUserResource(user, userId),
    getAllowedRoutes: () => getAllowedRoutes(user),
    canAccessRoute: (route: string) => canAccessRoute(user, route),
  }
}
