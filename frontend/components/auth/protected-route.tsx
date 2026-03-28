'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'
import { Spinner } from '@/components/ui/spinner'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: 'admin' | 'write' | null
}

/**
 * Componente wrapper para rotas protegidas.
 * Protege uma página inteira de acesso não autorizado.
 *
 * @param children - Conteúdo da página
 * @param requiredPermission - Permissão necessária ('admin' ou 'write', null para qualquer autenticado)
 *
 * @example
 * // Apenas administradores podem acessar
 * <ProtectedRoute requiredPermission="admin">
 *   <UsuariosPage />
 * </ProtectedRoute>
 *
 * @example
 * // Qualquer usuário autenticado pode acessar, mas precisam de permissão de escrita para editar
 * <ProtectedRoute requiredPermission="write">
 *   <EditLoanPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredPermission = null }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAdmin, hasWriteAccess } = usePermissions()

  useEffect(() => {
    // Se não há usuário, AuthProvider já redireciona para login
    if (!user) {
      return
    }

    // Verifica permissões específicas
    if (requiredPermission === 'admin' && !isAdmin()) {
      router.push('/dashboard')
      return
    }

    if (requiredPermission === 'write' && !hasWriteAccess()) {
      router.push('/dashboard')
      return
    }
  }, [user, requiredPermission, isAdmin, hasWriteAccess, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se precisa de permissão específica e não tem, ainda mostra loading enquanto redireciona
  if (requiredPermission === 'admin' && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Acesso negado. Redirecionando...</p>
        </div>
      </div>
    )
  }

  if (requiredPermission === 'write' && !hasWriteAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Acesso negado. Redirecionando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
