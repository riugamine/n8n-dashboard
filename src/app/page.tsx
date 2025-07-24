'use client'

import { useState } from 'react'
import { Brain, BarChart3, Shield, Zap, ArrowRight, Activity } from 'lucide-react'
import { LightRays } from '@/components/ui/light-rays'
import { LoginModal } from '@/components/auth/login-modal'

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleDashboardClick = () => {
    setShowLoginModal(true)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Light Rays Background */}
        <LightRays className="opacity-30" count={12} />
        
        {/* Header */}
        <header className="relative z-10 px-6 py-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-poppins">joseangelweb</h1>
                <p className="text-sm text-blue-200 font-montserrat-light">AI Analytics Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-montserrat">Sistema Activo</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 pt-16 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-8">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-blue-200 text-sm font-montserrat">Asistente de IA Empresarial</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-poppins">
                Dashboard de
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  Métricas IA
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto font-montserrat-light leading-relaxed">
                Monitorea el rendimiento de tu asistente de inteligencia artificial empresarial 
                con métricas en tiempo real y análisis avanzados.
              </p>
              
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold font-poppins text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-blue-500/25"
              >
                Acceder al Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins">Métricas en Tiempo Real</h3>
                <p className="text-slate-300 font-montserrat-light">
                  Visualiza el rendimiento de tu asistente IA con gráficos interactivos y datos actualizados.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins">Análisis Inteligente</h3>
                <p className="text-slate-300 font-montserrat-light">
                  Comprende patrones de comportamiento y optimiza las respuestas del asistente.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins">Acceso Seguro</h3>
                <p className="text-slate-300 font-montserrat-light">
                  Sistema protegido con autenticación empresarial y control de acceso granular.
                </p>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 font-poppins">Rendimiento del Sistema</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2 font-poppins">24/7</div>
                  <div className="text-slate-300 text-sm font-montserrat">Monitoreo Activo</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2 font-poppins">98.9%</div>
                  <div className="text-slate-300 text-sm font-montserrat">Precisión IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2 font-poppins">&lt;2s</div>
                  <div className="text-slate-300 text-sm font-montserrat">Tiempo Respuesta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2 font-poppins">1.2k+</div>
                  <div className="text-slate-300 text-sm font-montserrat">Consultas/Día</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-400 text-sm">
            <div className="font-montserrat-light">
              © 2024 joseangelweb. Sistema interno de métricas IA.
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-montserrat">Sistema Operativo</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  )
}
