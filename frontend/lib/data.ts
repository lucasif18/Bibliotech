/**
 * @deprecated Este arquivo contém dados mockados legados.
 * 
 * A aplicação agora utiliza a API REST do backend Spring Boot.
 * Veja lib/api.ts para a camada de serviço e hooks/use-api.ts para os hooks de dados.
 * 
 * Os tipos foram movidos para lib/types.ts
 * As categorias estão disponíveis em lib/types.ts
 * 
 * Este arquivo é mantido apenas para referência e fallback durante o desenvolvimento.
 * Remova completamente quando o backend estiver 100% funcional.
 */

// Re-exportar tipos do novo arquivo
export * from './types'

// Dados mockados para fallback/desenvolvimento
// Estes dados podem ser usados quando o backend não estiver disponível

import type { Book, User, Loan, Reservation, Notification, Activity } from './types'

/**
 * @deprecated Use api.books.getAll() do lib/api.ts
 */
export const mockBooks: Book[] = [
  { id: '1', title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Literatura Brasileira', isbn: '978-85-359-0277-1', quantity: 5, available: 3, status: 'disponivel' },
  { id: '2', title: '1984', author: 'George Orwell', category: 'Ficção Científica', isbn: '978-85-359-0278-8', quantity: 3, available: 0, status: 'emprestado' },
  { id: '3', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', category: 'Fantasia', isbn: '978-85-359-0279-5', quantity: 4, available: 2, status: 'disponivel' },
  { id: '4', title: 'Clean Code', author: 'Robert C. Martin', category: 'Tecnologia', isbn: '978-85-359-0280-1', quantity: 2, available: 1, status: 'disponivel' },
  { id: '5', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', category: 'Infantil', isbn: '978-85-359-0281-8', quantity: 6, available: 4, status: 'disponivel' },
]

/**
 * @deprecated Use api.users.getAll() do lib/api.ts
 */
export const mockUsers: User[] = [
  { id: '1', name: 'Carlos Oliveira', email: 'carlos.oliveira@email.com', type: 'administrador', createdAt: '2024-02-20' },
  { id: '2', name: 'João Ferreira', email: 'joao.ferreira@email.com', type: 'visitante', createdAt: '2024-04-05' },
]

/**
 * @deprecated Use api.loans.getAll() do lib/api.ts
 */
export const mockLoans: Loan[] = [
  { id: '1', userId: '1', userName: 'Carlos Oliveira', bookId: '6', bookTitle: 'Harry Potter', loanDate: '2024-02-20', returnDate: '2024-03-05', status: 'atrasado' },
]

/**
 * @deprecated Use api.reservations.getAll() do lib/api.ts
 */
export const mockReservations: Reservation[] = [
  { id: '1', userId: '3', userName: 'Maria Santos', bookId: '2', bookTitle: '1984', reservationDate: '2024-03-10', status: 'pendente' },
]

/**
 * @deprecated Use api.notifications.getAll() do lib/api.ts
 */
export const mockNotifications: Notification[] = [
  { id: '1', title: 'Livro Disponível', message: 'O livro que você reservou está disponível.', type: 'success', read: false, createdAt: '2024-03-15T10:30:00' },
  { id: '2', title: 'Empréstimo Atrasado', message: 'Seu empréstimo está atrasado.', type: 'warning', read: false, createdAt: '2024-03-14T09:00:00' },
]

/**
 * @deprecated Use api.activities.getRecent() do lib/api.ts
 */
export const mockActivities: Activity[] = [
  { id: '1', action: 'Empréstimo', description: 'Ana Silva emprestou "1984"', timestamp: '2024-03-15T14:30:00' },
  { id: '2', action: 'Devolução', description: 'Maria Santos devolveu "Dom Casmurro"', timestamp: '2024-03-15T11:20:00' },
]
