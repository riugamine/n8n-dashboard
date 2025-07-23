# 📊 Guía de Métricas para N8N Dashboard

Esta guía explica cómo usar las nuevas métricas específicas del asistente n8n, incluyendo la estructura de datos, endpoints de API y ejemplos de uso.

## 🎯 Tipos de Métricas Disponibles

### 1. **Métricas de Uso General** 🔁
Monitorea el rendimiento de los workflows de n8n.

#### Estructura:
```typescript
interface WorkflowExecution {
  workflow_id: string           // ID del workflow
  workflow_name: string         // Nombre descriptivo
  execution_id: string          // ID único de ejecución
  status: 'success' | 'failed' | 'canceled' | 'running'
  duration_ms: number           // Duración en milisegundos
  start_time: string           // Timestamp de inicio
  end_time: string             // Timestamp de fin
  error_message?: string       // Mensaje de error (si aplica)
  node_count: number           // Cantidad de nodos ejecutados
  timestamp: string            // Timestamp del evento
}
```

#### Ejemplo de uso desde n8n:
```json
POST /api/metrics
{
  "type": "workflow_execution",
  "data": {
    "workflow_id": "workflow_assistant_main",
    "workflow_name": "Asistente Principal",
    "execution_id": "exec_12345",
    "status": "success",
    "duration_ms": 1500,
    "start_time": "2025-01-23T10:00:00Z",
    "end_time": "2025-01-23T10:00:01.5Z",
    "node_count": 8
  }
}
```

### 2. **Métricas de Interacción** 💬
Rastrea las conversaciones con usuarios.

#### Estructura:
```typescript
interface UserInteraction {
  user_id: string              // ID único del usuario
  phone_number?: string        // Teléfono del usuario
  question: string             // Pregunta del usuario
  response: string             // Respuesta del asistente
  response_time_ms: number     // Tiempo de respuesta
  confidence_score?: number    // Confianza de la respuesta (0-1)
  intent_detected?: string     // Intención detectada
  session_id: string           // ID de la sesión
  interaction_type: 'question' | 'appointment_request' | 'followup'
  timestamp: string
}
```

#### Ejemplo de uso desde n8n:
```json
POST /api/metrics
{
  "type": "user_interaction",
  "data": {
    "user_id": "user_123",
    "phone_number": "+1234567890",
    "question": "¿Cuáles son sus horarios?",
    "response": "Atendemos de lunes a viernes de 8:00 a 18:00",
    "response_time_ms": 1200,
    "confidence_score": 0.95,
    "intent_detected": "horarios",
    "session_id": "session_456",
    "interaction_type": "question"
  }
}
```

### 3. **Métricas de Citas** 📅
Gestiona el ciclo de vida de las citas.

#### Estructura:
```typescript
interface Appointment {
  appointment_id: string       // ID único de la cita
  user_id: string             // ID del usuario
  phone_number?: string       // Teléfono del usuario
  requested_date: string      // Fecha solicitada
  confirmed_date?: string     // Fecha confirmada
  appointment_type: string    // Tipo de cita
  status: 'requested' | 'confirmed' | 'completed' | 'canceled' | 'no_show'
  notes?: string              // Notas adicionales
  source_interaction_id?: string // ID de interacción origen
  timestamp: string
}
```

#### Ejemplo de uso desde n8n:
```json
POST /api/metrics
{
  "type": "appointment",
  "data": {
    "appointment_id": "apt_789",
    "user_id": "user_123",
    "phone_number": "+1234567890",
    "requested_date": "2025-01-25T14:00:00Z",
    "confirmed_date": "2025-01-25T14:00:00Z",
    "appointment_type": "consulta_general",
    "status": "confirmed",
    "notes": "Primera consulta"
  }
}
```

### 4. **Métricas de Usuarios** 👤
Perfil y comportamiento de usuarios únicos.

