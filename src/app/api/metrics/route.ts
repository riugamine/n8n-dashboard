import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MetricPayload } from '@/lib/types'
import { getMetricsByType, mockDashboardMetrics } from '@/lib/placeholder-data'

// =============================================================================
// POST - CREAR NUEVAS MÉTRICAS
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: MetricPayload = await request.json()
    
    // Validar datos básicos
    const { type, data, timestamp } = body
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: type, data' },
        { status: 400 }
      )
    }

    const currentTimestamp = timestamp || new Date().toISOString()

    // Determinar tabla de destino según el tipo (solo tablas existentes en el schema simplificado)
    let insertResult;
    let tableName: string;

    switch (type) {
      case 'workflow_execution':
        tableName = 'workflow_executions'
        insertResult = await supabase
          .from(tableName)
          .insert([{
            ...data,
            timestamp: currentTimestamp,
            created_at: currentTimestamp,
          }])
          .select()
        break

      case 'user_interaction':
        tableName = 'user_interactions'
        insertResult = await supabase
          .from(tableName)
          .insert([{
            ...data,
            timestamp: currentTimestamp,
            created_at: currentTimestamp,
          }])
          .select()
        break

      case 'user_update':
        tableName = 'users'
        // Para usuarios, usar upsert para actualizar si existe
        insertResult = await supabase
          .from(tableName)
          .upsert([{
            ...data,
            timestamp: currentTimestamp,
            created_at: currentTimestamp,
          }], {
            onConflict: 'user_id'
          })
          .select()
        break

      default:
        // Fallback a la tabla original 'metrics' para compatibilidad
        tableName = 'metrics'
        insertResult = await supabase
          .from(tableName)
          .insert([{
            type,
            data,
            timestamp: currentTimestamp,
            created_at: currentTimestamp,
          }])
          .select()
    }

    if (insertResult.error) {
      console.error(`Error insertando en ${tableName}:`, insertResult.error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Métrica ${type} guardada correctamente en ${tableName}`,
        data: insertResult.data 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error procesando métricas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =============================================================================
// GET - OBTENER MÉTRICAS
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    const workflowId = searchParams.get('workflowId')
    const status = searchParams.get('status')
    const useMock = searchParams.get('mock') === 'true' // Para desarrollo

    // Si está activado el modo mock, devolver datos placeholder
    if (useMock) {
      if (type === 'dashboard') {
        return NextResponse.json({
          success: true,
          data: mockDashboardMetrics
        })
      }
      
      const mockData = getMetricsByType(type || '', limit)
      return NextResponse.json({
        success: true,
        data: mockData,
        count: mockData.length
      })
    }

    // Métricas del dashboard (agregadas)
    if (type === 'dashboard') {
      const dashboardData = await calculateDashboardMetrics(
        startDate || undefined, 
        endDate || undefined
      )
      return NextResponse.json({
        success: true,
        data: dashboardData
      })
    }

    // Determinar tabla según el tipo (solo tablas existentes)
    let tableName: string
    let query

    switch (type) {
      case 'workflow_execution':
        tableName = 'workflow_executions'
        query = supabase.from(tableName).select('*')
        if (workflowId) query = query.eq('workflow_id', workflowId)
        if (status) query = query.eq('status', status)
        break

      case 'user_interaction':
        tableName = 'user_interactions'
        query = supabase.from(tableName).select('*')
        if (userId) query = query.eq('user_id', userId)
        break

      case 'user':
        tableName = 'users'
        query = supabase.from(tableName).select('*')
        if (userId) query = query.eq('user_id', userId)
        break

      default:
        // Fallback a la tabla original
        tableName = 'metrics'
        query = supabase.from(tableName).select('*')
        if (type) query = query.eq('type', type)
    }

    // Aplicar filtros comunes
    if (startDate) {
      query = query.gte('timestamp', startDate)
    }
    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    // Ordenar y limitar
    query = query.order('timestamp', { ascending: false }).limit(limit)

    const { data, error } = await query

    if (error) {
      console.error(`Error obteniendo métricas de ${tableName}:`, error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
      table: tableName
    })

  } catch (error) {
    console.error('Error obteniendo métricas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =============================================================================
// PUT - REPORTAR WORKFLOW FALLIDO (Método específico para errores)
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos específicos para workflow fallido
    const { 
      workflow_id, 
      workflow_name, 
      execution_id, 
      error_message, 
      duration_ms, 
      node_count 
    } = body
    
    if (!workflow_id || !execution_id || !error_message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: workflow_id, execution_id, error_message' },
        { status: 400 }
      )
    }

    const currentTimestamp = new Date().toISOString()
    
    // Insertar workflow fallido
    const insertResult = await supabase
      .from('workflow_executions')
      .insert([{
        workflow_id,
        workflow_name: workflow_name || 'Workflow N8N',
        execution_id,
        status: 'failed',
        duration_ms: duration_ms || 0,
        start_time: currentTimestamp,
        end_time: currentTimestamp,
        error_message,
        node_count: node_count || 0,
        timestamp: currentTimestamp,
        created_at: currentTimestamp,
      }])
      .select()

    if (insertResult.error) {
      console.error('Error reportando workflow fallido:', insertResult.error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    // Log para debugging
    console.log(`Workflow fallido reportado: ${execution_id} - ${error_message}`)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Workflow fallido reportado correctamente',
        data: insertResult.data 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error procesando reporte de workflow fallido:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// =============================================================================
// FUNCIÓN HELPER PARA CALCULAR MÉTRICAS DEL DASHBOARD (Actualizada)
// =============================================================================

async function calculateDashboardMetrics(startDate?: string, endDate?: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = today.toISOString()
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    // Usar fechas por defecto si no se proporcionan
    const effectiveStartDate = startDate || monthAgo
    const effectiveEndDate = endDate || new Date().toISOString()
    
    console.log(`Calculando métricas desde ${effectiveStartDate} hasta ${effectiveEndDate}`)

    // Comprobar conexión a Supabase
    const testConnection = await supabase.from('workflow_executions').select('id').limit(1)
    if (testConnection.error) {
      console.log('No hay conexión a Supabase, usando datos mock')
      return mockDashboardMetrics
    }

    // Usar la función nativa de PostgreSQL para calcular métricas
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('calculate_dashboard_metrics', {
        start_date: effectiveStartDate,
        end_date: effectiveEndDate
      })

    if (metricsError) {
      console.error('Error llamando función calculate_dashboard_metrics:', metricsError)
      // Fallback a cálculo manual
      return await calculateMetricsManually(todayString, weekAgo, monthAgo)
    }

    return metricsData || mockDashboardMetrics

  } catch (error) {
    console.error('Error calculando métricas del dashboard:', error)
    return mockDashboardMetrics
  }
}

// =============================================================================
// FUNCIÓN HELPER PARA CÁLCULO MANUAL DE MÉTRICAS (Fallback)
// =============================================================================

async function calculateMetricsManually(todayString: string, weekAgo: string, monthAgo: string) {
  try {
    const [
      workflowToday,
      workflowWeek,
      workflowMonth,
      interactionsToday,
      interactionsWeek,
      interactionsMonth
    ] = await Promise.all([
      // Workflows
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', todayString),
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', weekAgo),
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', monthAgo),
      
      // Interacciones (con tracking de citas simplificado)
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, appointment_requested, appointment_confirmed, appointment_completed')
        .gte('timestamp', todayString),
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, appointment_requested, appointment_confirmed, appointment_completed')
        .gte('timestamp', weekAgo),
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, appointment_requested, appointment_confirmed, appointment_completed')
        .gte('timestamp', monthAgo),
    ])

    // Procesar datos
    const workflowTodayData = workflowToday.data || []
    const workflowWeekData = workflowWeek.data || []
    const workflowMonthData = workflowMonth.data || []
    
    const interactionsTodayData = interactionsToday.data || []
    const interactionsWeekData = interactionsWeek.data || []
    const interactionsMonthData = interactionsMonth.data || []

    return {
      // 1. Número de ejecuciones del flujo
      total_executions_today: workflowTodayData.length,
      total_executions_week: workflowWeekData.length,
      total_executions_month: workflowMonthData.length,

      // 2. Ejecuciones fallidas
      failed_executions_today: workflowTodayData.filter(w => w.status === 'failed').length,
      failed_executions_week: workflowWeekData.filter(w => w.status === 'failed').length,
      failed_executions_month: workflowMonthData.filter(w => w.status === 'failed').length,

      // 3. Tasa de éxito del flujo
      success_rate_today: workflowTodayData.length > 0
        ? Math.round((workflowTodayData.filter(w => w.status === 'success').length / workflowTodayData.length) * 100 * 10) / 10
        : 0,
      success_rate_week: workflowWeekData.length > 0
        ? Math.round((workflowWeekData.filter(w => w.status === 'success').length / workflowWeekData.length) * 100 * 10) / 10
        : 0,
      success_rate_month: workflowMonthData.length > 0
        ? Math.round((workflowMonthData.filter(w => w.status === 'success').length / workflowMonthData.length) * 100 * 10) / 10
        : 0,

      // 4. Total de preguntas recibidas
      total_questions_today: interactionsTodayData.length,
      total_questions_week: interactionsWeekData.length,
      total_questions_month: interactionsMonthData.length,

      // 5. Usuarios atendidos
      unique_users_today: new Set(interactionsTodayData.map(i => i.user_id)).size,
      unique_users_week: new Set(interactionsWeekData.map(i => i.user_id)).size,
      unique_users_month: new Set(interactionsMonthData.map(i => i.user_id)).size,

      // 6. Cantidad de citas agendadas
      appointments_requested_today: interactionsTodayData.filter(i => i.appointment_requested).length,
      appointments_requested_week: interactionsWeekData.filter(i => i.appointment_requested).length,
      appointments_requested_month: interactionsMonthData.filter(i => i.appointment_requested).length,

      // 7. Tiempo promedio de respuesta
      average_response_time_today: interactionsTodayData.length > 0
        ? Math.round(interactionsTodayData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsTodayData.length)
        : 0,
      average_response_time_week: interactionsWeekData.length > 0
        ? Math.round(interactionsWeekData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsWeekData.length)
        : 0,
      average_response_time_month: interactionsMonthData.length > 0
        ? Math.round(interactionsMonthData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsMonthData.length)
        : 0,

      // 8. Tasa de completación de citas
      appointment_completion_rate_month: interactionsMonthData.filter(i => i.appointment_requested).length > 0
        ? Math.round((interactionsMonthData.filter(i => i.appointment_completed).length / interactionsMonthData.filter(i => i.appointment_requested).length) * 100 * 10) / 10
        : 0,

      // 9. Tasa de conversión (usuarios → cita agendada)
      user_conversion_rate_month: interactionsMonthData.length > 0
        ? Math.round((new Set(interactionsMonthData.filter(i => i.appointment_requested).map(i => i.user_id)).size / new Set(interactionsMonthData.map(i => i.user_id)).size) * 100 * 10) / 10
        : 0,

      // Tendencias (usando datos mock por ahora - requiere consultas más complejas)
      executions_trend: mockDashboardMetrics.executions_trend,
      questions_trend: mockDashboardMetrics.questions_trend
    }

  } catch (error) {
    console.error('Error en cálculo manual de métricas:', error)
    return mockDashboardMetrics
  }
} 