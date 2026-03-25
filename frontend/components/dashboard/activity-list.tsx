import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { activities } from '@/lib/data'
import { ArrowLeftRight, BookPlus, UserPlus, BookCheck, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

const activityIcons: Record<string, typeof ArrowLeftRight> = {
  'Empréstimo': ArrowLeftRight,
  'Devolução': BookCheck,
  'Cadastro': UserPlus,
  'Reserva': CalendarClock,
  'Novo Livro': BookPlus,
}

const activityColors: Record<string, string> = {
  'Empréstimo': 'bg-chart-2/10 text-chart-2',
  'Devolução': 'bg-success/10 text-success',
  'Cadastro': 'bg-chart-3/10 text-chart-3',
  'Reserva': 'bg-chart-4/10 text-chart-4',
  'Novo Livro': 'bg-primary/10 text-primary',
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Agora mesmo'
  if (diffHours < 24) return `Há ${diffHours}h`
  if (diffDays === 1) return 'Ontem'
  return `Há ${diffDays} dias`
}

export function ActivityList() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.action] || ArrowLeftRight
          const colorClass = activityColors[activity.action] || 'bg-muted text-muted-foreground'

          return (
            <div key={activity.id} className="flex items-start gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  colorClass
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.action}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
