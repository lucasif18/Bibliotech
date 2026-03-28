'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
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
import { useBooks } from '@/hooks/use-api'
import { categories, type Book } from '@/lib/types'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

function LivrosContent() {
  const { books, isLoading, error, refetch, createBook, updateBook, deleteBook } = useBooks()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    quantity: 1,
  })

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || book.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book)
      setFormData({
        title: book.title,
        author: book.author,
        category: book.category,
        isbn: book.isbn,
        quantity: book.quantity,
      })
    } else {
      setEditingBook(null)
      setFormData({
        title: '',
        author: '',
        category: '',
        isbn: '',
        quantity: 1,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveBook = async () => {
    setIsSubmitting(true)
    try {
      if (editingBook) {
        await updateBook(editingBook.id, formData)
      } else {
        await createBook(formData)
      }
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBook = async () => {
    if (bookToDelete) {
      setIsSubmitting(true)
      try {
        await deleteBook(bookToDelete.id)
        setIsDeleteDialogOpen(false)
        setBookToDelete(null)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const openDeleteDialog = (book: Book) => {
    setBookToDelete(book)
    setIsDeleteDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Livros</h2>
            <p className="text-muted-foreground">
              Gerencie o acervo da biblioteca
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Livro
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <LoadingState message="Carregando livros..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Autor</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum livro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{book.title}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {book.author}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {book.author}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {book.category}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            book.available > 0
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {book.available > 0
                            ? `Disponível (${book.available})`
                            : 'Indisponível'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(book)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(book)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBook ? 'Editar Livro' : 'Adicionar Livro'}
              </DialogTitle>
              <DialogDescription>
                {editingBook
                  ? 'Atualize as informações do livro'
                  : 'Preencha os dados do novo livro'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Digite o título do livro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Digite o nome do autor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  placeholder="Digite o ISBN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBook} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : editingBook ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover o livro &quot;{bookToDelete?.title}&quot;?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteBook} disabled={isSubmitting}>
                {isSubmitting ? 'Removendo...' : 'Remover'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function LivrosPage() {
  return (
    <ProtectedRoute requiredPermission="admin">
      <LivrosContent />
    </ProtectedRoute>
  )
}
