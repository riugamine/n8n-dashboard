-- =============================================================================
-- SCHEMA SIMPLIFICADO PARA N8N DASHBOARD - MÉTRICAS ESENCIALES
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CONFIGURACIÓN DE AUTENTICACIÓN SUPABASE
-- =============================================================================

-- Tabla de perfiles de usuario extendidos (opcional)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text CHECK (role IN ('admin', 'viewer', 'analyst')) DEFAULT 'viewer',
  company text DEFAULT 'joseangelweb',
  department text,
  last_login timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Índices para perfiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_company ON user_profiles(company);

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Políticas RLS para perfiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TABLA PARA EJECUCIONES DE WORKFLOW (Métricas principales del flujo n8n)
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
-- TABLA PARA INTERACCIONES DE USUARIOS (Métricas de conversación y conversión)
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
  -- Campos para tracking de citas (simplificado)
  appointment_requested boolean DEFAULT false,
  appointment_confirmed boolean DEFAULT false,
  appointment_completed boolean DEFAULT false,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_intent ON user_interactions(intent_detected);
CREATE INDEX idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX idx_user_interactions_interaction_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_appointment ON user_interactions(appointment_requested, appointment_confirmed, appointment_completed);

-- =============================================================================
-- TABLA PARA USUARIOS (Métricas de conversión simplificadas)
-- =============================================================================

CREATE TABLE users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id text UNIQUE NOT NULL,
  phone_number text,
  first_interaction timestamptz NOT NULL,
  last_interaction timestamptz NOT NULL,
  total_interactions integer DEFAULT 0,
  appointments_requested integer DEFAULT 0,
  appointments_confirmed integer DEFAULT 0,
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
-- TABLA ORIGINAL PARA COMPATIBILIDAD (Opcional)
-- =============================================================================

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
-- FUNCIONES PARA CALCULAR LAS 9 MÉTRICAS ESENCIALES
-- =============================================================================