#### Estructura:
```typescript
interface User {
  user_id: string             // ID único del usuario
  phone_number?: string       // Teléfono
  first_interaction: string   // Primera interacción
  last_interaction: string    // Última interacción
  total_interactions: number  // Total de interacciones
  appointments_requested: number // Citas solicitadas
  appointments_completed: number // Citas completadas
  conversion_status: 'new' | 'engaged' | 'converted' | 'churned'
  timestamp: string
}
```

#### Ejemplo de uso desde n8n:
```json
POST /api/metrics
{
  "type": "user_update",
  "data": {
    "user_id": "user_123",
    "phone_number": "+1234567890",
    "first_interaction": "2025-01-20T10:00:00Z",
    "last_interaction": "2025-01-23T15:30:00Z",
    "total_interactions": 5,
    "appointments_requested": 1,
    "appointments_completed": 0,
    "conversion_status": "engaged"
  }
}
```

### 5. **Preguntas Frecuentes** ❓
Análisis de patrones en preguntas.

#### Estructura:
```typescript
interface FrequentQuestion {
  question_pattern: string    // Patrón de la pregunta
  question_category: string   // Categoría
  count: number              // Cantidad de veces preguntada
  last_asked: string         // Última vez preguntada
  sample_questions: string[] // Ejemplos de preguntas
}
```

#### Ejemplo de uso desde n8n:
```json
POST /api/metrics
{
  "type": "frequent_question",
  "data": {
    "question_pattern": "horarios",
    "question_category": "informacion_general",
    "count": 45,
    "last_asked": "2025-01-23T16:00:00Z",
    "sample_questions": [
      "¿Cuáles son sus horarios?",
      "¿A qué hora abren?",
      "Horarios de atención"
    ]
  }
}
```

## 🔌 Endpoints de API

### POST /api/metrics
Crear nueva métrica.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "type": "workflow_execution" | "user_interaction" | "appointment" | "user_update" | "frequent_question",
  "data": { /* datos según el tipo */ },
  "timestamp": "2025-01-23T10:00:00Z" // opcional
}
```

### GET /api/metrics

**Parámetros de consulta:**

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `type` | Tipo de métrica | `?type=user_interaction` |
| `limit` | Límite de resultados | `?limit=50` |
| `startDate` | Fecha inicio | `?startDate=2025-01-20T00:00:00Z` |
| `endDate` | Fecha fin | `?endDate=2025-01-23T23:59:59Z` |
| `userId` | Filtrar por usuario | `?userId=user_123` |
| `workflowId` | Filtrar por workflow | `?workflowId=workflow_main` |
| `status` | Filtrar por estado | `?status=success` |
| `mock` | Usar datos de prueba | `?mock=true` |

**Ejemplos:**

```bash
# Obtener métricas del dashboard
curl "http://localhost:3000/api/metrics?type=dashboard"

# Obtener interacciones de usuario específico
curl "http://localhost:3000/api/metrics?type=user_interaction&userId=user_123"

# Obtener ejecuciones fallidas de la última semana
curl "http://localhost:3000/api/metrics?type=workflow_execution&status=failed&startDate=2025-01-16T00:00:00Z"

# Usar datos de prueba para desarrollo
curl "http://localhost:3000/api/metrics?type=dashboard&mock=true"
```

## 🧪 Modo de Desarrollo (Mock Data)

Para desarrollo y testing, puedes usar datos simulados:

```bash
# Ver métricas del dashboard con datos de prueba
GET /api/metrics?type=dashboard&mock=true

# Ver cualquier tipo de métrica con datos simulados
GET /api/metrics?type=user_interaction&mock=true&limit=10
```

## 💡 Implementación en n8n

### 1. **Al finalizar una ejecución de workflow:**

```javascript
// En el último nodo de tu workflow
const executionData = {
  type: "workflow_execution",
  data: {
    workflow_id: $workflow.id,
    workflow_name: $workflow.name,
    execution_id: $execution.id,
    status: $execution.status, // 'success' o 'failed'
    duration_ms: $execution.duration,
    start_time: $execution.startTime,
    end_time: $execution.endTime,
    node_count: $execution.nodeCount,
    error_message: $execution.error?.message
  }
};

