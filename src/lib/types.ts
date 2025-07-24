// =============================================================================
// TIPOS DE DATOS SIMPLIFICADOS PARA MÉTRICAS DEL ASISTENTE N8N
// =============================================================================

export interface BaseMetric {
  id?: number
  timestamp: string
  created_at?: string
}

// =============================================================================
// 1. MÉTRICAS DE EJECUCIÓN DE FLUJO
// =============================================================================

export interface WorkflowExecution extends BaseMetric {
  workflow_id: string
  workflow_name: string
  execution_id: string
  status: 'success' | 'failed' | 'canceled' | 'running'
  duration_ms: number
  start_time: string
  end_time: string
  error_message?: string
  node_count: number
}

export interface WorkflowStats {
  total_executions: number
  successful_executions: number
  failed_executions: number
  average_duration_ms: number
  success_rate: number
  period: 'day' | 'week' | 'month'
  date: string
}

// =============================================================================
// 2. MÉTRICAS DE INTERACCIÓN (con tracking de citas simplificado)
// =============================================================================

export interface UserInteraction extends BaseMetric {
  user_id: string
  phone_number?: string
  question: string
  response: string
  response_time_ms: number
  confidence_score?: number
  intent_detected?: string
  session_id: string
  interaction_type: 'question' | 'appointment_request' | 'followup'
  // Campos para tracking de citas simplificado
  appointment_requested: boolean
  appointment_confirmed: boolean
  appointment_completed: boolean
}

// =============================================================================
// 3. MÉTRICAS DE CONVERSIÓN SIMPLIFICADAS
// =============================================================================

export interface User extends BaseMetric {
  user_id: string
  phone_number?: string
  first_interaction: string
  last_interaction: string
  total_interactions: number
  appointments_requested: number
  appointments_confirmed: number
  appointments_completed: number
  conversion_status: 'new' | 'engaged' | 'converted' | 'churned'
}

// =============================================================================
// MÉTRICAS AGREGADAS PARA DASHBOARD (Las 9 métricas esenciales)
// =============================================================================

export interface DashboardMetrics {
  // 1. Número de veces que se ejecutó el flow
  total_executions_today: number
  total_executions_week: number
  total_executions_month: number

  // 2. Cantidad de ejecuciones fallidas
  failed_executions_today: number
  failed_executions_week: number
  failed_executions_month: number

  // 3. Tasa de éxito de flujo
  success_rate_today: number
  success_rate_week: number
  success_rate_month: number

  // 4. Total de preguntas recibidas
  total_questions_today: number
  total_questions_week: number
  total_questions_month: number

  // 5. Usuarios atendidos
  unique_users_today: number
  unique_users_week: number
  unique_users_month: number

  // 6. Cantidad de citas agendadas
  appointments_requested_today: number
  appointments_requested_week: number
  appointments_requested_month: number

  // 7. Tiempo promedio de respuesta
  average_response_time_today: number
  average_response_time_week: number
  average_response_time_month: number

  // 8. Tasa de completación de citas (citas concretadas / citas solicitadas)
  appointment_completion_rate_month: number

  // 9. Tasa de conversión (usuarios → cita agendada)
  user_conversion_rate_month: number

  // Tendencias simplificadas (últimos 30 días)
  executions_trend: Array<{
    date: string
    total: number
    success_rate: number
  }>
  
  questions_trend: Array<{
    date: string
    questions: number
    users: number
    appointments: number
  }>
}

// =============================================================================
// TIPOS PARA API SIMPLIFICADOS
// =============================================================================

export interface MetricPayload {
  type: 'workflow_execution' | 'user_interaction' | 'user_update'
  data: WorkflowExecution | UserInteraction | User
  timestamp?: string
}

export interface MetricResponse {
  success: boolean
  message?: string
  data?: unknown
  count?: number
}

export interface MetricQuery {
  type?: string
  startDate?: string
  endDate?: string
  userId?: string
  workflowId?: string
  status?: string
  limit?: number
  offset?: number
}

// =============================================================================
// TIPOS PARA FUNCIONES DE MÉTRICAS
// =============================================================================

export interface ExecutionMetrics {
  total_executions: number
  successful_executions: number
  failed_executions: number
  success_rate: number
  average_duration_ms: number
}

export interface InteractionMetrics {
  total_questions: number
  unique_users: number
  appointments_requested: number
  appointments_completed: number
  average_response_time_ms: number
  conversion_rate: number
} 