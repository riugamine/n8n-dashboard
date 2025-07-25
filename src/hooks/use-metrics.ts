'use client'

import { useQuery } from '@tanstack/react-query'
import { DashboardMetrics } from '@/lib/types'

interface MetricsResponse {
  success: boolean
  data: DashboardMetrics
  message?: string
}

/**
 * Hook personalizado para obtener las métricas del dashboard
 * Utiliza React Query para caché y polling inteligente cada 30 segundos
 */
export const useDashboardMetrics = (useMockData: boolean = true) => {
  return useQuery<MetricsResponse>({
    queryKey: ['dashboard-metrics', useMockData],
    queryFn: async () => {
      const url = useMockData 
        ? '/api/metrics?type=dashboard&mock=true'
        : '/api/metrics?type=dashboard'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al obtener las métricas del dashboard')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Polling inteligente cada 30 segundos
    retry: 2,
  })
}

/**
 * Hook para obtener métricas específicas por tipo
 */
export const useMetricsByType = (type: string, options?: {
  limit?: number
  startDate?: string
  endDate?: string
  useMock?: boolean
}) => {
  const { limit = 100, startDate, endDate, useMock = true } = options || {}
  
  return useQuery({
    queryKey: ['metrics', type, limit, startDate, endDate, useMock],
    queryFn: async () => {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(useMock && { mock: 'true' })
      })
      
      const response = await fetch(`/api/metrics?${params}`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener métricas del tipo: ${type}`)
      }
      
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
    enabled: !!type,
  })
}

/**
 * Hook para obtener preguntas frecuentes
 */
export const useFrequentQuestions = (useMock: boolean = true) => {
  return useQuery({
    queryKey: ['frequent-questions', useMock],
    queryFn: async () => {
      const url = useMock
        ? '/api/metrics?type=frequent_question&mock=true'
        : '/api/metrics?type=frequent_question'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al obtener preguntas frecuentes')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
} 