// =============================================================================
// TIPOS DE DATOS PARA MÉTRICAS DEL ASISTENTE N8N
// =============================================================================

export interface BaseMetric {
  id?: number
  timestamp: string
  created_at?: string
}

// =============================================================================
// 1. MÉTRICAS DE USO GENERAL
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
// 2. MÉTRICAS DE INTERACCIÓN
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
}

export interface FrequentQuestion extends BaseMetric {
  id?: number
  question_pattern: string
  question_category: string
  count: number
  last_asked: string
  sample_questions: string[]
}

// =============================================================================
// 3. MÉTRICAS DE CONVERSIÓN
// =============================================================================

export interface Appointment extends BaseMetric {
  appointment_id: string
  user_id: string
  phone_number?: string
  requested_date: string
  confirmed_date?: string
  appointment_type: string
  status: 'requested' | 'confirmed' | 'completed' | 'canceled' | 'no_show'
  notes?: string
  source_interaction_id?: string
}

export interface User extends BaseMetric {
  user_id: string
  phone_number?: string
  first_interaction: string
  last_interaction: string
  total_interactions: number
  appointments_requested: number
  appointments_completed: number
  conversion_status: 'new' | 'engaged' | 'converted' | 'churned'
}

// =============================================================================
// MÉTRICAS AGREGADAS PARA DASHBOARD
// =============================================================================

export interface DashboardMetrics {
  // Uso general
  workflow_executions_today: number
  workflow_executions_week: number
  workflow_executions_month: number
  average_execution_duration: number
  failed_executions_today: number
  success_rate: number

  // Interacción
  total_questions_today: number
  total_questions_week: number
  total_questions_month: number
  appointments_scheduled_today: number
  appointments_scheduled_week: number
  appointments_scheduled_month: number
  unique_users_today: number
  unique_users_week: number
  unique_users_month: number
  average_response_time: number

  // Conversión
  appointment_conversion_rate: number
  high_confidence_responses: number
  user_to_appointment_rate: number
  appointment_completion_rate: number

  // Tendencias
  questions_trend: Array<{date: string, count: number}>
  executions_trend: Array<{date: string, count: number, success_rate: number}>
  appointments_trend: Array<{date: string, requested: number, completed: number}>
}

// =============================================================================
// TIPOS PARA API
// =============================================================================

export interface MetricPayload {
  type: 'workflow_execution' | 'user_interaction' | 'appointment' | 'user_update' | 'frequent_question'
  data: WorkflowExecution | UserInteraction | Appointment | User | FrequentQuestion
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