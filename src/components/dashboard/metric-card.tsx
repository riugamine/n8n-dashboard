import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeText?: string
  icon: LucideIcon
  className?: string
  loading?: boolean
  trend?: 'up' | 'down' | 'neutral'
}

/**
 * Componente de tarjeta de métricas moderna con indicadores de tendencia
 */
export function MetricCard({
  title,
  value,
  change,
  changeText,
  icon: Icon,
  className,
  loading = false,
  trend = 'neutral'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val > 1000) {
        return `${(val / 1000).toFixed(1)}k`
      }
      return val.toLocaleString()
    }
    return val
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTrendIcon = () => {
    if (change === undefined) return null
    return change > 0 ? '+' : ''
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-16 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border-0 bg-gradient-to-br from-background to-muted/20",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {formatValue(value)}
        </div>
        {(change !== undefined || changeText) && (
          <p className={cn("text-xs mt-1", getTrendColor())}>
            {change !== undefined && (
              <span className="font-medium">
                {getTrendIcon()}{change}%{' '}
              </span>
            )}
            {changeText || 'vs mes anterior'}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 