'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { api, ApiError } from '@/lib/api'
import type {
  Book,
  User,
  Loan,
  Reservation,
  Notification,
  Activity,
  DashboardStats,
  CreateBookDTO,
  UpdateBookDTO,
  CreateUserDTO,
  UpdateUserDTO,
  CreateLoanDTO,
  CreateReservationDTO,
  AuthUser,
  LoginDTO,
  UpdateProfileDTO,
  UpdatePasswordDTO,
} from '@/lib/types'

/**
 * Estado genérico para hooks de dados
 */
interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

/**
 * ============================================
 * HOOK: useBooks
 * ============================================
 */
export function useBooks() {
  const [state, setState] = useState<ApiState<Book[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchBooks = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.books.getAll()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar livros'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [])

  const createBook = useCallback(async (data: CreateBookDTO) => {
    try {
      await api.books.create(data)
      await fetchBooks()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar livro'
      return { success: false, error: message }
    }
  }, [fetchBooks])

  const updateBook = useCallback(async (id: string, data: UpdateBookDTO) => {
    try {
      await api.books.update(id, data)
      await fetchBooks()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar livro'
      return { success: false, error: message }
    }
  }, [fetchBooks])

  const deleteBook = useCallback(async (id: string) => {
    try {
      await api.books.delete(id)
      await fetchBooks()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover livro'
      return { success: false, error: message }
    }
  }, [fetchBooks])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return {
    books: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  }
}

/**
 * ============================================
 * HOOK: useUsers
 * ============================================
 */
export function useUsers() {
  const [state, setState] = useState<ApiState<User[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.users.getAll()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar usuários'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [])

  const createUser = useCallback(async (data: CreateUserDTO) => {
    try {
      await api.users.create(data)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar usuário'
      return { success: false, error: message }
    }
  }, [fetchUsers])

  const updateUser = useCallback(async (id: string, data: UpdateUserDTO) => {
    try {
      await api.users.update(id, data)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar usuário'
      return { success: false, error: message }
    }
  }, [fetchUsers])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await api.users.delete(id)
      await fetchUsers()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover usuário'
      return { success: false, error: message }
    }
  }, [fetchUsers])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

/**
 * ============================================
 * HOOK: useLoans
 * ============================================
 */
