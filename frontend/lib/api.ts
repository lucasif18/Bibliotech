/**
 * API Service - Camada Facade para comunicação com o backend Spring Boot
 * 
 * Este módulo centraliza todas as chamadas HTTP para o backend,
 * seguindo o padrão Facade para encapsular a complexidade das requisições.
 */

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
  LoginDTO,
  LoginResponse,
  AuthUser,
  UpdateProfileDTO,
  UpdatePasswordDTO,
} from './types'

// URL base da API - configure conforme seu ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

/**
 * Classe de erro customizada para erros da API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Obtém o token de autenticação do localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Função utilitária para fazer requisições HTTP
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        errorData?.message || `Erro na requisição: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    // Se a resposta for 204 No Content, retorna undefined
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro de conexão com o servidor',
      0
    )
  }
}

/**
 * ============================================
 * LIVROS - Endpoints /livros
 * ============================================
 */
export const bookService = {
  /**
   * Lista todos os livros
   */
  async getAll(): Promise<Book[]> {
    return fetchApi<Book[]>('/livros')
  },

  /**
   * Busca um livro pelo ID
   */
  async getById(id: string): Promise<Book> {
    return fetchApi<Book>(`/livros/${id}`)
  },

  /**
   * Busca livros por categoria
   */
  async getByCategory(category: string): Promise<Book[]> {
    return fetchApi<Book[]>(`/livros?category=${encodeURIComponent(category)}`)
  },

  /**
   * Busca livros disponíveis
   */
  async getAvailable(): Promise<Book[]> {
    return fetchApi<Book[]>('/livros?available=true')
  },

  /**
   * Busca livros indisponíveis (para reservas)
   */
  async getUnavailable(): Promise<Book[]> {
    return fetchApi<Book[]>('/livros?available=false')
  },

  /**
   * Cria um novo livro
   */
  async create(data: CreateBookDTO): Promise<Book> {
    return fetchApi<Book>('/livros', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza um livro existente
   */
  async update(id: string, data: UpdateBookDTO): Promise<Book> {
    return fetchApi<Book>(`/livros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Remove um livro
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/livros/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * ============================================
 * USUÁRIOS - Endpoints /usuarios
 * ============================================
 */
export const userService = {
  /**
   * Lista todos os usuários
   */
  async getAll(): Promise<User[]> {
    return fetchApi<User[]>('/usuarios')
  },

  /**
   * Busca um usuário pelo ID
   */
  async getById(id: string): Promise<User> {
    return fetchApi<User>(`/usuarios/${id}`)
  },

  /**
   * Busca usuários por tipo
   */
  async getByType(type: string): Promise<User[]> {
    return fetchApi<User[]>(`/usuarios?type=${encodeURIComponent(type)}`)
  },

  /**
   * Cria um novo usuário
   */
  async create(data: CreateUserDTO): Promise<User> {
    return fetchApi<User>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza um usuário existente
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return fetchApi<User>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Remove um usuário
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * ============================================
 * EMPRÉSTIMOS - Endpoints /emprestimos
 * ============================================
 */
export const loanService = {
  /**
   * Lista todos os empréstimos
   */
  async getAll(): Promise<Loan[]> {
    return fetchApi<Loan[]>('/emprestimos')
  },

  /**
   * Busca um empréstimo pelo ID
   */
  async getById(id: string): Promise<Loan> {
    return fetchApi<Loan>(`/emprestimos/${id}`)
  },

  /**
   * Busca empréstimos por status
   */
  async getByStatus(status: string): Promise<Loan[]> {
    return fetchApi<Loan[]>(`/emprestimos?status=${encodeURIComponent(status)}`)
  },

  /**
   * Busca empréstimos de um usuário
   */
  async getByUser(userId: string): Promise<Loan[]> {
    return fetchApi<Loan[]>(`/emprestimos/usuario/${userId}`)
  },

  /**
   * Cria um novo empréstimo
   */
  async create(data: CreateLoanDTO): Promise<Loan> {
    return fetchApi<Loan>('/emprestimos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Registra a devolução de um empréstimo
   */
  async returnBook(id: string): Promise<Loan> {
    return fetchApi<Loan>(`/emprestimos/${id}/devolver`, {
      method: 'POST',
    })
  },

  /**
   * Remove um empréstimo (apenas para fins administrativos)
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/emprestimos/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * ============================================
 * RESERVAS - Endpoints /reservas
 * ============================================
 */
export const reservationService = {
  /**
   * Lista todas as reservas
   */
  async getAll(): Promise<Reservation[]> {
    return fetchApi<Reservation[]>('/reservas')
  },

  /**
   * Busca uma reserva pelo ID
   */
  async getById(id: string): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservas/${id}`)
  },

  /**
   * Busca reservas por status
   */
  async getByStatus(status: string): Promise<Reservation[]> {
    return fetchApi<Reservation[]>(`/reservas?status=${encodeURIComponent(status)}`)
  },

  /**
   * Cria uma nova reserva
   */
  async create(data: CreateReservationDTO): Promise<Reservation> {
    return fetchApi<Reservation>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Cancela uma reserva
   */
  async cancel(id: string): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservas/${id}/cancelar`, {
      method: 'PATCH',
    })
  },

  /**
   * Remove uma reserva
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/reservas/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * ============================================
 * NOTIFICAÇÕES - Endpoints /notificacoes
 * ============================================
 */
export const notificationService = {
  /**
   * Lista todas as notificações
   */
  async getAll(): Promise<Notification[]> {
    return fetchApi<Notification[]>('/notificacoes')
  },

  /**
   * Busca notificações não lidas
   */
  async getUnread(): Promise<Notification[]> {
    return fetchApi<Notification[]>('/notificacoes?read=false')
  },

  /**
   * Conta notificações não lidas
   */
  async countUnread(): Promise<number> {
    const data = await fetchApi<{ count: number }>('/notificacoes/count-unread')
    return data.count
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<Notification> {
    return fetchApi<Notification>(`/notificacoes/${id}/read`, {
      method: 'PATCH',
    })
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    return fetchApi<void>('/notificacoes/read-all', {
      method: 'PATCH',
    })
  },

  /**
   * Remove uma notificação
   */
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/notificacoes/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * ============================================
 * ATIVIDADES - Endpoints /atividades
 * ============================================
 */
export const activityService = {
  /**
   * Lista atividades recentes
   */
  async getRecent(limit: number = 10): Promise<Activity[]> {
    return fetchApi<Activity[]>(`/atividades?limit=${limit}`)
  },
}

/**
 * ============================================
 * DASHBOARD - Endpoints /dashboard
 * ============================================
 */
export const dashboardService = {
  /**
   * Obtém estatísticas do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    return fetchApi<DashboardStats>('/dashboard/stats')
  },
}

/**
 * ============================================
 * FACADE - API centralizada
 * ============================================
 */
/**
 * ============================================
 * AUTENTICAÇÃO - Endpoints /auth
 * ============================================
 */
export const authService = {
  /**
   * Realiza login do usuário
   */
  async login(data: LoginDTO): Promise<LoginResponse> {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // Salva o token no localStorage
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
    }
    return response
  },

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await fetchApi<void>('/auth/logout', { method: 'POST' })
    } finally {
      // Remove dados de autenticação independente do resultado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  },

  /**
   * Obtém o usuário logado
   */
  async getCurrentUser(): Promise<AuthUser> {
    return fetchApi<AuthUser>('/auth/me')
  },

  /**
   * Obtém usuário salvo localmente (sem requisição)
   */
  getLocalUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as AuthUser
    } catch {
      return null
    }
  },

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!getAuthToken()
  },

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(data: UpdateProfileDTO): Promise<AuthUser> {
    const response = await fetchApi<AuthUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    // Atualiza o usuário no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(response))
    }
    return response
  },

  /**
   * Atualiza a senha do usuário
   */
  async updatePassword(data: UpdatePasswordDTO): Promise<void> {
    return fetchApi<void>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

export const api = {
  auth: authService,
  books: bookService,
  users: userService,
  loans: loanService,
  reservations: reservationService,
  notifications: notificationService,
  activities: activityService,
  dashboard: dashboardService,
}

export default api
