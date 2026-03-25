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
import { reservations as initialReservations, users, books, type Reservation } from '@/lib/data'
import { Plus, Search, X } from 'lucide-react'

const statusColors: Record<string, string> = {
  pendente: 'bg-chart-3/10 text-chart-3',
  disponivel: 'bg-success/10 text-success',
  cancelada: 'bg-muted text-muted-foreground',
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  disponivel: 'Disponível',
  cancelada: 'Cancelada',
}

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)

  const [formData, setFormData] = useState({
    userId: '',
    bookId: '',
  })

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const unavailableBooks = books.filter((book) => book.available === 0)

  const handleOpenDialog = () => {
    setFormData({
      userId: '',
      bookId: '',
    })
    setIsDialogOpen(true)
  }

  const handleCreateReservation = () => {
    const selectedUser = users.find((u) => u.id === formData.userId)
    const selectedBook = books.find((b) => b.id === formData.bookId)

    if (selectedUser && selectedBook) {
      const newReservation: Reservation = {
        id: String(Date.now()),
        userId: formData.userId,
        userName: selectedUser.name,
        bookId: formData.bookId,
        bookTitle: selectedBook.title,
        reservationDate: new Date().toISOString().split('T')[0],
        status: 'pendente',
      }
      setReservations([newReservation, ...reservations])
    }
    setIsDialogOpen(false)
  }

  const handleCancelReservation = () => {
    if (reservationToCancel) {
      setReservations(
        reservations.map((reservation) =>
          reservation.id === reservationToCancel.id
            ? { ...reservation, status: 'cancelada' }
            : reservation
        )
      )
      setIsCancelDialogOpen(false)
      setReservationToCancel(null)
    }
  }

  const openCancelDialog = (reservation: Reservation) => {
    setReservationToCancel(reservation)
    setIsCancelDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reservas</h2>
            <p className="text-muted-foreground">
              Gerencie as reservas de livros indisponíveis
            </p>
          </div>
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            As reservas permitem que usuários aguardem a disponibilidade de livros que estão emprestados. 
            Quando o livro for devolvido, o próximo da fila de reservas será notificado.
          </p>
        </div>

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
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead className="hidden md:table-cell">Usuário</TableHead>
                <TableHead className="hidden lg:table-cell">Data da Reserva</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma reserva encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{reservation.bookTitle}</p>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {reservation.userName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {reservation.userName}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(reservation.reservationDate)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[reservation.status]
                        }`}
                      >
                        {statusLabels[reservation.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {reservation.status === 'pendente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCancelDialog(reservation)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog de Nova Reserva */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
              <DialogDescription>
                Reserve um livro que está indisponível
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
                <Label htmlFor="book">Livro (Indisponível)</Label>
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
                    {unavailableBooks.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Todos os livros estão disponíveis
                      </SelectItem>
                    ) : (
                      unavailableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateReservation}
                disabled={!formData.userId || !formData.bookId}
              >
                Criar Reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Cancelamento */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Cancelamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar a reserva do livro "{reservationToCancel?.bookTitle}" para {reservationToCancel?.userName}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleCancelReservation}>
                Cancelar Reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
