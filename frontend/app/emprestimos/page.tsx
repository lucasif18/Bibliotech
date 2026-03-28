'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LoadingState, ErrorState } from '@/components/ui/loading-state'
import { AdminOnly } from '@/components/auth/permission-components'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useLoansForCurrentUser, useUsers, useBooks } from '@/hooks/use-api'
import type { Loan } from '@/lib/types'
import { Plus, Search, BookCheck, AlertCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
  ativo: 'bg-chart-2/10 text-chart-2',
  atrasado: 'bg-destructive/10 text-destructive',
  finalizado: 'bg-success/10 text-success',
}

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  atrasado: 'Atrasado',
  finalizado: 'Finalizado',
}

export default function EmprestimosPage() {
  const { loans, isLoading: loansLoading, error: loansError, refetch, createLoan, returnBook } = useLoansForCurrentUser()
  const { user } = useAuthContext()
  const { users, isLoading: usersLoading } = useUsers()
  const { books, isLoading: booksLoading } = useBooks()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [loanToReturn, setLoanToReturn] = useState<Loan | null>(null)
  const [returnError, setReturnError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    bookId: '',
    returnDate: '',
  })

  const isLoading = loansLoading || usersLoading || booksLoading

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const availableBooks = books.filter((book) => book.available > 0)
  const overdueCount = loans.filter((l) => l.status === 'atrasado').length

  const handleOpenDialog = () => {
    setFormData({
      userId: '',
      bookId: '',
      returnDate: '',
    })
    setIsDialogOpen(true)
  }

  const handleCreateLoan = async () => {
    setIsSubmitting(true)
    try {
      await createLoan(formData)
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturnBook = async () => {
    if (loanToReturn) {
      setIsSubmitting(true)
      setReturnError(null)
      try {
        const result = await returnBook(loanToReturn.id)
        if (result.success) {
          setIsReturnDialogOpen(false)
          setLoanToReturn(null)
        } else {
          setReturnError(result.error || 'Erro ao registrar devolução')
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const openReturnDialog = (loan: Loan) => {
    setLoanToReturn(loan)
    setReturnError(null)
    setIsReturnDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getMinReturnDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Empréstimos</h2>
            <p className="text-muted-foreground">
              Gerencie os empréstimos de livros
            </p>
          </div>
          <AdminOnly>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Empréstimo
            </Button>
          </AdminOnly>
        </div>

        {/* Alertas */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">
              Existem {overdueCount} empréstimo(s) atrasado(s) que precisam de atenção.
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário ou livro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <LoadingState message="Carregando empréstimos..." />
        ) : loansError ? (
          <ErrorState message={loansError} onRetry={refetch} />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livro</TableHead>
                  <TableHead className="hidden md:table-cell">Usuário</TableHead>
                  <TableHead className="hidden lg:table-cell">Data Empréstimo</TableHead>
                  <TableHead className="hidden sm:table-cell">Devolução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum empréstimo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{loan.bookTitle}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {loan.userName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {loan.userName}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(loan.loanDate)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(loan.returnDate)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[loan.status]
                          }`}
                        >
                          {statusLabels[loan.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {loan.status !== 'finalizado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReturnDialog(loan)}
                            className="gap-2"
                          >
                            <BookCheck className="h-4 w-4" />
                            <span className="hidden sm:inline">Devolver</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog de Novo Empréstimo */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Empréstimo</DialogTitle>
              <DialogDescription>
                Registre um novo empréstimo de livro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">Usuário</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="book">Livro</Label>
                <Select
                  value={formData.bookId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bookId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum livro disponível
                      </SelectItem>
                    ) : (
                      availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} ({book.available} disponível)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate">Data de Devolução</Label>
                <Input
                  id="returnDate"
                  type="date"
                  min={getMinReturnDate()}
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateLoan}
                disabled={!formData.userId || !formData.bookId || !formData.returnDate || isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Empréstimo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Devolução */}
        <Dialog open={isReturnDialogOpen} onOpenChange={(open) => { setIsReturnDialogOpen(open); if (!open) setReturnError(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Devolução</DialogTitle>
              <DialogDescription>
                Confirmar a devolução do livro &quot;{loanToReturn?.bookTitle}&quot; emprestado para {loanToReturn?.userName}?
              </DialogDescription>
            </DialogHeader>
            {returnError && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{returnError}</p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReturnDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleReturnBook} disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Confirmar Devolução'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