-- Función principal para calcular todas las métricas del dashboard
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(
    start_date timestamptz DEFAULT NULL,
    end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    effective_start_date timestamptz;
    effective_end_date timestamptz;
    today_start timestamptz;
    week_start timestamptz;
    month_start timestamptz;
BEGIN
    -- Definir fechas por defecto si no se proporcionan
    effective_start_date := COALESCE(start_date, NOW() - INTERVAL '30 days');
    effective_end_date := COALESCE(end_date, NOW());
    today_start := DATE_TRUNC('day', NOW());
    week_start := NOW() - INTERVAL '7 days';
    month_start := NOW() - INTERVAL '30 days';
    
    SELECT jsonb_build_object(
        -- 1. Número de veces que se ejecutó el flow
        'total_executions_today', (
            SELECT COUNT(*) FROM workflow_executions WHERE timestamp >= today_start
        ),
        'total_executions_week', (
            SELECT COUNT(*) FROM workflow_executions WHERE timestamp >= week_start
        ),
        'total_executions_month', (
            SELECT COUNT(*) FROM workflow_executions WHERE timestamp >= month_start
        ),
        
        -- 2. Cantidad de ejecuciones fallidas
        'failed_executions_today', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE timestamp >= today_start AND status = 'failed'
        ),
        'failed_executions_week', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE timestamp >= week_start AND status = 'failed'
        ),
        'failed_executions_month', (
            SELECT COUNT(*) FROM workflow_executions 
            WHERE timestamp >= month_start AND status = 'failed'
        ),
        
        -- 3. Tasa de éxito de flujo
        'success_rate_today', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0 
                ELSE ROUND((COUNT(*) FILTER (WHERE status = 'success')::decimal / COUNT(*)) * 100, 1)
            END
            FROM workflow_executions WHERE timestamp >= today_start
        ),
        'success_rate_week', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0 
                ELSE ROUND((COUNT(*) FILTER (WHERE status = 'success')::decimal / COUNT(*)) * 100, 1)
            END
            FROM workflow_executions WHERE timestamp >= week_start
        ),
        'success_rate_month', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0 
                ELSE ROUND((COUNT(*) FILTER (WHERE status = 'success')::decimal / COUNT(*)) * 100, 1)
            END
            FROM workflow_executions WHERE timestamp >= month_start
        ),
        
        -- 4. Total de preguntas recibidas
        'total_questions_today', (
            SELECT COUNT(*) FROM user_interactions WHERE timestamp >= today_start
        ),
        'total_questions_week', (
            SELECT COUNT(*) FROM user_interactions WHERE timestamp >= week_start
        ),
        'total_questions_month', (
            SELECT COUNT(*) FROM user_interactions WHERE timestamp >= month_start
        ),
        
        -- 5. Usuarios atendidos
        'unique_users_today', (
            SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE timestamp >= today_start
        ),
        'unique_users_week', (
            SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE timestamp >= week_start
        ),
        'unique_users_month', (
            SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE timestamp >= month_start
        ),
        
        -- 6. Cantidad de citas agendadas
        'appointments_requested_today', (
            SELECT COUNT(*) FROM user_interactions 
            WHERE timestamp >= today_start AND appointment_requested = true
        ),
        'appointments_requested_week', (
            SELECT COUNT(*) FROM user_interactions 
            WHERE timestamp >= week_start AND appointment_requested = true
        ),
        'appointments_requested_month', (
            SELECT COUNT(*) FROM user_interactions 
            WHERE timestamp >= month_start AND appointment_requested = true
        ),
        
        -- 7. Tiempo promedio de respuesta
        'average_response_time_today', (
            SELECT COALESCE(AVG(response_time_ms), 0)::integer FROM user_interactions 
            WHERE timestamp >= today_start
        ),
        'average_response_time_week', (
            SELECT COALESCE(AVG(response_time_ms), 0)::integer FROM user_interactions 
            WHERE timestamp >= week_start
        ),
        'average_response_time_month', (
            SELECT COALESCE(AVG(response_time_ms), 0)::integer FROM user_interactions 
            WHERE timestamp >= month_start
        ),
        
        -- 8. Citas concretadas / citas solicitadas
        'appointment_completion_rate_month', (
            SELECT CASE 
                WHEN COUNT(*) FILTER (WHERE appointment_requested = true) = 0 THEN 0 
                ELSE ROUND(
                    (COUNT(*) FILTER (WHERE appointment_completed = true)::decimal / 
                     COUNT(*) FILTER (WHERE appointment_requested = true)) * 100, 1
                )
            END
            FROM user_interactions WHERE timestamp >= month_start
        ),
        
        -- 9. Tasa de conversión (usuarios → cita agendada)
        'user_conversion_rate_month', (
            SELECT CASE 
                WHEN COUNT(DISTINCT user_id) = 0 THEN 0 
                ELSE ROUND(
                    (COUNT(DISTINCT user_id) FILTER (WHERE appointment_requested = true)::decimal / 
                     COUNT(DISTINCT user_id)) * 100, 1
                )
            END
            FROM user_interactions WHERE timestamp >= month_start
        ),
        
        -- Tendencias simplificadas (últimos 30 días)
        'executions_trend', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'date', trend_date::text,
                    'total', daily_count,
                    'success_rate', success_rate
                ) ORDER BY trend_date
            )
            FROM (
                SELECT 
                    DATE(timestamp) as trend_date,
                    COUNT(*) as daily_count,
                    ROUND(
                        (COUNT(*) FILTER (WHERE status = 'success')::decimal / COUNT(*)) * 100, 
                        1
                    ) as success_rate
                FROM workflow_executions 
                WHERE timestamp >= month_start
                GROUP BY DATE(timestamp)
                ORDER BY trend_date
            ) trend_data
        ),
        
        'questions_trend', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'date', trend_date::text,
                    'questions', daily_questions,
                    'users', daily_users,
                    'appointments', daily_appointments
                ) ORDER BY trend_date
            )
            FROM (
                SELECT 
                    DATE(timestamp) as trend_date,
                    COUNT(*) as daily_questions,
                    COUNT(DISTINCT user_id) as daily_users,
                    COUNT(*) FILTER (WHERE appointment_requested = true) as daily_appointments
                FROM user_interactions 
                WHERE timestamp >= month_start
                GROUP BY DATE(timestamp)
                ORDER BY trend_date
            ) trend_data
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCIONES HELPER PARA MÉTRICAS ESPECÍFICAS
-- =============================================================================

