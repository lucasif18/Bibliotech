'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useAuthContext } from '@/components/auth/auth-provider'
import { Card } from '@/components/ui/card'
import { BookOpen, Users, LibraryBig } from 'lucide-react'

export default function WelcomePage() {
  const { user } = useAuthContext()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}!</h2>
          <p className="text-muted-foreground mt-2">
            Você está logado como <span className="font-semibold">Visitante</span>
          </p>
        </div>

        {/* Informações sobre o acesso */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Meus Empréstimos</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Visualize todos os seus empréstimos ativos e histórico de devoluções.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Perfil</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais e altere sua senha de acesso.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <LibraryBig className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Acervo</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore toda a coleção de livros disponíveis na biblioteca.
            </p>
          </Card>
        </div>

        {/* Mensagem de informação */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Informações Úteis</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ Você pode visualizar seus empréstimos na seção "Empréstimos"</li>
            <li>✓ Use o menu lateral para navegar entre as diferentes seções</li>
            <li>✓ Para devolver um livro, acesse a página de empréstimos</li>
            <li>✓ Atualize seu perfil a qualquer momento na seção "Perfil"</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
}
