# 📊 Configuración de Supabase para N8N Dashboard

Esta guía te ayudará a configurar Supabase como base de datos para tu dashboard de métricas de n8n.

## 🚀 Paso 1: Crear cuenta y proyecto en Supabase

1. **Crear cuenta**
   - Ve a [https://supabase.com](https://supabase.com)
   - Haz clic en "Start your project"
   - Regístrate con GitHub, Google o email

2. **Crear nuevo proyecto**
   - Una vez logueado, haz clic en "New Project"
   - Elige tu organización
   - Completa los datos:
     - **Name**: `n8n-dashboard` (o el nombre que prefieras)
     - **Database Password**: Genera una contraseña segura (guárdala)
     - **Region**: Elige la más cercana a tu ubicación
     - **Pricing Plan**: Puedes empezar con el plan gratuito
   - Haz clic en "Create new project"

## 🔑 Paso 2: Obtener credenciales de API

1. **Navegar a configuración**
   - En tu proyecto, ve al sidebar izquierdo
   - Haz clic en "Settings" → "API"

2. **Copiar credenciales**
   - **Project URL**: Copia la URL que aparece (ej: `https://abcdefghijk.supabase.co`)
   - **anon public key**: Copia la clave que aparece bajo "Project API keys"

## 🗄️ Paso 3: Crear la tabla de métricas

1. **Abrir SQL Editor**
   - En el sidebar, haz clic en "SQL Editor"
   - Haz clic en "New query"

2. **Ejecutar script de creación**
   ```sql
   -- Crear tabla para almacenar métricas
   CREATE TABLE metrics (
     id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     type text NOT NULL,
     data jsonb NOT NULL,
     timestamp timestamptz NOT NULL,
     created_at timestamptz DEFAULT NOW()
   );

   -- Crear índices para mejorar performance
   CREATE INDEX idx_metrics_type ON metrics(type);
   CREATE INDEX idx_metrics_timestamp ON metrics(timestamp DESC);
   CREATE INDEX idx_metrics_created_at ON metrics(created_at DESC);

   -- Habilitar Row Level Security (RLS)
   ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

   -- Política para permitir lectura/escritura (ajustar según necesidades)
   CREATE POLICY "Allow all operations on metrics" ON metrics
   FOR ALL TO anon, authenticated
   USING (true)
   WITH CHECK (true);
   ```

3. **Ejecutar el script**
   - Haz clic en "Run" (▶️)
   - Deberías ver "Success. No rows returned"

## ⚙️ Paso 4: Configurar variables de entorno

1. **Copiar archivo de ejemplo**
   ```bash
   cp env.example .env.local
   ```

2. **Editar `.env.local`**
   ```env
   # Reemplaza con tus valores reales
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🧪 Paso 5: Probar la conexión

1. **Reiniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Probar el endpoint de métricas**
   ```bash
   # Enviar una métrica de prueba
   curl -X POST http://localhost:3000/api/metrics \
     -H "Content-Type: application/json" \
     -d '{
       "type": "test",
       "data": {
         "message": "Prueba de conexión",
         "timestamp": "2025-01-23T10:00:00Z"
       }
     }'
   ```

3. **Verificar en Supabase**
   - Ve a "Table Editor" → "metrics"
   - Deberías ver tu registro de prueba

## 🔒 Configuración de seguridad (Opcional)

Para mayor seguridad en producción, puedes:

1. **Configurar políticas RLS más restrictivas**
2. **Usar Service Role Key para operaciones del servidor**
3. **Configurar dominios autorizados**

### Service Role Key (Opcional)

Si necesitas realizar operaciones con permisos elevados:

```env
# Solo para uso en servidor - NUNCA expongas en frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Estructura de datos recomendada

### Tipos de métricas sugeridos:

```json
// Consulta del usuario
{
  "type": "query",
  "data": {
    "question": "¿Cuáles son tus horarios?",
    "response_time": 1200,
    "user_id": "user123",
    "satisfaction": 5
  }
}

// Cita agendada
{
  "type": "appointment",
  "data": {
    "date": "2025-01-25T14:00:00Z",
    "type": "consulta",
    "user_id": "user123",
    "status": "confirmed"
  }
}

// Tiempo de respuesta
{
  "type": "response_time",
  "data": {
    "duration_ms": 800,
    "endpoint": "/api/chat",
    "model_used": "gpt-4"
  }
}
```

## 🆘 Solución de problemas

### Error: "supabaseUrl is required"
- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon public key`
- Asegúrate de no incluir espacios extra

### Error: "relation 'metrics' does not exist"
- Ejecuta el script SQL de creación de tabla
- Verifica que estás en el proyecto correcto

### No se pueden insertar datos
- Verifica las políticas RLS
- Revisa los logs en el dashboard de Supabase

## 🔗 Enlaces útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Dashboard de Supabase](https://supabase.com/dashboard) 