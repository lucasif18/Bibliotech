'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { AuthUser, LoginDTO, UpdateProfileDTO, UpdatePasswordDTO } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginDTO) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfileDTO) => Promise<{ success: boolean; error?: string }>
  updatePassword: (data: UpdatePasswordDTO) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login']

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica autenticação na inicialização
  useEffect(() => {
    const localUser = api.auth.getLocalUser()
    const isAuthenticated = api.auth.isAuthenticated()
    
    if (isAuthenticated && localUser) {
      setUser(localUser)
    }
    
    setIsLoading(false)
  }, [])

  // Redireciona baseado no estado de autenticação
  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = publicRoutes.includes(pathname)
    const isAuthenticated = !!user

    if (!isAuthenticated && !isPublicRoute) {
      // Usuário não autenticado tentando acessar rota protegida
      router.push('/login')
    } else if (isAuthenticated && pathname === '/login') {
      // Usuário autenticado na página de login, redireciona baseado no tipo
      if (user.type === 'visitante') {
        router.push('/welcome')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = useCallback(async (data: LoginDTO) => {
    setIsLoading(true)
    try {
      const response = await api.auth.login(data)
      setUser(response.user)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao fazer login'
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.auth.logout()
    } finally {
      setUser(null)
      setIsLoading(false)
      router.push('/login')
    }
  }, [router])

  const updateProfile = useCallback(async (data: UpdateProfileDTO) => {
    try {
      const updatedUser = await api.auth.updateProfile(data)
      setUser(updatedUser)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar perfil'
      return { success: false, error: message }
    }
  }, [])

  const updatePassword = useCallback(async (data: UpdatePasswordDTO) => {
    try {
      await api.auth.updatePassword(data)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar senha'
      return { success: false, error: message }
    }
  }, [])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não autenticado e não está em rota pública, não renderiza nada (vai redirecionar)
  const isPublicRoute = publicRoutes.includes(pathname)
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
