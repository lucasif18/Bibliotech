'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityList } from '@/components/dashboard/activity-list'
import { LoadingState, ErrorState } from '@/components/ui/loading-state'
import { Spinner } from '@/components/ui/spinner'
import { useDashboard } from '@/hooks/use-api'
import { BookOpen, Users, ArrowLeftRight, BookCheck } from 'lucide-react'

function DashboardContent() {
  const { stats, books, loans, isLoading, error, refetch } = useDashboard()

  // Calcular estatísticas a partir dos dados carregados se stats não estiver disponível
  const displayStats = stats || {
    totalBooks: 0,
    totalTitles: 0,
    borrowedBooks: 0,
    totalUsers: 0,
    activeLoans: loans?.filter((l) => l.status === 'ativo').length || 0,
    overdueLoans: loans?.filter((l) => l.status === 'atrasado').length || 0,
    unavailableBooks: books?.filter((b) => b.available === 0).length || 0,
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando dashboard..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} onRetry={refetch} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Título da página */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de biblioteca
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Livros"
            value={displayStats.totalBooks}
            description={`${displayStats.totalTitles} títulos diferentes`}
            icon={BookOpen}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Livros Emprestados"
            value={displayStats.borrowedBooks}
            description="Atualmente em posse de usuários"
            icon={BookCheck}
          />
          <StatsCard
            title="Usuários Cadastrados"
            value={displayStats.totalUsers}
            description="Administradores e visitantes"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Empréstimos Ativos"
            value={displayStats.activeLoans}
            description="Aguardando devolução"
            icon={ArrowLeftRight}
          />
        </div>

        {/* Grid com atividades e gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityList />
          
          {/* Card de resumo rápido */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Resumo do Acervo
              </h3>
              <div className="space-y-3">
                {books.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  books.map((book) => (
                    <div key={book.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          book.status === 'disponivel'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {book.available}/{book.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Alertas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <p className="text-sm text-foreground">
                    {displayStats.overdueLoans} empréstimo(s) atrasado(s)
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-3">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <p className="text-sm text-foreground">
                    {displayStats.unavailableBooks} livro(s) indisponível(is)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermission="admin">
      <DashboardContent />
    </ProtectedRoute>
  )
}
