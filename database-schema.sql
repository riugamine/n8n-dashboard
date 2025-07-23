-- =============================================================================
-- SCHEMA DE BASE DE DATOS PARA N8N DASHBOARD
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TABLA PARA EJECUCIONES DE WORKFLOW (Métricas de uso general)
-- =============================================================================

CREATE TABLE workflow_executions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  workflow_id text NOT NULL,
  workflow_name text NOT NULL,
  execution_id text UNIQUE NOT NULL,
  status text CHECK (status IN ('success', 'failed', 'canceled', 'running')) NOT NULL,
  duration_ms integer NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  error_message text,
  node_count integer DEFAULT 0,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_timestamp ON workflow_executions(timestamp DESC);
CREATE INDEX idx_workflow_executions_start_time ON workflow_executions(start_time DESC);

-- =============================================================================
-- 2. TABLA PARA INTERACCIONES DE USUARIOS (Métricas de interacción)
-- =============================================================================

CREATE TABLE user_interactions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id text NOT NULL,
  phone_number text,
  question text NOT NULL,
  response text NOT NULL,
  response_time_ms integer NOT NULL,
  confidence_score decimal(3,2), -- 0.00 - 1.00
  intent_detected text,
  session_id text NOT NULL,
  interaction_type text CHECK (interaction_type IN ('question', 'appointment_request', 'followup')) NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_intent ON user_interactions(intent_detected);
CREATE INDEX idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX idx_user_interactions_interaction_type ON user_interactions(interaction_type);

-- =============================================================================
-- 3. TABLA PARA CITAS (Métricas de conversión)
-- =============================================================================

CREATE TABLE appointments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  appointment_id text UNIQUE NOT NULL,
  user_id text NOT NULL,
  phone_number text,
  requested_date timestamptz NOT NULL,
  confirmed_date timestamptz,
  appointment_type text NOT NULL,
  status text CHECK (status IN ('requested', 'confirmed', 'completed', 'canceled', 'no_show')) NOT NULL,
  notes text,
  source_interaction_id bigint REFERENCES user_interactions(id),
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_appointment_type ON appointments(appointment_type);
CREATE INDEX idx_appointments_requested_date ON appointments(requested_date DESC);
CREATE INDEX idx_appointments_timestamp ON appointments(timestamp DESC);

-- =============================================================================
-- 4. TABLA PARA USUARIOS (Métricas de conversión)
-- =============================================================================

CREATE TABLE users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id text UNIQUE NOT NULL,
  phone_number text,
  first_interaction timestamptz NOT NULL,
  last_interaction timestamptz NOT NULL,
  total_interactions integer DEFAULT 0,
  appointments_requested integer DEFAULT 0,
  appointments_completed integer DEFAULT 0,
  conversion_status text CHECK (conversion_status IN ('new', 'engaged', 'converted', 'churned')) DEFAULT 'new',
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_conversion_status ON users(conversion_status);
CREATE INDEX idx_users_first_interaction ON users(first_interaction DESC);
CREATE INDEX idx_users_last_interaction ON users(last_interaction DESC);

-- =============================================================================
-- 5. TABLA PARA PREGUNTAS FRECUENTES (Métricas de interacción)
-- =============================================================================

CREATE TABLE frequent_questions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_pattern text NOT NULL,
  question_category text NOT NULL,
  count integer DEFAULT 1,
  last_asked timestamptz NOT NULL,
  sample_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_frequent_questions_category ON frequent_questions(question_category);
CREATE INDEX idx_frequent_questions_count ON frequent_questions(count DESC);
CREATE INDEX idx_frequent_questions_last_asked ON frequent_questions(last_asked DESC);

-- =============================================================================
-- 6. TABLA PARA MÉTRICAS AGREGADAS (Opcional - para cachear cálculos)
-- =============================================================================

CREATE TABLE dashboard_metrics_cache (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  metric_date date NOT NULL,
  period_type text CHECK (period_type IN ('day', 'week', 'month')) NOT NULL,
  metrics_data jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(metric_date, period_type)
);

-- Índices para optimizar consultas
CREATE INDEX idx_dashboard_metrics_cache_date ON dashboard_metrics_cache(metric_date DESC);
CREATE INDEX idx_dashboard_metrics_cache_period ON dashboard_metrics_cache(period_type);

-- =============================================================================
-- 7. MANTENER LA TABLA ORIGINAL PARA COMPATIBILIDAD
-- =============================================================================

-- La tabla 'metrics' original se mantiene para compatibilidad
-- con el código existente y para métricas personalizadas adicionales
CREATE TABLE IF NOT EXISTS metrics (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type text NOT NULL,
  data jsonb NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices si no existen
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(type);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp DESC);

-- =============================================================================
-- FUNCIONES Y TRIGGERS PARA AUTOMATIZACIÓN
-- =============================================================================

-- Función para actualizar la columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para frequent_questions
CREATE TRIGGER update_frequent_questions_updated_at 
    BEFORE UPDATE ON frequent_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para dashboard_metrics_cache
