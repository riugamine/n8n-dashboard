'use client'

import { cn } from "@/lib/utils"

interface LightRaysProps {
  className?: string
  count?: number
}

/**
 * Componente Light Rays animado para fondos
 * Basado en React Bits - crea rayos de luz animados
 */
export function LightRays({ className, count = 8 }: LightRaysProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute top-0 h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent",
              "animate-pulse"
            )}
            style={{
              left: `${(i + 1) * (100 / (count + 1))}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
              transform: `rotate(${-45 + i * 10}deg)`,
              transformOrigin: 'top center',
              opacity: 0.1 + (i * 0.1),
            }}
          />
        ))}
        
        {/* Rayos principales más prominentes */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`main-${i}`}
            className={cn(
              "absolute top-0 h-full w-0.5 bg-gradient-to-b",
              "from-transparent via-blue-400/30 to-transparent",
              "animate-pulse"
            )}
            style={{
              left: `${20 + i * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${3 + i * 0.5}s`,
              transform: `rotate(${-30 + i * 20}deg)`,
              transformOrigin: 'top center',
              opacity: 0.2 + (i * 0.1),
            }}
          />
        ))}

        {/* Efecto de resplandor central */}
        <div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 30%, transparent 70%)',
            width: '800px',
            height: '800px',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* Partículas flotantes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
            style={{
              top: `${10 + i * 7}%`,
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${2 + i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
} 