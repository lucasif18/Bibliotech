import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityList } from '@/components/dashboard/activity-list'
import { BookOpen, Users, ArrowLeftRight, BookCheck } from 'lucide-react'
import { books, users, loans } from '@/lib/data'

export default function DashboardPage() {
  const totalBooks = books.reduce((acc, book) => acc + book.quantity, 0)
  const borrowedBooks = books.reduce((acc, book) => acc + (book.quantity - book.available), 0)
  const totalUsers = users.length
  const activeLoans = loans.filter((loan) => loan.status === 'ativo').length

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
            value={totalBooks}
            description={`${books.length} títulos diferentes`}
            icon={BookOpen}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Livros Emprestados"
            value={borrowedBooks}
            description="Atualmente em posse de usuários"
            icon={BookCheck}
          />
          <StatsCard
            title="Usuários Cadastrados"
            value={totalUsers}
            description="Alunos, professores e visitantes"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Empréstimos Ativos"
            value={activeLoans}
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
                {books.slice(0, 5).map((book) => (
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
                ))}
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
                    {loans.filter((l) => l.status === 'atrasado').length} empréstimo(s) atrasado(s)
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-3">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <p className="text-sm text-foreground">
                    {books.filter((b) => b.available === 0).length} livro(s) indisponível(is)
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