// Enviar al dashboard
$http.post('http://localhost:3000/api/metrics', executionData);
```

### 2. **Después de cada interacción con el usuario:**

```javascript
// Después de procesar una pregunta del usuario
const interactionData = {
  type: "user_interaction",
  data: {
    user_id: $('Webhook').first().json.from,
    phone_number: $('Webhook').first().json.from,
    question: $('Webhook').first().json.text,
    response: $('OpenAI Chat Model').first().json.choices[0].message.content,
    response_time_ms: Date.now() - $execution.startTime,
    confidence_score: $('OpenAI Chat Model').first().json.usage.confidence,
    intent_detected: detectIntent($('Webhook').first().json.text),
    session_id: $('Webhook').first().json.session_id,
    interaction_type: determineType($('Webhook').first().json.text)
  }
};

$http.post('http://localhost:3000/api/metrics', interactionData);
```

### 3. **Al agendar una cita:**

```javascript
// Cuando se agenda una cita exitosamente
const appointmentData = {
  type: "appointment",
  data: {
    appointment_id: generateId(),
    user_id: $('Webhook').first().json.from,
    phone_number: $('Webhook').first().json.from,
    requested_date: extractDate($('Webhook').first().json.text),
    appointment_type: "consulta_general",
    status: "requested"
  }
};

$http.post('http://localhost:3000/api/metrics', appointmentData);
```

### 4. **Actualizar perfil de usuario:**

```javascript
// Actualizar estadísticas del usuario
const userData = {
  type: "user_update",
  data: {
    user_id: $('Webhook').first().json.from,
    phone_number: $('Webhook').first().json.from,
    last_interaction: new Date().toISOString(),
    total_interactions: getUserInteractionCount($('Webhook').first().json.from) + 1,
    conversion_status: determineConversionStatus($('Webhook').first().json.from)
  }
};

$http.post('http://localhost:3000/api/metrics', userData);
```

## 📈 Métricas Calculadas en el Dashboard

El dashboard calcula automáticamente:

### **Métricas de Uso General:**
- 🔁 Ejecuciones por día/semana/mes
- ⏱️ Duración promedio de ejecución
- ⚠️ Cantidad y porcentaje de fallos
- ✅ Tasa de éxito del flujo

### **Métricas de Interacción:**
- 💬 Total de preguntas recibidas
- 👥 Usuarios únicos atendidos
- ⏰ Tiempo promedio de respuesta
- 🎯 Preguntas más frecuentes

### **Métricas de Conversión:**
- 📅 Citas agendadas vs completadas
- 🔄 Tasa de conversión usuario → cita
- ✨ Respuestas de alta confianza
- 📊 Análisis de embudo de conversión

## 🔧 Configuración de Base de Datos

1. **Ejecutar el schema SQL:**
   ```sql
   -- Ver archivo database-schema.sql para el script completo
   ```

2. **Variables de entorno:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
   ```

3. **Verificar conexión:**
   ```bash
   curl "http://localhost:3000/api/metrics?type=dashboard&mock=true"
   ```

## 🚀 Próximos Pasos

1. **Configurar tu base de datos Supabase** usando `database-schema.sql`
2. **Implementar los endpoints** en tus workflows de n8n
3. **Personalizar las métricas** según tus necesidades específicas
4. **Configurar alertas** para métricas críticas
5. **Exportar reportes** periódicos

## 📞 Soporte

- Consulta `SETUP-SUPABASE.md` para configuración de base de datos
- Revisa `README.md` para información general del proyecto
- Utiliza el modo `mock=true` para desarrollo y testing 