-- Función para obtener métricas de ejecución
CREATE OR REPLACE FUNCTION get_execution_metrics(days_back integer DEFAULT 30)
RETURNS jsonb AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'total_executions', COUNT(*),
            'successful_executions', COUNT(*) FILTER (WHERE status = 'success'),
            'failed_executions', COUNT(*) FILTER (WHERE status = 'failed'),
            'success_rate', ROUND((COUNT(*) FILTER (WHERE status = 'success')::decimal / COUNT(*)) * 100, 1),
            'average_duration_ms', COALESCE(AVG(duration_ms), 0)::integer
        )
        FROM workflow_executions 
        WHERE timestamp >= NOW() - INTERVAL '1 day' * days_back
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener métricas de interacción
CREATE OR REPLACE FUNCTION get_interaction_metrics(days_back integer DEFAULT 30)
RETURNS jsonb AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'total_questions', COUNT(*),
            'unique_users', COUNT(DISTINCT user_id),
            'appointments_requested', COUNT(*) FILTER (WHERE appointment_requested = true),
            'appointments_completed', COUNT(*) FILTER (WHERE appointment_completed = true),
            'average_response_time_ms', COALESCE(AVG(response_time_ms), 0)::integer,
            'conversion_rate', CASE 
                WHEN COUNT(DISTINCT user_id) = 0 THEN 0 
                ELSE ROUND(
                    (COUNT(DISTINCT user_id) FILTER (WHERE appointment_requested = true)::decimal / 
                     COUNT(DISTINCT user_id)) * 100, 1
                )
            END
        )
        FROM user_interactions 
        WHERE timestamp >= NOW() - INTERVAL '1 day' * days_back
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad simplificadas
CREATE POLICY "Authenticated users can read workflow_executions" ON workflow_executions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "API can write workflow_executions" ON workflow_executions
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read user_interactions" ON user_interactions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "API can write user_interactions" ON user_interactions
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read users" ON users
FOR SELECT TO authenticated USING (true);

CREATE POLICY "API can write users" ON users
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- DATOS DE EJEMPLO SIMPLIFICADOS
-- =============================================================================

-- Insertar algunas ejecuciones de workflow de ejemplo
INSERT INTO workflow_executions (workflow_id, workflow_name, execution_id, status, duration_ms, start_time, end_time, node_count, timestamp) VALUES
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_1', 'success', 1500, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '1.5 seconds', 8, NOW() - INTERVAL '2 hours'),
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_2', 'success', 2200, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '2.2 seconds', 10, NOW() - INTERVAL '1 hour'),
('workflow_assistant_main', 'Asistente Principal n8n', 'exec_example_3', 'failed', 800, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes' + INTERVAL '0.8 seconds', 12, NOW() - INTERVAL '30 minutes');

-- Insertar algunas interacciones de usuario de ejemplo
INSERT INTO user_interactions (user_id, phone_number, question, response, response_time_ms, confidence_score, intent_detected, session_id, interaction_type, appointment_requested, appointment_confirmed, timestamp) VALUES
('user_1', '+1234567890', '¿Cuáles son sus horarios?', 'Nuestros horarios son de lunes a viernes de 8:00 a 18:00', 1200, 0.95, 'horarios', 'session_1', 'question', false, false, NOW() - INTERVAL '3 hours'),
('user_2', '+1234567891', '¿Puedo agendar una cita?', 'Por supuesto, ¿qué día prefiere?', 800, 0.92, 'appointment_booking', 'session_2', 'appointment_request', true, true, NOW() - INTERVAL '2 hours'),
('user_1', '+1234567890', 'Quiero agendar para mañana', 'Perfecto, tengo disponibilidad mañana a las 10:00', 950, 0.88, 'appointment_booking', 'session_3', 'appointment_request', true, true, NOW() - INTERVAL '1 hour');

-- Insertar usuarios de ejemplo
INSERT INTO users (user_id, phone_number, first_interaction, last_interaction, total_interactions, appointments_requested, appointments_confirmed, conversion_status, timestamp) VALUES
('user_1', '+1234567890', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 hour', 3, 1, 1, 'converted', NOW() - INTERVAL '1 week'),
('user_2', '+1234567891', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 2, 1, 1, 'converted', NOW() - INTERVAL '3 days');

-- =============================================================================
-- COMENTARIOS FINALES
-- =============================================================================

-- Este schema simplificado proporciona:
-- 1. Solo las tablas esenciales para las 9 métricas específicas
-- 2. Campos optimizados para tracking de citas sin tabla separada
-- 3. Funciones específicas para cada métrica solicitada
-- 4. Menos complejidad = instalación más rápida
-- 5. Fácil adaptación para diferentes marcas
-- 6. Mantiene compatibilidad con autenticación Supabase

-- Para usar:
-- SELECT calculate_dashboard_metrics(); -- Todas las métricas
-- SELECT get_execution_metrics(7); -- Métricas de ejecución últimos 7 días
-- SELECT get_interaction_metrics(30); -- Métricas de interacción últimos 30 días 