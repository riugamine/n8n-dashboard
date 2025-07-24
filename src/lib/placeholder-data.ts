import { 
  WorkflowExecution, 
  UserInteraction, 
  User, 
  DashboardMetrics
} from './types'

// =============================================================================
// DATOS PLACEHOLDER SIMPLIFICADOS PARA DESARROLLO
// =============================================================================

// Función helper para generar fechas aleatorias
const getRandomDate = (daysAgo: number = 30): string => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Función helper para generar ID único
const generateId = (): string => Math.random().toString(36).substring(2, 11)

// =============================================================================
// 1. EJECUCIONES DE WORKFLOW
// =============================================================================

export const mockWorkflowExecutions: WorkflowExecution[] = Array.from({ length: 150 }, () => {
  const isSuccess = Math.random() > 0.15 // 85% de éxito
  const startTime = getRandomDate(7)
  const duration = Math.floor(Math.random() * 5000) + 500 // 500ms - 5.5s
  const endTime = new Date(new Date(startTime).getTime() + duration).toISOString()

  return {
    workflow_id: 'workflow_assistant_main',
    workflow_name: 'Asistente Principal n8n',
    execution_id: `exec_${generateId()}`,
    status: isSuccess ? 'success' : (Math.random() > 0.8 ? 'failed' : 'success'),
    duration_ms: duration,
    start_time: startTime,
    end_time: endTime,
    timestamp: startTime,
    node_count: Math.floor(Math.random() * 15) + 5,
    error_message: !isSuccess ? 'Error en conexión con API externa' : undefined,
    created_at: startTime
  }
})

// =============================================================================
// 2. INTERACCIONES DE USUARIOS (con tracking de citas simplificado)
// =============================================================================

export const mockUserInteractions: UserInteraction[] = Array.from({ length: 300 }, () => {
  const questions = [
    '¿Cuáles son sus horarios de atención?',
    '¿Cómo puedo agendar una cita?',
    '¿Qué servicios ofrecen?',
    '¿Cuál es la dirección?',
    '¿Tienen disponibilidad para mañana?',
    '¿Cuánto cuesta la consulta?',
    '¿Necesito llevar algún documento?',
    '¿Atienden por seguro médico?',
    'Quiero cancelar mi cita',
    '¿Hay estacionamiento disponible?'
  ]

  const question = questions[Math.floor(Math.random() * questions.length)]
  const responseTime = Math.floor(Math.random() * 3000) + 200 // 200ms - 3.2s
  const confidence = Math.random()
  
  // Determinar si es relacionado con citas
  const isAppointmentRelated = question.includes('agendar') || question.includes('cita') || question.includes('disponibilidad')
  const appointmentRequested = isAppointmentRelated && Math.random() > 0.3 // 70% de prob si es relacionado
  const appointmentConfirmed = appointmentRequested && Math.random() > 0.2 // 80% de confirmación
  const appointmentCompleted = appointmentConfirmed && Math.random() > 0.15 // 85% de completación

  return {
    user_id: `user_${Math.floor(Math.random() * 50) + 1}`,
    phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    question,
    response: `Respuesta automática para: ${question}`,
    response_time_ms: responseTime,
    confidence_score: confidence,
    intent_detected: appointmentRequested ? 'appointment_booking' : 'general_inquiry',
    session_id: `session_${generateId()}`,
    interaction_type: appointmentRequested ? 'appointment_request' : 'question',
    appointment_requested: appointmentRequested,
    appointment_confirmed: appointmentConfirmed,
    appointment_completed: appointmentCompleted,
    timestamp: getRandomDate(30),
    created_at: getRandomDate(30)
  }
})

// =============================================================================
// 3. USUARIOS (con métricas de conversión simplificadas)
// =============================================================================

export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const firstInteraction = getRandomDate(90)
  const totalInteractions = Math.floor(Math.random() * 15) + 1
  const appointmentsRequested = Math.floor(Math.random() * 3)
  const appointmentsConfirmed = Math.floor(appointmentsRequested * 0.8) // 80% confirmación
  const appointmentsCompleted = Math.floor(appointmentsConfirmed * 0.85) // 85% completación

  let conversionStatus: User['conversion_status'] = 'new'
  if (appointmentsCompleted > 0) conversionStatus = 'converted'
  else if (appointmentsRequested > 0) conversionStatus = 'engaged'
  else if (totalInteractions > 5) conversionStatus = 'engaged'

  return {
    user_id: `user_${i + 1}`,
    phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    first_interaction: firstInteraction,
    last_interaction: getRandomDate(7),
    total_interactions: totalInteractions,
    appointments_requested: appointmentsRequested,
    appointments_confirmed: appointmentsConfirmed,
    appointments_completed: appointmentsCompleted,
    conversion_status: conversionStatus,
    timestamp: firstInteraction,
    created_at: firstInteraction
  }
})

