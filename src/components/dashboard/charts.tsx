'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  className?: string
  children: React.ReactNode
  loading?: boolean
}

const ChartCard = ({ title, description, className, children, loading }: ChartCardProps) => {
  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-0 bg-gradient-to-br from-background to-muted/10", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

interface TrendChartProps {
  data: Array<{ date: string; count: number; success_rate?: number }>
  title: string
  description?: string
  className?: string
  loading?: boolean
  type?: 'line' | 'area'
  color?: string
  showTwoLines?: boolean
  secondLineColor?: string
}

export function TrendChart({ 
  data, 
  title, 
  description, 
  className, 
  loading = false,
  type = 'area',
  color = '#8884d8',
  showTwoLines = false,
  secondLineColor = '#10b981'
}: TrendChartProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
  }



  return (
    <ChartCard 
      title={title} 
      description={description} 
      className={className} 
      loading={loading}
    >
      <ResponsiveContainer width="100%" height={300}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            {showTwoLines && <Legend />}
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={color}
              strokeWidth={2}
              dot={false}
              name="Solicitadas"
            />
            {showTwoLines && (
              <Line 
                type="monotone" 
                dataKey="success_rate" 
                stroke={secondLineColor}
                strokeWidth={2}
                dot={false}
                name="Completadas"
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>
  title: string
  description?: string
  className?: string
  loading?: boolean
}

export function HorizontalBarChart({ 
  data, 
  title, 
  description, 
  className, 
  loading = false 
}: BarChartProps) {
  return (
    <ChartCard 
      title={title} 
      description={description} 
      className={className} 
      loading={loading}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          layout="horizontal"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" className="text-xs" axisLine={false} tickLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            className="text-xs"
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#8884d8"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>
  title: string
  description?: string
  className?: string
  loading?: boolean
}

export function DonutChart({ 
  data, 
  title, 
  description, 
  className, 
  loading = false 
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartCard 
      title={title} 
      description={description} 
      className={className} 
      loading={loading}
    >
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                ''
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

interface StatsCardProps {
  stats: Array<{ label: string; value: string | number; change?: number }>
  title: string
  className?: string
  loading?: boolean
}

export function StatsCard({ stats, title, className, loading = false }: StatsCardProps) {
  return (
    <ChartCard title={title} className={className} loading={loading}>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="text-right">
              <div className="font-semibold">{stat.value}</div>
              {stat.change !== undefined && (
                <div className={cn(
                  "text-xs",
                  stat.change > 0 
                    ? "text-green-600 dark:text-green-400" 
                    : stat.change < 0 
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
} 