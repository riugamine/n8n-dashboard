import { 
  WorkflowExecution, 
  UserInteraction, 
  Appointment, 
  User, 
  FrequentQuestion,
  DashboardMetrics
} from './types'

// =============================================================================
// DATOS PLACEHOLDER PARA DESARROLLO
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
// 2. INTERACCIONES DE USUARIOS
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

  return {
    user_id: `user_${Math.floor(Math.random() * 50) + 1}`,
    phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    question,
    response: `Respuesta automática para: ${question}`,
    response_time_ms: responseTime,
    confidence_score: confidence,
    intent_detected: confidence > 0.8 ? 'appointment_booking' : 'general_inquiry',
    session_id: `session_${generateId()}`,
    interaction_type: confidence > 0.7 ? 'appointment_request' : 'question',
    timestamp: getRandomDate(30),
    created_at: getRandomDate(30)
  }
})

// =============================================================================
// 3. CITAS
// =============================================================================

export const mockAppointments: Appointment[] = Array.from({ length: 85 }, () => {
  const statuses: Appointment['status'][] = ['requested', 'confirmed', 'completed', 'canceled', 'no_show']
  const weights = [0.1, 0.3, 0.45, 0.1, 0.05] // Probabilidades
  
  let status: Appointment['status'] = 'requested'
  const rand = Math.random()
  let cumulative = 0
  for (let j = 0; j < statuses.length; j++) {
    cumulative += weights[j]
    if (rand <= cumulative) {
      status = statuses[j]
      break
    }
  }

  const requestedDate = getRandomDate(60)
  const confirmedDate = status !== 'requested' ? getRandomDate(45) : undefined

  return {
    appointment_id: `apt_${generateId()}`,
    user_id: `user_${Math.floor(Math.random() * 50) + 1}`,
    phone_number: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    requested_date: requestedDate,
    confirmed_date: confirmedDate,
    appointment_type: ['consulta_general', 'control', 'especialista', 'urgencia'][Math.floor(Math.random() * 4)],
    status,
    notes: Math.random() > 0.7 ? 'Paciente con síntomas específicos' : undefined,
    timestamp: requestedDate,
    created_at: requestedDate
  }
})

// =============================================================================
// 4. USUARIOS
// =============================================================================

export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const firstInteraction = getRandomDate(90)
  const totalInteractions = Math.floor(Math.random() * 15) + 1
  const appointmentsRequested = Math.floor(Math.random() * 3)
  const appointmentsCompleted = Math.floor(appointmentsRequested * Math.random())

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
    appointments_completed: appointmentsCompleted,
    conversion_status: conversionStatus,
    timestamp: firstInteraction,
    created_at: firstInteraction
  }
})

// =============================================================================
// 5. PREGUNTAS FRECUENTES
// =============================================================================

export const mockFrequentQuestions: FrequentQuestion[] = [
  {
    id: 1,
    question_pattern: 'horarios',
    question_category: 'informacion_general',
    count: 45,
    last_asked: getRandomDate(1),
    timestamp: getRandomDate(1),
    sample_questions: [
      '¿Cuáles son sus horarios?',
      '¿A qué hora abren?',
      '¿Hasta qué hora atienden?',
      'Horarios de atención'
    ]
  },
  {
    id: 2,
    question_pattern: 'agendar_cita',
    question_category: 'citas',
    count: 38,
    last_asked: getRandomDate(1),
    timestamp: getRandomDate(1),
    sample_questions: [
      '¿Cómo puedo agendar una cita?',
      'Quiero una cita',
      'Necesito agendar',
      '¿Hay disponibilidad?'
    ]
  },
  {
    id: 3,
    question_pattern: 'servicios',
    question_category: 'informacion_general',
    count: 32,
    last_asked: getRandomDate(2),
    timestamp: getRandomDate(2),
    sample_questions: [
      '¿Qué servicios ofrecen?',
      '¿Qué especialidades tienen?',
      'Lista de servicios',
      '¿Qué médicos hay?'
    ]
  },
  {
    id: 4,
    question_pattern: 'ubicacion',
    question_category: 'informacion_general',
    count: 28,
    last_asked: getRandomDate(1),
    timestamp: getRandomDate(1),
    sample_questions: [
      '¿Dónde están ubicados?',
      'Dirección del consultorio',
      '¿Cómo llegar?',
      'Ubicación'
    ]
  },
  {
    id: 5,
    question_pattern: 'precios',
    question_category: 'costos',
    count: 25,
    last_asked: getRandomDate(3),
    timestamp: getRandomDate(3),
    sample_questions: [
      '¿Cuánto cuesta?',
      'Precio de consulta',
      '¿Cuáles son sus tarifas?',
      'Costos de servicios'
    ]
  }
]

// =============================================================================
// 6. MÉTRICAS AGREGADAS PARA DASHBOARD
// =============================================================================

export const mockDashboardMetrics: DashboardMetrics = {
  // Uso general
  workflow_executions_today: 24,
  workflow_executions_week: 165,
  workflow_executions_month: 650,
  average_execution_duration: 1800,
  failed_executions_today: 2,
  success_rate: 91.3,

  // Interacción
  total_questions_today: 18,
  total_questions_week: 125,
  total_questions_month: 485,
  appointments_scheduled_today: 5,
  appointments_scheduled_week: 32,
  appointments_scheduled_month: 125,
  unique_users_today: 12,
  unique_users_week: 78,
  unique_users_month: 195,
  average_response_time: 1250,

  // Conversión
  appointment_conversion_rate: 73.2,
  high_confidence_responses: 89.5,
  user_to_appointment_rate: 42.8,
  appointment_completion_rate: 87.3,

  // Tendencias (últimos 30 días)
  questions_trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 25) + 5
  })),

  executions_trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 30) + 10,
    success_rate: Math.random() * 15 + 85 // 85% - 100%
  })),

  appointments_trend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requested: Math.floor(Math.random() * 8) + 2,
    completed: Math.floor(Math.random() * 6) + 1
  }))
}

// =============================================================================
// FUNCIONES HELPER PARA SIMULAR DATOS
// =============================================================================

export const getMetricsByType = (type: string, limit: number = 100) => {
  switch (type) {
    case 'workflow_execution':
      return mockWorkflowExecutions.slice(0, limit)
    case 'user_interaction':
      return mockUserInteractions.slice(0, limit)
    case 'appointment':
      return mockAppointments.slice(0, limit)
    case 'user':
      return mockUsers.slice(0, limit)
    case 'frequent_question':
      return mockFrequentQuestions.slice(0, limit)
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