# 🎯 Dashboard Bento - Características y Funcionalidades

## 🎨 Diseño Bento Grid

El dashboard ha sido completamente rediseñado con un **diseño bento grid moderno** que proporciona:

### ✨ Características Principales

- **Layout Responsive**: Se adapta automáticamente a diferentes tamaños de pantalla
- **Diseño Asimétrico**: Cards de diferentes tamaños para jerarquizar información
- **Actualizaciones en Tiempo Real**: Datos que se refrescan cada 30 segundos
- **Animaciones Suaves**: Transiciones fluidas y estados de carga elegantes
- **Modo Oscuro/Claro**: Soporte completo para temas

## 📊 Componentes de Métricas

### 1. **MetricCard** - Tarjetas de KPIs
```typescript
<MetricCard
  title="Consultas Hoy"
  value={metrics?.total_questions_today || 0}
  change={15.2}
  icon={MessageSquare}
  trend="up"
  loading={metricsLoading}
/>
```

**Características:**
- Indicadores de tendencia (up/down/neutral) con colores
- Formateo automático de números grandes (1,234 → 1.2k)
- Estados de carga con animaciones skeleton
- Gradientes suaves de fondo

### 2. **TrendChart** - Gráficos de Tendencia
```typescript
<TrendChart
  data={recentTrendData}
  title="Tendencia de Consultas"
  type="area"
  color="#3b82f6"
  showTwoLines={true}
  secondLineColor="#10b981"
/>
```

**Tipos soportados:**
- **Area Chart**: Para tendencias con relleno
- **Line Chart**: Para tendencias simples o múltiples líneas
- **Dual Line**: Para comparar dos métricas (ej: solicitadas vs completadas)

### 3. **DonutChart** - Gráfico de Dona
```typescript
<DonutChart
  data={questionsChartData}
  title="Preguntas Frecuentes"
  description="Top 5 categorías más consultadas"
/>
```

**Características:**
- Colores dinámicos generados automáticamente
- Tooltips con porcentajes calculados
- Leyenda organizada en grid
- Centro hueco para mejor visualización

### 4. **StatsCard** - Tarjeta de Estadísticas
```typescript
<StatsCard
  title="Métricas de Conversión"
  stats={[
    { label: 'Tasa de Conversión', value: '73.2%', change: 5.2 },
    { label: 'Confianza Alta', value: '89.5%', change: 2.1 }
  ]}
/>
```

## 🔄 Conexión con API

### Hook Personalizado: `useDashboardMetrics`
```typescript
const { data, isLoading, error } = useDashboardMetrics(true) // mock data
```

**Características:**
- **Caché inteligente**: Stale time de 5 minutos
- **Refetch automático**: Cada 30 segundos
- **Manejo de errores**: Estados de error elegantes
- **Modo desarrollo**: Datos simulados con `mock=true`

### Endpoints Utilizados:
- `GET /api/metrics?type=dashboard&mock=true` - Métricas principales
- `GET /api/metrics?type=frequent_question&mock=true` - Preguntas frecuentes

## 📱 Layout Bento Grid

### Estructura Responsive:
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6
```

### Organización por Secciones:

1. **Fila 1**: KPIs principales (4 cards)
   - Consultas Hoy, Citas Agendadas, Tiempo Respuesta, Usuarios Únicos

2. **Fila 2**: Gráfico principal de tendencias (span 4 columnas)
   - Tendencia de consultas de los últimos 7 días

3. **Fila 3**: Métricas de workflow (2 cards)
   - Ejecuciones Hoy, Tasa de Éxito

4. **Fila 4**: Análisis detallado (2 cards de 2 columnas)
   - Gráfico de dona de preguntas frecuentes
   - Card de métricas de conversión

5. **Fila 5**: Métricas mensuales (2 cards)
   - Consultas del Mes, Citas del Mes

6. **Fila 6**: Gráfico de tendencia de citas (span 4 columnas)
   - Comparación de citas solicitadas vs completadas

## 🎨 Estilo y UX

### Paleta de Colores:
- **Azul principal**: `#3b82f6` - Consultas y datos primarios
- **Verde**: `#10b981` - Éxito, completadas, positivo
- **Rojo**: `#ef4444` - Errores, fallos, negativo
- **Gris**: Variables CSS para texto secundario

### Animaciones:
- **Hover effects**: Elevación sutil con `hover:shadow-md`
- **Loading states**: Skeleton loaders con `animate-pulse`
- **Transiciones**: `transition-all duration-200`

### Responsive Breakpoints:
- **Mobile**: 1 columna, stack vertical
- **Tablet** (md): 2 columnas, algunos spans
- **Desktop** (lg): 4 columnas, layout completo
- **Large** (xl): 6 columnas, máxima densidad

## 🚀 Características Avanzadas

### 1. **Estados de Carga Inteligentes**
- Skeleton loaders que mantienen la estructura
- Animaciones suaves durante transiciones
- Manejo de estados de error con iconos

### 2. **Formateo Automático**
- Números grandes: 1,234 → 1.2k
- Tiempo: milliseconds → seconds
- Fechas: Formato español localizado

### 3. **Tooltips Contextuales**
- Fondo que respeta el tema actual
- Información detallada en gráficos
- Formateo de porcentajes automático

### 4. **Actualización en Tiempo Real**
- Refetch cada 30 segundos
- Indicador visual de actualización
- Manejo de reconexión automática

## 🔧 Configuración y Personalización

### Variables de Entorno:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
```

### Modo de Desarrollo:
```typescript
// Para usar datos simulados durante desarrollo
const { data } = useDashboardMetrics(true) // mock=true

// Para usar datos reales
const { data } = useDashboardMetrics(false) // mock=false
```

### Personalización de Colores:
```typescript
<TrendChart
  color="#8b5cf6" // Púrpura personalizado
  secondLineColor="#f59e0b" // Amarillo para segunda línea
/>
```

## 📈 Métricas Incluidas

### KPIs Principales:
- Consultas por día/semana/mes
- Citas agendadas y completadas
- Tiempo promedio de respuesta
- Usuarios únicos
- Ejecuciones de workflow
- Tasa de éxito

### Análisis Avanzado:
- Tendencias temporales
- Patrones de preguntas frecuentes
- Métricas de conversión
- Análisis de rendimiento

### Comparativas:
- Citas solicitadas vs completadas
- Tendencias semana a semana
- Porcentajes de cambio
- Indicadores de dirección

## 🎯 Próximas Mejoras

- [ ] Filtros de fecha personalizados
- [ ] Export de datos a CSV/PDF
- [ ] Alertas automáticas por thresholds
- [ ] Dashboard personalizable por usuario
- [ ] Métricas de geolocalización
- [ ] Integración con notificaciones push

---

> **Nota**: El dashboard está optimizado para funcionar tanto con datos simulados (desarrollo) como con datos reales de Supabase (producción). La transición es automática según la configuración de variables de entorno. 