// =============================================================================
// 4. MÉTRICAS AGREGADAS PARA DASHBOARD (Las 9 métricas esenciales)
// =============================================================================

export const mockDashboardMetrics: DashboardMetrics = {
  // 1. Número de ejecuciones del flujo
  total_executions_today: 24,
  total_executions_week: 165,
  total_executions_month: 650,

  // 2. Ejecuciones fallidas
  failed_executions_today: 2,
  failed_executions_week: 12,
  failed_executions_month: 48,

  // 3. Tasa de éxito del flujo
  success_rate_today: 91.7,
  success_rate_week: 92.7,
  success_rate_month: 92.6,

  // 4. Total de preguntas recibidas
  total_questions_today: 18,
  total_questions_week: 125,
  total_questions_month: 485,

  // 5. Usuarios atendidos
  unique_users_today: 12,
  unique_users_week: 78,
  unique_users_month: 195,

  // 6. Cantidad de citas agendadas
  appointments_requested_today: 5,
  appointments_requested_week: 32,
  appointments_requested_month: 125,

  // 7. Tiempo promedio de respuesta
  average_response_time_today: 1250,
  average_response_time_week: 1180,
  average_response_time_month: 1200,

  // 8. Tasa de completación de citas (citas concretadas / citas solicitadas)
  appointment_completion_rate_month: 87.2,

  // 9. Tasa de conversión (usuarios → cita agendada)
  user_conversion_rate_month: 64.1,

  // Tendencias simplificadas (últimos 30 días)
  executions_trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total: Math.floor(Math.random() * 30) + 10,
    success_rate: Math.random() * 15 + 85 // 85% - 100%
  })),

  questions_trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    questions: Math.floor(Math.random() * 25) + 5,
    users: Math.floor(Math.random() * 15) + 3,
    appointments: Math.floor(Math.random() * 8) + 1
  }))
}

// =============================================================================
// FUNCIONES HELPER SIMPLIFICADAS
// =============================================================================

export const getMetricsByType = (type: string, limit: number = 100) => {
  switch (type) {
    case 'workflow_execution':
      return mockWorkflowExecutions.slice(0, limit)
    case 'user_interaction':
      return mockUserInteractions.slice(0, limit)
    case 'user':
      return mockUsers.slice(0, limit)
    default:
      return []
  }
}

export const getMetricsByDateRange = (type: string, startDate: string, endDate: string) => {
  const data = getMetricsByType(type, 1000)
  return data.filter(item => {
    const itemDate = new Date(item.timestamp)
    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
  })
}

// =============================================================================
// FUNCIONES PARA SIMULAR CÁLCULOS DE MÉTRICAS EN DESARROLLO
// =============================================================================

export const calculateMockMetrics = () => {
  return {
    // Métricas de ejecución
    total_executions: mockWorkflowExecutions.length,
    successful_executions: mockWorkflowExecutions.filter(e => e.status === 'success').length,
    failed_executions: mockWorkflowExecutions.filter(e => e.status === 'failed').length,
    success_rate: Math.round((mockWorkflowExecutions.filter(e => e.status === 'success').length / mockWorkflowExecutions.length) * 100 * 10) / 10,
    
    // Métricas de interacción
    total_questions: mockUserInteractions.length,
    unique_users: new Set(mockUserInteractions.map(i => i.user_id)).size,
    appointments_requested: mockUserInteractions.filter(i => i.appointment_requested).length,
    appointments_completed: mockUserInteractions.filter(i => i.appointment_completed).length,
    average_response_time: Math.round(mockUserInteractions.reduce((acc, i) => acc + i.response_time_ms, 0) / mockUserInteractions.length),
    
    // Métricas de conversión
    appointment_completion_rate: Math.round(
      (mockUserInteractions.filter(i => i.appointment_completed).length / 
       mockUserInteractions.filter(i => i.appointment_requested).length) * 100 * 10
    ) / 10,
    user_conversion_rate: Math.round(
      (new Set(mockUserInteractions.filter(i => i.appointment_requested).map(i => i.user_id)).size / 
       new Set(mockUserInteractions.map(i => i.user_id)).size) * 100 * 10
    ) / 10
  }
} 