'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  CalendarClock,
  Bell,
  Library,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Definição de itens de navegação com suas permissões
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Livros', href: '/livros', icon: BookOpen, adminOnly: true },
  { name: 'Usuários', href: '/usuarios', icon: Users, adminOnly: true },
  { name: 'Empréstimos', href: '/emprestimos', icon: ArrowLeftRight, adminOnly: false },
  { name: 'Reservas', href: '/reservas', icon: CalendarClock, adminOnly: true },
  { name: 'Notificações', href: '/notificacoes', icon: Bell, adminOnly: false },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = usePermissions()
  const isAdminUser = isAdmin()

  // Filtra itens de navegação baseado em permissões
  const visibleItems = navigationItems.filter((item) => {
    if (item.adminOnly && !isAdminUser) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Library className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">
              BiblioTech
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50">
            BiblioTech v1.0.0
          </p>
        </div>
      </aside>
    </>
  )
}
