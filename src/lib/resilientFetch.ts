/**
 * RESILIENT FETCH - Capa 3: Wrapper resiliente para todas las llamadas API
 * 
 * Funcionalidades:
 * - Detección automática de conexión
 * - Cola de operaciones offline (IndexedDB via offlineStore)
 * - Reintentos con backoff exponencial
 * - Auto-sincronización al recuperar conexión
 * - Protección contra pérdida de datos
 */

import { useOfflineStore } from '@/stores/offlineStore'

export interface ResilientFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  /** Módulo que origina la petición (para la cola offline) */
  module?: string
  /** Si es true, NO encola offline cuando no hay conexión (ej: lecturas) */
  queueOffline?: boolean
  /** Número máximo de reintentos */
  maxRetries?: number
  /** Timeout en ms */
  timeout?: number
  /** Prioridad en la cola de sincronización */
  priority?: 'high' | 'medium' | 'low'
}

export interface ResilientFetchResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fromOfflineQueue?: boolean
  retried?: number
}

const DEFAULT_OPTIONS: Omit<Required<ResilientFetchOptions>, 'body' | 'module' | 'headers'> = {
  method: 'GET',
  queueOffline: true,
  maxRetries: 2,
  timeout: 15000,
  priority: 'medium',
}

/**
 * Realiza un fetch resiliente. Si no hay conexión y queueOffline=true,
 * encola la operación para sincronizar después.
 */
export async function resilientFetch<T = unknown>(
  url: string,
  options: ResilientFetchOptions = {}
): Promise<ResilientFetchResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  // Si no hay conexión y es una operación que debe encolarse
  if (!isOnline && opts.queueOffline && opts.method !== 'GET') {
    return enqueueOfflineOperation<T>(url, opts)
  }

  // Si no hay conexión y es GET, intentar caché
  if (!isOnline && opts.method === 'GET') {
    return {
      success: false,
      error: 'Sin conexión - datos no disponibles offline',
    }
  }

  // Ejecutar fetch con reintentos
  let lastError: string | undefined
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout)

      const fetchOptions: RequestInit = {
        method: opts.method,
        headers: {
          'Content-Type': 'application/json',
          ...opts.headers,
        },
        signal: controller.signal,
      }

      if (opts.body && opts.method !== 'GET') {
        fetchOptions.body = JSON.stringify(opts.body)
      }

      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        lastError = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        
        // Si es error de servidor (5xx), reintentar
        if (response.status >= 500 && attempt < opts.maxRetries) {
          await exponentialBackoff(attempt)
          continue
        }
        
        // Si es error de cliente (4xx), no reintentar
        return { success: false, error: lastError, retried: attempt }
      }

      const data = await response.json()
      return { success: true, data: data.data ?? data, retried: attempt }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        lastError = `Timeout después de ${opts.timeout}ms`
      } else {
        lastError = error.message || 'Error de conexión'
      }

      // Si es error de red y debemos encolar
      if (isNetworkError(error) && opts.queueOffline && opts.method !== 'GET') {
        return enqueueOfflineOperation<T>(url, opts)
      }

      if (attempt < opts.maxRetries) {
        await exponentialBackoff(attempt)
      }
    }
  }

  // Si agotó reintentos y es una operación de escritura, encolar offline
  if (opts.queueOffline && opts.method !== 'GET') {
    return enqueueOfflineOperation<T>(url, opts)
  }

  return { success: false, error: lastError || 'Error desconocido' }
}

/**
 * Encola una operación para ejecutar cuando vuelva la conexión
 */
async function enqueueOfflineOperation<T>(url: string, opts: ResilientFetchOptions): Promise<ResilientFetchResult<T>> {
  try {
    const offlineStore = useOfflineStore.getState()
    
    await offlineStore.enqueueOperation({
      url,
      method: opts.method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      body: opts.body,
      module: opts.module || 'unknown',
      priority: (opts.priority || 'medium') as 'high' | 'medium' | 'low',
    })

    return {
      success: true,
      fromOfflineQueue: true,
      data: undefined as T,
    }
  } catch (error: any) {
    console.error('[ResilientFetch] Error encolando operación offline:', error)
    return { success: false, error: 'Error al guardar operación offline' }
  }
}

/**
 * Backoff exponencial con jitter
 */
function exponentialBackoff(attempt: number): Promise<void> {
  const baseDelay = 1000 // 1 segundo
  const maxDelay = 10000 // 10 segundos máximo
  const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 500, maxDelay)
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Determina si un error es de red (vs error de aplicación)
 */
function isNetworkError(error: any): boolean {
  if (!error) return false
  return (
    error.name === 'TypeError' && error.message === 'Failed to fetch' ||
    error.name === 'AbortError' ||
    error.name === 'NetworkError' ||
    error.message?.includes('NetworkError') ||
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('net::ERR_')
  )
}

/**
 * Guardar borrador (Capa 2) - guarda como BORRADOR en la DB
 */
export async function saveDraft(
  apiPath: string,
  data: Record<string, unknown>,
  module: string
): Promise<ResilientFetchResult> {
  const payload = { ...data, estado: 'BORRADOR', isDraft: true }
  
  return resilientFetch(apiPath, {
    method: 'POST',
    body: payload,
    module,
    priority: 'high',
    maxRetries: 1,
    timeout: 8000,
  })
}

/**
 * Promocionar borrador a estado final (Capa 2)
 */
export async function promoteDraft(
  apiPath: string,
  id: string,
  module: string
): Promise<ResilientFetchResult> {
  return resilientFetch(`${apiPath}?id=${id}&action=promote`, {
    method: 'PUT',
    body: { id, action: 'promote' },
    module,
    priority: 'high',
  })
}

export default resilientFetch
