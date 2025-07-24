"use client";

import { useState } from "react";
import {
  Brain,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";
import DotGrid from "@/components/ui/dot-grid";
import { LoginModal } from "@/components/auth/login-modal";

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleDashboardClick = () => {
    setShowLoginModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-color-3 relative overflow-hidden">
        {/* Dot Grid Background */}
        <div className="fixed inset-0 w-screen h-screen z-0">
          <DotGrid
            dotSize={4}
            gap={25}
            baseColor="#234548"
            activeColor="#ffffff"
            proximity={100}
            shockRadius={180}
            shockStrength={4}
            resistance={600}
            returnDuration={1.3}
            className="opacity-40"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Header */}
        <header className="relative z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-color-5 rounded-xl flex items-center justify-center shadow-lg border border-color-2">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  joseangelweb
                </h1>
                <p className="text-sm text-muted-foreground">AI Analytics Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-color-2/80 px-3 py-1.5 rounded-full border border-color-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">
                Sistema Activo
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 pt-20 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-color-2/60 backdrop-blur-sm border border-color-1 rounded-full px-4 py-2 mb-8">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">
                  Asistente de IA Empresarial
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Dashboard de
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Métricas IA
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Monitorea el rendimiento de tu asistente de inteligencia
                artificial con métricas en tiempo real y análisis detallados.
              </p>

              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-3 bg-color-5 hover:bg-color-4 text-white px-8 py-4 rounded-2xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-xl border border-color-3"
              >
                Acceder al Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="group bg-color-2/60 backdrop-blur-sm border border-color-1/50 rounded-3xl p-8 hover:bg-color-2/80 hover:shadow-xl hover:shadow-color-4/50 transition-all duration-300">
                <div className="w-14 h-14 bg-color-3 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Métricas en Tiempo Real
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualiza el rendimiento de tu asistente IA con gráficos
                  interactivos y datos actualizados automáticamente.
                </p>
              </div>

              <div className="group bg-color-2/60 backdrop-blur-sm border border-color-1/50 rounded-3xl p-8 hover:bg-color-2/80 hover:shadow-xl hover:shadow-color-4/50 transition-all duration-300">
                <div className="w-14 h-14 bg-color-3 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Análisis Inteligente
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprende patrones de comportamiento y optimiza las respuestas
                  del asistente con insights avanzados.
                </p>
              </div>

              <div className="group bg-color-2/60 backdrop-blur-sm border border-color-1/50 rounded-3xl p-8 hover:bg-color-2/80 hover:shadow-xl hover:shadow-color-4/50 transition-all duration-300">
                <div className="w-14 h-14 bg-color-3 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Acceso Seguro
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sistema protegido con autenticación empresarial y control de
                  acceso granular para tu tranquilidad.
                </p>
              </div>
            </div>

            {/* Stats Preview - Dark Glassmorphism Style */}
            <div className="bg-color-2/50 backdrop-blur-xl border border-color-1/30 rounded-3xl p-10 shadow-2xl shadow-color-5/50">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Rendimiento del Sistema
                </h3>
                <p className="text-muted-foreground">
                  Métricas actuales de tu asistente de IA
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-color-3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    24/7
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
                    Monitoreo Activo
                  </div>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-color-3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    98.9%
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
                    Precisión IA
                  </div>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-color-3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    &lt;2s
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
                    Tiempo Respuesta
                  </div>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 bg-color-3 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-color-2">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    1.2k+
                  </div>
                  <div className="text-muted-foreground text-sm font-medium">
                    Consultas/Día
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-color-2/40 backdrop-blur-sm rounded-2xl border border-color-1/50 px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-muted-foreground text-sm">
                  © 2025 joseangelweb. Sistema interno de métricas IA.
                </div>
                <div className="flex items-center gap-3 bg-color-3/60 px-4 py-2 rounded-full border border-color-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">
                    Sistema Operativo
                  </span>
                </div>
              </div>
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
  );
}
