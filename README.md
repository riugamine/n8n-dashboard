# N8N Dashboard - Métricas del Asistente

Dashboard de métricas para el asistente automatizado n8n. Visualiza datos clave sobre el comportamiento de tu asistente en tiempo real.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React Query + Tailwind CSS
- **Backend/API**: API Routes de Next.js
- **Base de datos**: Supabase (PostgreSQL gestionado)
- **UI Components**: Componentes personalizados con Tailwind CSS
- **Visualización**: Recharts (próximamente)
- **Íconos**: Lucide React

## 📦 Características

- ✅ Dashboard en tiempo real con métricas del asistente n8n
- ✅ **Métricas específicas**: Ejecuciones de workflow, interacciones de usuario, citas, conversiones
- ✅ **API avanzada** con soporte para múltiples tipos de métricas
- ✅ **Datos placeholder** para desarrollo y testing
- ✅ **Estructura optimizada** con tablas especializadas en Supabase
- ✅ Manejo eficiente del estado con React Query
- ✅ Interfaz moderna y responsiva con Tailwind CSS
- ✅ Modo oscuro/claro
- ✅ TypeScript para type safety
- 🔄 Gráficos interactivos (próximamente)
- 🔄 Filtros avanzados (próximamente)

## 🛠️ Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm
- Cuenta en Supabase

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd n8n-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase. El archivo `env.example` contiene todas las variables necesarias con comentarios explicativos.

4. **Configurar Supabase**
   
   📋 **Guía completa**: Ve al archivo [`SETUP-SUPABASE.md`](./SETUP-SUPABASE.md) para instrucciones detalladas paso a paso.
   
   **Resumen rápido**:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Obtén tu Project URL y anon key
   - Ejecuta el script SQL para crear la tabla `metrics`

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Uso del API

### Nuevas Métricas Específicas del Asistente

El dashboard ahora soporta métricas especializadas para monitorear tu asistente n8n:

#### **1. Métricas de Uso General** 🔁
- Ejecuciones de workflow (éxito/fallo)
- Duración promedio de ejecución
- Tasa de éxito del flujo

#### **2. Métricas de Interacción** 💬
- Total de preguntas recibidas
- Usuarios únicos atendidos
- Tiempo promedio de respuesta
- Preguntas más frecuentes

#### **3. Métricas de Conversión** 📈
- Citas agendadas y completadas
- Tasa de conversión usuario → cita
- Respuestas de alta confianza

### Endpoints Disponibles

| Tipo | Endpoint | Descripción |
|------|----------|-------------|
| `workflow_execution` | `POST /api/metrics` | Ejecuciones de n8n |
| `user_interaction` | `POST /api/metrics` | Conversaciones |
| `appointment` | `POST /api/metrics` | Gestión de citas |
| `user_update` | `POST /api/metrics` | Perfiles de usuario |
| `frequent_question` | `POST /api/metrics` | Análisis de preguntas |

📚 **Documentación completa**: Ve [`METRICS-GUIDE.md`](./METRICS-GUIDE.md) para ejemplos de uso, estructura de datos y código para n8n.

### Obtener métricas

**Endpoint**: `GET /api/metrics`

**Parámetros avanzados**:
- `type`: Tipo específico de métrica
- `limit`: Número máximo de resultados
- `startDate` / `endDate`: Rango de fechas
- `userId` / `workflowId` / `status`: Filtros específicos
- `mock=true`: Usar datos de prueba para desarrollo

**Ejemplos**:
```bash
# Métricas del dashboard
curl "http://localhost:3000/api/metrics?type=dashboard"

# Interacciones de usuario específico
curl "http://localhost:3000/api/metrics?type=user_interaction&userId=user_123"

# Datos de desarrollo/testing
curl "http://localhost:3000/api/metrics?type=dashboard&mock=true"
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   └── metrics/       # Endpoint de métricas avanzado
│   ├── dashboard/         # Página del dashboard
│   ├── globals.css        # Estilos globales con temas
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/
│   └── ui/                # Componentes UI reutilizables
├── lib/
│   ├── supabase.ts        # Cliente de Supabase
│   ├── types.ts           # Tipos TypeScript para métricas
│   ├── utils.ts           # Utilidades
│   └── placeholder-data.ts # Datos de prueba
└── providers/             # Context providers
    ├── react-query-provider.tsx
    └── theme-provider.tsx

# Documentación
├── METRICS-GUIDE.md       # Guía completa de métricas
├── SETUP-SUPABASE.md      # Configuración de base de datos
├── database-schema.sql    # Schema SQL para Supabase
└── env.example           # Variables de entorno
```

## 🔧 Scripts

- `npm run dev` - Ejecutar en desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Linting del código

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otras plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js.

## 📈 Próximas Funcionalidades

- [ ] Gráficos interactivos con Recharts
- [ ] Visualizaciones de tendencias en tiempo real
- [ ] Alertas automáticas para métricas críticas
- [ ] Exportación de reportes en PDF/Excel
- [ ] Dashboard personalizable por usuario
- [ ] Análisis predictivo con IA
- [ ] Integración con otros servicios (Slack, Email)
- [ ] API webhooks para notificaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda, no dudes en abrir un issue en el repositorio.
