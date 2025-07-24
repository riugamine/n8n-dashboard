# 🔗 Configuración de Webhook N8N para Métricas

## 📡 **Configuración del Nodo HTTP Request**

### 1. **Configuración Básica**
```
URL: http://tu-dominio.com/api/metrics
Method: POST
Content-Type: application/json
```

### 2. **Headers Recomendados**
```json
{
  "Content-Type": "application/json",
  "User-Agent": "n8n-webhook-metrics/1.0"
}
```

### 3. **Body - Estructura del JSON**

#### Para Interacciones de Usuario:
```json
{
  "type": "user_interaction",
  "data": {
    "user_id": "{{ $json.userId }}",
    "phone_number": "{{ $json.phoneNumber }}",
    "question": "{{ $json.userMessage }}",
    "response": "{{ $json.assistantResponse }}",
    "response_time_ms": {{ $json.responseTime }},
    "confidence_score": {{ $json.confidence }},
    "intent_detected": "{{ $json.detectedIntent }}",
    "session_id": "{{ $json.sessionId }}",
    "interaction_type": "{{ $json.interactionType }}",
    "timestamp": "{{ $now }}"
  }
}
```

## 🎯 **Variables de N8N Típicas**

| Variable N8N | Campo Destino | Ejemplo |
|--------------|---------------|---------|
| `$json.userId` | `user_id` | `"user_12345"` |
| `$json.phoneNumber` | `phone_number` | `"+34612345678"` |
| `$json.userMessage` | `question` | `"¿Horarios?"` |
| `$json.assistantResponse` | `response` | `"8:00-18:00"` |
| `$json.responseTime` | `response_time_ms` | `1200` |
| `$json.confidence` | `confidence_score` | `0.95` |
| `$json.detectedIntent` | `intent_detected` | `"horarios"` |
| `$json.sessionId` | `session_id` | `"sess_001"` |
| `$json.interactionType` | `interaction_type` | `"question"` |
| `$now` | `timestamp` | `"2024-01-15T..."` |

## 🔧 **Configuración Step by Step**

### **Paso 1: Agregar Nodo HTTP Request**
1. Arrastra el nodo **HTTP Request** al workflow
2. Conéctalo después del nodo que procesa la respuesta del usuario

### **Paso 2: Configurar URL y Método**
```
URL: https://tu-dashboard.vercel.app/api/metrics
Method: POST
```

### **Paso 3: Configurar Headers**
En la sección **Headers**:
```
Name: Content-Type
Value: application/json
```

### **Paso 4: Configurar Body**
En **Body** → **JSON**:
```json
{
  "type": "user_interaction",
  "data": {
    "user_id": "{{ $('Trigger').first().json.from }}",
    "phone_number": "{{ $('Trigger').first().json.from }}",
    "question": "{{ $('Trigger').first().json.body }}",
    "response": "{{ $('OpenAI').first().json.choices[0].message.content }}",
    "response_time_ms": "{{ Date.now() - $('Trigger').first().json.timestamp }}",
    "confidence_score": 0.9,
    "intent_detected": "{{ $('Intent Classifier').first().json.intent }}",
    "session_id": "{{ $('Trigger').first().json.chat.id }}",
    "interaction_type": "question",
    "timestamp": "{{ $now }}"
  }
}
```

### **Paso 5: Configurar Condiciones**
Agregar un nodo **IF** antes del HTTP Request para enviar métricas solo cuando:
- La respuesta sea exitosa
- El usuario haya hecho una pregunta válida
- No sea un mensaje de sistema

## 🚨 **Manejo de Errores**
Configurar en **HTTP Request** → **Options**:
```
Ignore SSL Issues: false
Response Format: JSON
Timeout: 10000
Continue On Fail: true
```

## 📝 **Ejemplo Completo de Workflow**

```
[Webhook Trigger] → [OpenAI] → [Intent Classifier] → [IF: Success?] → [HTTP Request: Save Metrics] → [Response to User]
                                                                    ↓
                                                              [Log Error if Fails]
```

## ✅ **Testing**

### Test JSON para Postman/Testing:
```json
{
  "type": "user_interaction",
  "data": {
    "user_id": "test_user_001",
    "phone_number": "+34612345678",
    "question": "Test question from n8n",
    "response": "Test response from assistant",
    "response_time_ms": 1200,
    "confidence_score": 0.95,
    "intent_detected": "test_intent",
    "session_id": "test_session_001",
    "interaction_type": "question",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔍 **Verificación**
1. Las métricas aparecerán en el dashboard en tiempo real
2. Verificar en `/api/metrics?type=user_interaction&mock=false`
3. Los gráficos del dashboard se actualizarán automáticamente 