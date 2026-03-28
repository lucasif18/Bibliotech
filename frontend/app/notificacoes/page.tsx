'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/ui/loading-state'
import { useNotifications } from '@/hooks/use-api'
import type { Notification } from '@/lib/types'
import { Bell, CheckCircle, AlertTriangle, Info, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const notificationIcons: Record<string, typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
}

const notificationColors: Record<string, string> = {
  info: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  success: 'bg-success/10 text-success border-success/20',
}

function NotificacoesContent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Agora mesmo'
    if (diffHours < 24) return `Há ${diffHours} hora(s)`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `Há ${diffDays} dias`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notificações</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação(ões) não lida(s)`
                : 'Todas as notificações foram lidas'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <LoadingState message="Carregando notificações..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhuma notificação no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification: Notification) => {
                const Icon = notificationIcons[notification.type]
                const colorClass = notificationColors[notification.type]

                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      'bg-card border transition-all',
                      notification.read
                        ? 'border-border opacity-75'
                        : 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                            colorClass
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-8 w-8"
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Marcar como lida</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Legenda */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Tipos de Notificação</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Sucesso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-chart-2/10">
                <Info className="h-4 w-4 text-chart-2" />
              </div>
              <span className="text-sm text-muted-foreground">Informação</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function NotificacoesPage() {
  return (
    <ProtectedRoute requiredPermission="admin">
      <NotificacoesContent />
    </ProtectedRoute>
  )
}