CREATE TRIGGER update_dashboard_metrics_cache_updated_at 
    BEFORE UPDATE ON dashboard_metrics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCIONES PARA CALCULAR MÉTRICAS AGREGADAS
-- =============================================================================

-- Función para calcular métricas del día
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date date DEFAULT CURRENT_DATE)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'workflow_executions_today', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE DATE(timestamp) = target_date
        ),
        'successful_executions_today', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE DATE(timestamp) = target_date AND status = 'success'
        ),
        'failed_executions_today', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE DATE(timestamp) = target_date AND status = 'failed'
        ),
        'total_questions_today', (
            SELECT COUNT(*) FROM user_interactions 
            WHERE DATE(timestamp) = target_date
        ),
        'appointments_scheduled_today', (
            SELECT COUNT(*) FROM appointments 
            WHERE DATE(timestamp) = target_date
        ),
        'unique_users_today', (
            SELECT COUNT(DISTINCT user_id) FROM user_interactions 
            WHERE DATE(timestamp) = target_date
        ),
        'average_response_time_today', (
            SELECT COALESCE(AVG(response_time_ms), 0) FROM user_interactions 
            WHERE DATE(timestamp) = target_date
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequent_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics_cache ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (ajustar según necesidades de producción)
CREATE POLICY "Allow all operations on workflow_executions" ON workflow_executions
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_interactions" ON user_interactions
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on appointments" ON appointments
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on users" ON users
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on frequent_questions" ON frequent_questions
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on dashboard_metrics_cache" ON dashboard_metrics_cache
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - PARA TESTING INICIAL)
-- =============================================================================

-- Insertar algunas ejecuciones de workflow de ejemplo
INSERT INTO workflow_executions (workflow_id, workflow_name, execution_id, status, duration_ms, start_time, end_time, node_count, timestamp) VALUES
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_1', 'success', 1500, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '1.5 seconds', 8, NOW() - INTERVAL '2 hours'),
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_2', 'success', 2200, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '2.2 seconds', 10, NOW() - INTERVAL '1 hour'),
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_3', 'failed', 800, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes' + INTERVAL '0.8 seconds', 12, NOW() - INTERVAL '30 minutes');

-- Insertar algunas interacciones de usuario de ejemplo
INSERT INTO user_interactions (user_id, phone_number, question, response, response_time_ms, confidence_score, intent_detected, session_id, interaction_type, timestamp) VALUES
('user_1', '+1234567890', '¿Cuáles son sus horarios?', 'Nuestros horarios son de lunes a viernes de 8:00 a 18:00', 1200, 0.95, 'horarios', 'session_1', 'question', NOW() - INTERVAL '3 hours'),
('user_2', '+1234567891', '¿Puedo agendar una cita?', 'Por supuesto, ¿qué día prefiere?', 800, 0.92, 'appointment_booking', 'session_2', 'appointment_request', NOW() - INTERVAL '2 hours'),
('user_1', '+1234567890', 'Quiero agendar para mañana', 'Perfecto, tengo disponibilidad mañana a las 10:00', 950, 0.88, 'appointment_booking', 'session_3', 'appointment_request', NOW() - INTERVAL '1 hour');

-- Insertar algunas citas de ejemplo
INSERT INTO appointments (appointment_id, user_id, phone_number, requested_date, confirmed_date, appointment_type, status, timestamp) VALUES
('apt_example_1', 'user_2', '+1234567891', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', 'consulta_general', 'confirmed', NOW() - INTERVAL '2 hours'),
('apt_example_2', 'user_1', '+1234567890', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day', 'consulta_general', 'confirmed', NOW() - INTERVAL '1 hour');

-- Insertar usuarios de ejemplo
INSERT INTO users (user_id, phone_number, first_interaction, last_interaction, total_interactions, appointments_requested, appointments_completed, conversion_status, timestamp) VALUES
('user_1', '+1234567890', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 hour', 3, 1, 0, 'engaged', NOW() - INTERVAL '1 week'),
('user_2', '+1234567891', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 2, 1, 0, 'engaged', NOW() - INTERVAL '3 days');

-- =============================================================================
-- COMENTARIOS FINALES
-- =============================================================================

-- Este schema proporciona:
-- 1. Tablas especializadas para cada tipo de métrica
-- 2. Índices optimizados para consultas frecuentes
-- 3. Restricciones de integridad y validación
-- 4. Funciones para calcular métricas agregadas
-- 5. Sistema de cache para métricas pesadas
-- 6. Políticas de seguridad básicas
-- 7. Triggers para mantenimiento automático
-- 8. Datos de ejemplo para testing

-- Para usar en producción:
-- 1. Ajustar las políticas RLS según tus necesidades de seguridad
-- 2. Configurar backups automáticos
-- 3. Monitorear el performance de las consultas
-- 4. Considerar particionado para tablas grandes (por fecha) 