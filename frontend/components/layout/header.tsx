'use client'

import { Bell, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useNotificationCount } from '@/hooks/use-api'
import { useAuthContext } from '@/components/auth/auth-provider'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { count: notificationCount } = useNotificationCount()
  const { user, logout } = useAuthContext()

  const handleLogout = async () => {
    await logout()
  }

  // Obtém as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Formata o papel do usuário para exibição
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      bibliotecario: 'Bibliotecário',
      usuario: 'Usuário',
    }
    return roles[role] || role
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          Sistema de Gerenciamento de Biblioteca
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notificações */}
        {user?.type !== 'visitante' && (
          <Link href="/notificacoes">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </Link>
        )}

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.name) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left sm:flex">
                <span className="text-sm font-medium">{user?.name || 'Carregando...'}</span>
                <span className="text-xs text-muted-foreground">
                  {user ? getRoleLabel(user.role) : ''}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
