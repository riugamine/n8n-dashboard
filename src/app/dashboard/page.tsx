'use client'

import { useDashboardMetrics, useFrequentQuestions } from '@/hooks/use-metrics'
import { MetricCard } from '@/components/dashboard/metric-card'
import { TrendChart, DonutChart, StatsCard } from '@/components/dashboard/charts'
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Target,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const { data: questionsData, isLoading: questionsLoading } = useFrequentQuestions()
  
  const metrics = metricsData?.data
  const questions = questionsData?.data || []

  // Datos para gráficos
  const questionsChartData = questions.slice(0, 5).map((q: { question_pattern: string; count: number }) => ({
    name: q.question_pattern.charAt(0).toUpperCase() + q.question_pattern.slice(1),
    value: q.count,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`
  }))

  const conversionStats = [
    { 
      label: 'Tasa de Conversión', 
      value: `${metrics?.appointment_conversion_rate || 0}%`,
      change: 5.2
    },
    { 
      label: 'Confianza Alta', 
      value: `${metrics?.high_confidence_responses || 0}%`,
      change: 2.1
    },
    { 
      label: 'Usuario → Cita', 
      value: `${metrics?.user_to_appointment_rate || 0}%`,
      change: -1.3
    },
    { 
      label: 'Finalización', 
      value: `${metrics?.appointment_completion_rate || 0}%`,
      change: 3.8
    }
  ]

  const recentTrendData = metrics?.questions_trend?.slice(-7) || []

  if (metricsError) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="text-center py-10">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar las métricas</h3>
          <p className="text-muted-foreground">
            No se pudieron obtener los datos del dashboard. Verifica la conexión.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard N8N</h1>
          <p className="text-muted-foreground mt-2">
            Métricas en tiempo real del asistente automatizado
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Actualizando cada 30s</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-auto">
        
        {/* KPI Cards - Row 1 */}
        <MetricCard
          title="Consultas Hoy"
          value={metrics?.total_questions_today || 0}
          change={15.2}
          icon={MessageSquare}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1"
        />
        
        <MetricCard
          title="Citas Agendadas"
          value={metrics?.appointments_scheduled_today || 0}
          change={8.5}
          icon={Calendar}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1"
        />
        
        <MetricCard
          title="Tiempo Respuesta"
          value={`${((metrics?.average_response_time || 0) / 1000).toFixed(1)}s`}
          change={-5.3}
          icon={Clock}
          trend="down"
          loading={metricsLoading}
          className="md:col-span-1"
        />
        
        <MetricCard
          title="Usuarios Únicos"
          value={metrics?.unique_users_today || 0}
          change={12.1}
          icon={Users}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1"
        />

        {/* Large Trend Chart */}
        <TrendChart
          data={recentTrendData}
          title="Tendencia de Consultas"
          description="Consultas recibidas en los últimos 7 días"
          className="col-span-full lg:col-span-4 xl:col-span-4 row-span-2"
          loading={metricsLoading}
          type="area"
          color="#3b82f6"
        />

        {/* Workflow Metrics */}
        <MetricCard
          title="Ejecuciones Hoy"
          value={metrics?.workflow_executions_today || 0}
          change={3.2}
          icon={Zap}
          trend="up"
          loading={metricsLoading}
          className="lg:col-span-1 xl:col-span-1"
        />
        
        <MetricCard
          title="Tasa de Éxito"
          value={`${metrics?.success_rate || 0}%`}
          change={1.5}
          icon={CheckCircle}
          trend="up"
          loading={metricsLoading}
          className="lg:col-span-1 xl:col-span-1"
        />

        {/* Frequent Questions Donut Chart */}
        <DonutChart
          data={questionsChartData}
          title="Preguntas Frecuentes"
          description="Top 5 categorías más consultadas"
          className="col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2"
          loading={questionsLoading}
        />

        {/* Stats Card */}
        <StatsCard
          title="Métricas de Conversión"
          stats={conversionStats}
          className="col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2"
          loading={metricsLoading}
        />

        {/* Monthly Performance */}
        <MetricCard
          title="Consultas del Mes"
          value={metrics?.total_questions_month || 0}
          change={22.8}
          changeText="vs mes anterior"
          icon={TrendingUp}
          trend="up"
          loading={metricsLoading}
          className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        <MetricCard
          title="Citas del Mes"
          value={metrics?.appointments_scheduled_month || 0}
          change={18.3}
          changeText="vs mes anterior"
          icon={Target}
          trend="up"
          loading={metricsLoading}
          className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        {/* Appointments Trend */}
        <TrendChart
          data={metrics?.appointments_trend?.slice(-14).map(item => ({
            date: item.date,
            count: item.requested,
            success_rate: item.completed
          })) || []}
          title="Tendencia de Citas"
          description="Citas solicitadas vs completadas (14 días)"
          className="col-span-full lg:col-span-4 xl:col-span-4"
          loading={metricsLoading}
          type="line"
          color="#3b82f6"
          showTwoLines={true}
          secondLineColor="#10b981"
        />

      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        <p>
          Dashboard actualizado automáticamente • 
          Datos desde el {new Date().toLocaleDateString('es-ES')} • 
          Modo: {metricsLoading ? 'Cargando...' : 'Datos simulados'}
        </p>
      </div>
    </div>
  )
} 