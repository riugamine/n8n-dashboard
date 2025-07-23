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

    // Determinar tabla de destino según el tipo
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

      case 'appointment':
        tableName = 'appointments'
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

      case 'frequent_question':
        tableName = 'frequent_questions'
        insertResult = await supabase
          .from(tableName)
          .upsert([{
            ...data,
            updated_at: currentTimestamp,
          }], {
            onConflict: 'question_pattern'
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

    // Determinar tabla según el tipo
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

      case 'appointment':
        tableName = 'appointments'
        query = supabase.from(tableName).select('*')
        if (userId) query = query.eq('user_id', userId)
        if (status) query = query.eq('status', status)
        break

      case 'user':
        tableName = 'users'
        query = supabase.from(tableName).select('*')
        if (userId) query = query.eq('user_id', userId)
        break

      case 'frequent_question':
        tableName = 'frequent_questions'
        query = supabase.from(tableName).select('*').order('count', { ascending: false })
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
// FUNCIÓN HELPER PARA CALCULAR MÉTRICAS DEL DASHBOARD
// =============================================================================

async function calculateDashboardMetrics(startDate?: string, endDate?: string) {
  try {
    // TODO: Implementar filtros de fecha personalizados con startDate y endDate
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    // Usar fechas por defecto por ahora, implementación personalizada próximamente
    const effectiveStartDate = startDate || monthAgo
    const effectiveEndDate = endDate || new Date().toISOString()
    
    // Variables para futura implementación de filtros personalizados
    console.log(`Calculando métricas desde ${effectiveStartDate} hasta ${effectiveEndDate}`)

    // Si no hay conexión a Supabase (usando placeholders), devolver datos mock
    const testConnection = await supabase.from('workflow_executions').select('id').limit(1)
    if (testConnection.error) {
      console.log('No hay conexión a Supabase, usando datos mock')
      return mockDashboardMetrics
    }

    // Calcular métricas reales
    const [
      workflowToday,
      workflowWeek,
      workflowMonth,
      interactionsToday,
      interactionsWeek,
      interactionsMonth,
      appointmentsToday,
      appointmentsWeek,
      appointmentsMonth
    ] = await Promise.all([
      // Workflows
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', today),
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', weekAgo),
      supabase.from('workflow_executions')
        .select('status, duration_ms')
        .gte('timestamp', monthAgo),
      
      // Interacciones
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, confidence_score')
        .gte('timestamp', today),
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, confidence_score')
        .gte('timestamp', weekAgo),
      supabase.from('user_interactions')
        .select('user_id, response_time_ms, confidence_score')
        .gte('timestamp', monthAgo),
      
      // Citas
      supabase.from('appointments')
        .select('status, user_id')
        .gte('timestamp', today),
      supabase.from('appointments')
        .select('status, user_id')
        .gte('timestamp', weekAgo),
      supabase.from('appointments')
        .select('status, user_id')
        .gte('timestamp', monthAgo),
    ])

    // Procesar datos
    const workflowTodayData = workflowToday.data || []
    const workflowWeekData = workflowWeek.data || []
    const workflowMonthData = workflowMonth.data || []
    
    const interactionsTodayData = interactionsToday.data || []
    const interactionsWeekData = interactionsWeek.data || []
    const interactionsMonthData = interactionsMonth.data || []
    
    const appointmentsTodayData = appointmentsToday.data || []
    const appointmentsWeekData = appointmentsWeek.data || []
    const appointmentsMonthData = appointmentsMonth.data || []

    return {
      // Uso general
      workflow_executions_today: workflowTodayData.length,
      workflow_executions_week: workflowWeekData.length,
      workflow_executions_month: workflowMonthData.length,
      average_execution_duration: workflowTodayData.length > 0 
        ? Math.round(workflowTodayData.reduce((sum, w) => sum + (w.duration_ms || 0), 0) / workflowTodayData.length)
        : 0,
      failed_executions_today: workflowTodayData.filter(w => w.status === 'failed').length,
      success_rate: workflowTodayData.length > 0
        ? Math.round((workflowTodayData.filter(w => w.status === 'success').length / workflowTodayData.length) * 100 * 10) / 10
        : 0,

      // Interacción
      total_questions_today: interactionsTodayData.length,
      total_questions_week: interactionsWeekData.length,
      total_questions_month: interactionsMonthData.length,
      appointments_scheduled_today: appointmentsTodayData.length,
      appointments_scheduled_week: appointmentsWeekData.length,
      appointments_scheduled_month: appointmentsMonthData.length,
      unique_users_today: new Set(interactionsTodayData.map(i => i.user_id)).size,
      unique_users_week: new Set(interactionsWeekData.map(i => i.user_id)).size,
      unique_users_month: new Set(interactionsMonthData.map(i => i.user_id)).size,
      average_response_time: interactionsTodayData.length > 0
        ? Math.round(interactionsTodayData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsTodayData.length)
        : 0,

      // Conversión
      appointment_conversion_rate: appointmentsMonthData.length > 0
        ? Math.round((appointmentsMonthData.filter(a => a.status === 'completed').length / appointmentsMonthData.length) * 100 * 10) / 10
        : 0,
      high_confidence_responses: interactionsMonthData.length > 0
        ? Math.round((interactionsMonthData.filter(i => (i.confidence_score || 0) > 0.8).length / interactionsMonthData.length) * 100 * 10) / 10
        : 0,
      user_to_appointment_rate: 0, // Requiere cálculo más complejo
      appointment_completion_rate: appointmentsMonthData.length > 0
        ? Math.round((appointmentsMonthData.filter(a => a.status === 'completed').length / appointmentsMonthData.length) * 100 * 10) / 10
        : 0,

      // Tendencias (usando datos mock por ahora - requiere consultas más complejas)
      questions_trend: mockDashboardMetrics.questions_trend,
      executions_trend: mockDashboardMetrics.executions_trend,
      appointments_trend: mockDashboardMetrics.appointments_trend
    }

  } catch (error) {
    console.error('Error calculando métricas del dashboard:', error)
    // Fallback a datos mock en caso de error
    return mockDashboardMetrics
  }
} 