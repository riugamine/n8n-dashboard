'use client'

import { useDashboardMetrics } from '@/hooks/use-metrics'
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
  Zap,
  Phone,
  Bot
} from 'lucide-react'
import { useEffect, useState } from 'react'

// Helper function para parsear fechas de forma segura
const safeParseDate = (dateString: string, fallback: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return fallback
  }
  
  try {
    // Intentar parsear la fecha con diferentes formatos
    const date = new Date(dateString + 'T00:00:00')
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' })
    }
    
    // Si falla, intentar parsear sin la hora
    const date2 = new Date(dateString)
    if (!isNaN(date2.getTime())) {
      return date2.toLocaleDateString('es-ES', { weekday: 'short' })
    }
  } catch (error) {
    console.warn('Error parsing date:', dateString, error)
  }
  
  return fallback
}

// Helper para formatear fecha día/mes
const safeFormatDayMonth = (dateString: string, fallback: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return fallback
  }
  
  try {
    const date = new Date(dateString + 'T00:00:00')
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
    
    const date2 = new Date(dateString)
    if (!isNaN(date2.getTime())) {
      return date2.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
  } catch (error) {
    console.warn('Error formatting date:', dateString, error)
  }
  
  return fallback
}

export default function DashboardPage() {
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  
  const metrics = metricsData?.data

  // Solo mostrar fecha después de hidratación para evitar mismatch
  useEffect(() => {
    setIsClient(true)
    setCurrentTime(new Date().toLocaleString('es-ES'))
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('es-ES'))
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Datos para gráficos simplificados y fáciles de entender
  const systemHealthData = [
    { 
      name: 'Funcionando Bien', 
      value: metrics?.success_rate_today || 0,
      color: '#10b981' 
    },
    { 
      name: 'Con Problemas', 
      value: 100 - (metrics?.success_rate_today || 0),
      color: '#ef4444' 
    }
  ]

  const conversionStats = [
    { 
      label: 'Citas Confirmadas', 
      value: `${metrics?.appointment_completion_rate_month || 0}%`,
      change: 5.2
    },
    { 
      label: 'Usuarios que Agendan', 
      value: `${metrics?.user_conversion_rate_month || 0}%`,
      change: 3.1
    },
    { 
      label: 'Respuesta Rápida', 
      value: `${((metrics?.average_response_time_today || 0) / 1000).toFixed(1)}s`,
      change: -2.3
    },
    { 
      label: 'Consultas Atendidas', 
      value: `${metrics?.total_questions_today || 0}`,
      change: 8.7
    }
  ]

  // Procesar datos de tendencia - estructura correcta para TrendChart
  const recentTrendData = metrics?.questions_trend?.slice(-7).map((item, index) => {    
    return {
      date: safeFormatDayMonth(item?.date, `Día ${index + 1}`),
      count: item?.questions || 0,
      success_rate: item?.appointments || 0  // Usar appointments como segunda línea
    }
  }) || [
    // Datos de fallback si no hay datos disponibles
    { date: 'Lun', count: 0, success_rate: 0 },
    { date: 'Mar', count: 0, success_rate: 0 },
    { date: 'Mié', count: 0, success_rate: 0 },
    { date: 'Jue', count: 0, success_rate: 0 },
    { date: 'Vie', count: 0, success_rate: 0 },
    { date: 'Sáb', count: 0, success_rate: 0 },
    { date: 'Dom', count: 0, success_rate: 0 }
  ]

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
    <div className="flex-1 space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header con Branding Responsive */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold text-primary">joseangelweb</span>
            </div>
            <div className="h-4 sm:h-6 w-px bg-border" />
            <span className="text-sm sm:text-lg text-muted-foreground">Asistente IA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Rendimiento de tu asistente virtual para citas y consultas
          </p>
        </div>
        
        {/* Status Badge - Responsive */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg self-start lg:self-center">
          <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Actualizado hace un momento</span>
          <span className="sm:hidden">Actualizado</span>
        </div>
      </div>

      {/* Bento Grid Layout Optimizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-auto">
        
        {/* Estado del Sistema - Lo más importante primero */}
        <MetricCard
          title="Estado del Sistema"
          value={`${metrics?.success_rate_today || 0}%`}
          change={1.5}
          changeText="funcionando bien"
          icon={CheckCircle}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-2 lg:col-span-2 xl:col-span-2"
        />

        {/* Consultas Atendidas Hoy */}
        <MetricCard
          title="Consultas Atendidas Hoy"
          value={metrics?.total_questions_today || 0}
          change={15.2}
          changeText="vs ayer"
          icon={MessageSquare}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1"
        />
        
        {/* Citas Agendadas Hoy */}
        <MetricCard
          title="Citas Agendadas Hoy"
          value={metrics?.appointments_requested_today || 0}
          change={8.5}
          changeText="vs ayer"
          icon={Calendar}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        {/* Gráfico de Rendimiento del Sistema */}
        <DonutChart
          data={systemHealthData}
          title="Salud del Sistema"
          description="Porcentaje de consultas procesadas exitosamente"
          className="col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2"
          loading={metricsLoading}
        />
        
        {/* Tendencia de Actividad */}
        <TrendChart
          data={recentTrendData}
          title="Actividad de la Semana"
          description="Consultas y citas de los últimos 7 días"
          className="col-span-full lg:col-span-4 xl:col-span-4 row-span-2"
          loading={metricsLoading}
          type="area"
          color="#3b82f6"
          showTwoLines={true}
          secondLineColor="#10b981"
        />

        {/* Usuarios Atendidos */}
        <MetricCard
          title="Personas Atendidas"
          value={metrics?.unique_users_today || 0}
          change={12.1}
          changeText="nuevos usuarios"
          icon={Users}
          trend="up"
          loading={metricsLoading}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        {/* Velocidad de Respuesta */}
        <MetricCard
          title="Velocidad de Respuesta"
          value={`${((metrics?.average_response_time_today || 0) / 1000).toFixed(1)}s`}
          change={-5.3}
          changeText="más rápido"
          icon={Clock}
          trend="down"
          loading={metricsLoading}
          className="md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        {/* Estadísticas de Rendimiento */}
        <StatsCard
          title="Indicadores de Éxito"
          stats={conversionStats}
          className="col-span-full md:col-span-2 lg:col-span-2 xl:col-span-2"
          loading={metricsLoading}
        />

        {/* Rendimiento del Mes */}
        <MetricCard
          title="Total del Mes"
          value={metrics?.total_questions_month || 0}
          change={22.8}
          changeText="consultas atendidas"
          icon={TrendingUp}
          trend="up"
          loading={metricsLoading}
          className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        <MetricCard
          title="Citas del Mes"
          value={metrics?.appointments_requested_month || 0}
          change={18.3}
          changeText="agendadas exitosamente"
          icon={Target}
          trend="up"
          loading={metricsLoading}
          className="col-span-full md:col-span-1 lg:col-span-1 xl:col-span-1"
        />

        {/* Ejecuciones del Sistema */}
        <MetricCard
          title="Procesos Ejecutados"
          value={metrics?.total_executions_today || 0}
          change={3.2}
          changeText="automatizaciones"
          icon={Zap}
          trend="up"
          loading={metricsLoading}
          className="lg:col-span-1 xl:col-span-1"
        />
        
        {/* Contactos Telefónicos */}
        <MetricCard
          title="Contactos Únicos"
          value={metrics?.unique_users_week || 0}
          change={7.8}
          changeText="esta semana"
          icon={Phone}
          trend="up"
          loading={metricsLoading}
          className="lg:col-span-1 xl:col-span-1"
        />

        {/* Tendencia de Ejecuciones - estructura correcta */}
        <TrendChart
          data={metrics?.executions_trend?.slice(-14).map((item, index) => {            
            return {
              date: safeFormatDayMonth(item?.date, `${index + 1}`),
              count: item?.total || 0,
              success_rate: item?.success_rate || 0
            }
          }) || [
            // Datos de fallback para últimas 2 semanas
            { date: '1', count: 0, success_rate: 0 },
            { date: '2', count: 0, success_rate: 0 },
            { date: '3', count: 0, success_rate: 0 },
            { date: '4', count: 0, success_rate: 0 },
            { date: '5', count: 0, success_rate: 0 },
            { date: '6', count: 0, success_rate: 0 },
            { date: '7', count: 0, success_rate: 0 },
            { date: '8', count: 0, success_rate: 0 },
            { date: '9', count: 0, success_rate: 0 },
            { date: '10', count: 0, success_rate: 0 },
            { date: '11', count: 0, success_rate: 0 },
            { date: '12', count: 0, success_rate: 0 },
            { date: '13', count: 0, success_rate: 0 },
            { date: '14', count: 0, success_rate: 0 }
          ]}
          title="Rendimiento del Sistema"
          description="Procesos ejecutados y tasa de éxito (14 días)"
          className="col-span-full lg:col-span-4 xl:col-span-4"
          loading={metricsLoading}
          type="line"
          color="#3b82f6"
          showTwoLines={true}
          secondLineColor="#10b981"
        />

      </div>

      {/* Footer Info con Branding */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground py-4 border-t bg-muted/20 rounded-lg">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span>🤖 Asistente IA de <strong>joseangelweb</strong></span>
          <span className="hidden sm:inline">•</span>
          <span>📊 {isClient && currentTime ? `Actualizado: ${currentTime}` : 'Actualizando...'}</span>
          <span className="hidden sm:inline">•</span>
          <span>⚡ Estado: {metricsLoading ? 'Sincronizando...' : 'Operativo'}</span>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground/80">
          Tu asistente virtual está trabajando 24/7 para atender consultas y agendar citas automáticamente
        </p>
      </div>
    </div>
  )
} 