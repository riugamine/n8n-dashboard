'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth } from '@/lib/supabase-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal de login elegante para acceder al dashboard
 */
export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await auth.signIn(email, password)
      
      if (error) {
        setError('Credenciales incorrectas. Por favor verifica tu email y contraseña.')
        return
      }

      // Redirigir al dashboard
      router.push('/dashboard')
      onClose()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-color-5/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 shadow-2xl border border-color-2/50 bg-color-2/95 backdrop-blur-xl">
        <CardHeader className="text-center relative pb-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-color-3/50 transition-colors"
          >
            <X className="h-5 w-5 text-white/70 hover:text-white" />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-color-5 rounded-2xl flex items-center justify-center border border-color-3">
            <span className="text-white font-bold text-xl font-poppins">JAW</span>
          </div>
          
          <CardTitle className="text-2xl font-poppins font-bold text-white">
            Acceso al Dashboard
          </CardTitle>
          <CardDescription className="font-montserrat-light text-muted-foreground">
            Ingresa tus credenciales para acceder a las métricas del asistente IA
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white font-montserrat">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-color-3/50 border border-color-1/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 font-montserrat text-white placeholder:text-muted-foreground backdrop-blur-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white font-montserrat">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-color-3/50 border border-color-1/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 font-montserrat text-white placeholder:text-muted-foreground backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-sm text-red-200 font-montserrat">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-color-5 hover:bg-color-4 text-white py-3 px-4 rounded-lg font-medium font-poppins focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-color-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-color-3/50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                'Acceder al Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-color-1/30">
            <p className="text-xs text-center text-muted-foreground font-montserrat-light">
              Sistema interno de métricas IA · joseangelweb
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 