export function useLoans() {
  const [state, setState] = useState<ApiState<Loan[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchLoans = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.loans.getAll()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar empréstimos'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [])

  const createLoan = useCallback(async (data: CreateLoanDTO) => {
    try {
      await api.loans.create(data)
      await fetchLoans()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar empréstimo'
      return { success: false, error: message }
    }
  }, [fetchLoans])

  const returnBook = useCallback(async (id: string) => {
    try {
      await api.loans.returnBook(id)
      await fetchLoans()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao registrar devolução'
      return { success: false, error: message }
    }
  }, [fetchLoans])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  return {
    loans: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchLoans,
    createLoan,
    returnBook,
  }
}

/**
 * ============================================
 * HOOK: useLoansForCurrentUser
 * ============================================
 * Hook personalizado que carrega empréstimos baseado no tipo de usuário:
 * - Admin: vê todos os empréstimos
 * - Visitante: vê apenas seus próprios empréstimos
 */
export function useLoansForCurrentUser() {
  const { user } = useAuthContext()
  const [state, setState] = useState<ApiState<Loan[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchLoans = useCallback(async () => {
    if (!user) {
      setState({ data: [], isLoading: false, error: 'Usuário não autenticado' })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      let data: Loan[]

      if (user.type === 'administrador') {
        // Admin vê todos os empréstimos
        data = await api.loans.getAll()
      } else {
        // Visitante vê apenas seus empréstimos
        data = await api.loans.getByUser(user.id)
      }

      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar empréstimos'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [user])

  const createLoan = useCallback(async (data: CreateLoanDTO) => {
    try {
      await api.loans.create(data)
      await fetchLoans()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar empréstimo'
      return { success: false, error: message }
    }
  }, [fetchLoans])

  const returnBook = useCallback(async (id: string) => {
    try {
      await api.loans.returnBook(id)
      await fetchLoans()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao registrar devolução'
      return { success: false, error: message }
    }
  }, [fetchLoans])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  return {
    loans: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchLoans,
    createLoan,
    returnBook,
  }
}

/**
 * ============================================
 * HOOK: useReservations
 * ============================================
 */
export function useReservations() {
  const [state, setState] = useState<ApiState<Reservation[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchReservations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.reservations.getAll()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar reservas'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [])

  const createReservation = useCallback(async (data: CreateReservationDTO) => {
    try {
      await api.reservations.create(data)
      await fetchReservations()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar reserva'
      return { success: false, error: message }
    }
  }, [fetchReservations])

  const cancelReservation = useCallback(async (id: string) => {
    try {
      await api.reservations.cancel(id)
      await fetchReservations()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao cancelar reserva'
      return { success: false, error: message }
    }
  }, [fetchReservations])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  return {
    reservations: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchReservations,
    createReservation,
    cancelReservation,
  }
}

/**
 * ============================================
 * HOOK: useNotifications
 * ============================================
 */
export function useNotifications() {
  const [state, setState] = useState<ApiState<Notification[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.notifications.getAll()
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar notificações'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.notifications.markAsRead(id)
      await fetchNotifications()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao marcar como lida'
      return { success: false, error: message }
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllAsRead()
      await fetchNotifications()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao marcar todas como lidas'
      return { success: false, error: message }
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.notifications.delete(id)
      await fetchNotifications()
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover notificação'
      return { success: false, error: message }
    }
  }, [fetchNotifications])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications: state.data || [],
    unreadCount: state.data?.filter((n) => !n.read).length || 0,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

/**
 * ============================================
 * HOOK: useActivities
 * ============================================
 */
export function useActivities(limit: number = 10) {
  const [state, setState] = useState<ApiState<Activity[]>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchActivities = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.activities.getRecent(limit)
      setState({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar atividades'
      setState({ data: null, isLoading: false, error: message })
    }
  }, [limit])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return {
    activities: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchActivities,
  }
}

/**
 * ============================================
 * HOOK: useDashboard
 * ============================================
 */
export function useDashboard() {
  const [stats, setStats] = useState<ApiState<DashboardStats>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const { books, isLoading: booksLoading } = useBooks()
  const { activities, isLoading: activitiesLoading } = useActivities(5)
  const { loans, isLoading: loansLoading } = useLoans()

  const fetchStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const data = await api.dashboard.getStats()
      setStats({ data, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar estatísticas'
      setStats({ data: null, isLoading: false, error: message })
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats: stats.data,
    books: books.slice(0, 5),
    activities,
    loans,
    isLoading: stats.isLoading || booksLoading || activitiesLoading || loansLoading,
    error: stats.error,
    refetch: fetchStats,
  }
}

/**
 * ============================================
 * HOOK: useNotificationCount (para o header)
 * ============================================
 */
export function useNotificationCount() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCount = useCallback(async () => {
    try {
      const unreadCount = await api.notifications.countUnread()
      setCount(unreadCount)
    } catch {
      // Silently fail, count will stay at 0
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return { count, isLoading, refetch: fetchCount }
}

/**
 * ============================================
 * HOOK: useAuth
 * ============================================
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    const localUser = api.auth.getLocalUser()
    setUser(localUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: LoginDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.auth.login(data)
      setUser(response.user)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao fazer login'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await api.auth.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao fazer logout'
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: UpdateProfileDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await api.auth.updateProfile(data)
      setUser(updatedUser)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar perfil'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePassword = useCallback(async (data: UpdatePasswordDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.auth.updatePassword(data)
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao atualizar senha'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    updatePassword,
  }
}
