// Tipos
export interface Book {
  id: string
  title: string
  author: string
  category: string
  isbn: string
  quantity: number
  available: number
  status: 'disponivel' | 'emprestado'
}

export interface User {
  id: string
  name: string
  email: string
  type: 'aluno' | 'professor' | 'visitante'
  createdAt: string
}

export interface Loan {
  id: string
  userId: string
  userName: string
  bookId: string
  bookTitle: string
  loanDate: string
  returnDate: string
  status: 'ativo' | 'atrasado' | 'finalizado'
}

export interface Reservation {
  id: string
  userId: string
  userName: string
  bookId: string
  bookTitle: string
  reservationDate: string
  status: 'pendente' | 'disponivel' | 'cancelada'
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success'
  read: boolean
  createdAt: string
}

export interface Activity {
  id: string
  action: string
  description: string
  timestamp: string
}

// Dados Mockados
export const books: Book[] = [
  { id: '1', title: 'Dom Casmurro', author: 'Machado de Assis', category: 'Literatura Brasileira', isbn: '978-85-359-0277-1', quantity: 5, available: 3, status: 'disponivel' },
  { id: '2', title: '1984', author: 'George Orwell', category: 'Ficção Científica', isbn: '978-85-359-0278-8', quantity: 3, available: 0, status: 'emprestado' },
  { id: '3', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', category: 'Fantasia', isbn: '978-85-359-0279-5', quantity: 4, available: 2, status: 'disponivel' },
  { id: '4', title: 'Clean Code', author: 'Robert C. Martin', category: 'Tecnologia', isbn: '978-85-359-0280-1', quantity: 2, available: 1, status: 'disponivel' },
  { id: '5', title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', category: 'Infantil', isbn: '978-85-359-0281-8', quantity: 6, available: 4, status: 'disponivel' },
  { id: '6', title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', category: 'Fantasia', isbn: '978-85-359-0282-5', quantity: 8, available: 0, status: 'emprestado' },
  { id: '7', title: 'A Arte da Guerra', author: 'Sun Tzu', category: 'Estratégia', isbn: '978-85-359-0283-2', quantity: 3, available: 2, status: 'disponivel' },
  { id: '8', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'História', isbn: '978-85-359-0284-9', quantity: 4, available: 1, status: 'disponivel' },
]

export const users: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@email.com', type: 'aluno', createdAt: '2024-01-15' },
  { id: '2', name: 'Carlos Oliveira', email: 'carlos.oliveira@email.com', type: 'professor', createdAt: '2024-02-20' },
  { id: '3', name: 'Maria Santos', email: 'maria.santos@email.com', type: 'aluno', createdAt: '2024-03-10' },
  { id: '4', name: 'João Ferreira', email: 'joao.ferreira@email.com', type: 'visitante', createdAt: '2024-04-05' },
  { id: '5', name: 'Beatriz Lima', email: 'beatriz.lima@email.com', type: 'aluno', createdAt: '2024-05-12' },
  { id: '6', name: 'Pedro Costa', email: 'pedro.costa@email.com', type: 'professor', createdAt: '2024-06-18' },
]

export const loans: Loan[] = [
  { id: '1', userId: '1', userName: 'Ana Silva', bookId: '2', bookTitle: '1984', loanDate: '2024-03-01', returnDate: '2024-03-15', status: 'ativo' },
  { id: '2', userId: '2', userName: 'Carlos Oliveira', bookId: '6', bookTitle: 'Harry Potter e a Pedra Filosofal', loanDate: '2024-02-20', returnDate: '2024-03-05', status: 'atrasado' },
  { id: '3', userId: '3', userName: 'Maria Santos', bookId: '1', bookTitle: 'Dom Casmurro', loanDate: '2024-02-10', returnDate: '2024-02-24', status: 'finalizado' },
  { id: '4', userId: '5', userName: 'Beatriz Lima', bookId: '4', bookTitle: 'Clean Code', loanDate: '2024-03-05', returnDate: '2024-03-19', status: 'ativo' },
  { id: '5', userId: '4', userName: 'João Ferreira', bookId: '3', bookTitle: 'O Senhor dos Anéis', loanDate: '2024-03-08', returnDate: '2024-03-22', status: 'ativo' },
]

export const reservations: Reservation[] = [
  { id: '1', userId: '3', userName: 'Maria Santos', bookId: '2', bookTitle: '1984', reservationDate: '2024-03-10', status: 'pendente' },
  { id: '2', userId: '5', userName: 'Beatriz Lima', bookId: '6', bookTitle: 'Harry Potter e a Pedra Filosofal', reservationDate: '2024-03-12', status: 'pendente' },
  { id: '3', userId: '1', userName: 'Ana Silva', bookId: '8', bookTitle: 'Sapiens', reservationDate: '2024-03-08', status: 'disponivel' },
]

export const notifications: Notification[] = [
  { id: '1', title: 'Livro Disponível', message: 'O livro "Sapiens" que você reservou está disponível para retirada.', type: 'success', read: false, createdAt: '2024-03-15T10:30:00' },
  { id: '2', title: 'Empréstimo Atrasado', message: 'O empréstimo de "Harry Potter" está atrasado. Por favor, devolva o mais rápido possível.', type: 'warning', read: false, createdAt: '2024-03-14T09:00:00' },
  { id: '3', title: 'Novo Livro Adicionado', message: 'O livro "O Alquimista" foi adicionado ao acervo da biblioteca.', type: 'info', read: true, createdAt: '2024-03-13T14:20:00' },
  { id: '4', title: 'Reserva Confirmada', message: 'Sua reserva para o livro "1984" foi confirmada.', type: 'success', read: true, createdAt: '2024-03-12T11:45:00' },
]

export const activities: Activity[] = [
  { id: '1', action: 'Empréstimo', description: 'Ana Silva emprestou "1984"', timestamp: '2024-03-15T14:30:00' },
  { id: '2', action: 'Devolução', description: 'Maria Santos devolveu "Dom Casmurro"', timestamp: '2024-03-15T11:20:00' },
  { id: '3', action: 'Cadastro', description: 'Novo usuário João Ferreira cadastrado', timestamp: '2024-03-14T16:45:00' },
  { id: '4', action: 'Reserva', description: 'Beatriz Lima reservou "Harry Potter"', timestamp: '2024-03-14T10:00:00' },
  { id: '5', action: 'Novo Livro', description: 'Livro "O Alquimista" adicionado', timestamp: '2024-03-13T09:30:00' },
]

export const categories = [
  'Literatura Brasileira',
  'Ficção Científica',
  'Fantasia',
  'Tecnologia',
  'Infantil',
  'Estratégia',
  'História',
  'Romance',
  'Biografia',
  'Autoajuda',
]
