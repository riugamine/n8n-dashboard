#!/bin/bash

# Script de despliegue simple para N8N Dashboard
# Uso: ./deploy.sh [--docker] [--production]

set -e  # Salir en caso de error

echo "🚀 Iniciando proceso de despliegue de N8N Dashboard..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar Node.js y npm
print_status "Verificando dependencias del sistema..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js detectado: $NODE_VERSION"

# Verificar archivo de entorno
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    print_warning "No se encontró archivo de variables de entorno (.env.local o .env)"
    print_warning "Asegúrate de configurar las variables de Supabase antes de continuar"
fi

# Instalar dependencias
print_status "Instalando dependencias..."
npm ci
print_success "Dependencias instaladas correctamente"

# Ejecutar linter
print_status "Ejecutando linter..."
if npm run lint; then
    print_success "Linter pasó sin errores"
else
    print_error "El linter encontró errores. Por favor corrígelos antes de continuar."
    exit 1
fi

# Ejecutar verificación de tipos
print_status "Verificando tipos de TypeScript..."
if npm run type-check; then
    print_success "Verificación de tipos completada sin errores"
else
    print_error "Se encontraron errores de tipos. Por favor corrígelos antes de continuar."
    exit 1
fi

# Verificar argumentos de línea de comandos
USE_DOCKER=false
PRODUCTION=false

for arg in "$@"; do
    case $arg in
        --docker)
            USE_DOCKER=true
            shift
            ;;
        --production)
            PRODUCTION=true
            shift
            ;;
        *)
            print_warning "Argumento desconocido: $arg"
            ;;
    esac
done

if [ "$USE_DOCKER" = true ]; then
    # Despliegue con Docker
    print_status "Iniciando despliegue con Docker..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    # Construir imagen
    print_status "Construyendo imagen Docker..."
    if docker build -t n8n-dashboard .; then
        print_success "Imagen Docker construida correctamente"
    else
        print_error "Error al construir la imagen Docker"
        exit 1
    fi
    
    # Ejecutar contenedor
    print_status "Iniciando contenedor..."
    if docker run -d -p 3000:3000 --name n8n-dashboard-container n8n-dashboard; then
        print_success "Contenedor iniciado correctamente"
        print_status "La aplicación está corriendo en http://localhost:3000"
        print_status "Para ver los logs: docker logs -f n8n-dashboard-container"
        print_status "Para detener: docker stop n8n-dashboard-container"
    else
        print_error "Error al iniciar el contenedor"
        exit 1
    fi
    
else
    # Despliegue tradicional
    print_status "Construyendo aplicación..."
    if npm run build; then
        print_success "Aplicación construida correctamente"
    else
        print_error "Error al construir la aplicación"
        exit 1
    fi
    
    if [ "$PRODUCTION" = true ]; then
        print_status "Iniciando en modo producción..."
        npm start
    else
        print_status "Aplicación lista para desarrollo"
        print_success "Para iniciar en desarrollo: npm run dev"
        print_success "Para iniciar en producción: npm start"
    fi
fi

# Mostrar información útil
echo ""
print_success "🎉 Despliegue completado exitosamente!"
echo ""
print_status "📋 Información del despliegue:"
echo "   - Versión de Node.js: $NODE_VERSION"
echo "   - Modo Docker: $USE_DOCKER"
echo "   - Modo Producción: $PRODUCTION"
echo ""
print_status "🔗 Enlaces útiles:"
echo "   - Aplicación: http://localhost:3000"
echo ""
print_status "📊 Comandos útiles:"
if [ "$USE_DOCKER" = true ]; then
    echo "   - Ver logs: docker logs -f n8n-dashboard-container"
    echo "   - Detener: docker stop n8n-dashboard-container"
    echo "   - Eliminar: docker rm n8n-dashboard-container"
else
    echo "   - Desarrollo: npm run dev"
    echo "   - Producción: npm start"
    echo "   - Linter: npm run lint"
    echo "   - Type check: npm run type-check"
fi
echo ""

exit 0 