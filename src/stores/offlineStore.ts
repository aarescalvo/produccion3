/**
 * OFFLINE STORE - Capa 3: Store Zustand para gestión de operaciones offline
 * 
 * Cola unificada de operaciones pendientes que se sincronizan
 * automáticamente cuando se recupera la conexión.
 * 
 * Usa IndexedDB (via existing OfflineManager) como persistencia
 * y Zustand para el estado reactivo en la UI.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OfflineManager, type SyncQueueItem } from '@/lib/offline'

export type OperationPriority = 'high' | 'medium' | 'low'

export interface PendingOperation {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  module: string
  priority: OperationPriority
  timestamp: number
  attempts: number
  lastError?: string
}

export interface OfflineNotification {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  message: string
  timestamp: number
  dismissed: boolean
}

interface OfflineStoreState {
  // Estado de conexión
  isOnline: boolean
  lastOnlineAt: number | null
  lastSyncAt: number | null
  
  // Cola de operaciones
  pendingOperations: PendingOperation[]
  syncInProgress: boolean
  
  // Notificaciones
  notifications: OfflineNotification[]
  
  // Contadores por módulo
  pendingByModule: Record<string, number>
  
  // Actions
  setOnline: (online: boolean) => void
  enqueueOperation: (op: Omit<PendingOperation, 'id' | 'timestamp' | 'attempts'>) => Promise<void>
  removeOperation: (id: string) => Promise<void>
  incrementAttempts: (id: string, error?: string) => void
  syncAll: () => Promise<{ success: number; failed: number; errors: string[] }>
  addNotification: (notification: Omit<OfflineNotification, 'id' | 'timestamp' | 'dismissed'>) => void
  dismissNotification: (id: string) => void
  clearOldNotifications: () => void
  getPendingCountByModule: (module: string) => number
  loadFromIndexedDB: () => Promise<void>
}

export const useOfflineStore = create<OfflineStoreState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastOnlineAt: null,
      lastSyncAt: null,
      pendingOperations: [],
      syncInProgress: false,
      notifications: [],
      pendingByModule: {},

      // Detectar conexión
      setOnline: (online: boolean) => {
        set(state => {
          const updates: Partial<OfflineStoreState> = { isOnline: online }
          if (online) {
            updates.lastOnlineAt = Date.now()
          }
          return updates
        })
        
        // Auto-sync al recuperar conexión
        if (online && get().pendingOperations.length > 0) {
          get().addNotification({
            type: 'info',
            message: 'Conexión recuperada. Sincronizando datos pendientes...',
          })
          // Delay breve para estabilizar conexión
          setTimeout(() => get().syncAll(), 2000)
        }
        
        if (!online) {
          get().addNotification({
            type: 'warning',
            message: 'Sin conexión. Los datos se guardarán localmente.',
          })
        }
      },

      // Encolar operación
      enqueueOperation: async (op) => {
        const operation: PendingOperation = {
          ...op,
          id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          attempts: 0,
        }
        
        // Guardar en IndexedDB para persistencia real
        try {
          await OfflineManager.addToSyncQueue(op.module, op.method === 'DELETE' ? 'DELETE' : op.method === 'POST' ? 'CREATE' : 'UPDATE', {
            url: op.url,
            method: op.method,
            body: op.body,
          })
        } catch (e) {
          console.error('[OfflineStore] Error guardando en IndexedDB:', e)
        }
        
        set(state => {
          const newOperations = [...state.pendingOperations, operation]
          const newPendingByModule = { ...state.pendingByModule }
          newPendingByModule[op.module] = (newPendingByModule[op.module] || 0) + 1
          return {
            pendingOperations: newOperations,
            pendingByModule: newPendingByModule,
          }
        })
        
        console.log(`[OfflineStore] Operación encolada: ${op.method} ${op.url} (${op.module})`)
      },

      // Remover operación completada
      removeOperation: async (id: string) => {
        set(state => {
          const op = state.pendingOperations.find(o => o.id === id)
          const newOperations = state.pendingOperations.filter(o => o.id !== id)
          const newPendingByModule = { ...state.pendingByModule }
          if (op) {
            newPendingByModule[op.module] = Math.max(0, (newPendingByModule[op.module] || 0) - 1)
          }
          return {
            pendingOperations: newOperations,
            pendingByModule: newPendingByModule,
          }
        })
      },

      // Incrementar intentos
      incrementAttempts: (id: string, error?: string) => {
        set(state => ({
          pendingOperations: state.pendingOperations.map(op =>
            op.id === id
              ? { ...op, attempts: op.attempts + 1, lastError: error }
              : op
          ),
        }))
      },

      // Sincronizar todas las operaciones pendientes
      syncAll: async () => {
        const { isOnline, pendingOperations, syncInProgress } = get()
        
        if (!isOnline || syncInProgress || pendingOperations.length === 0) return { success: 0, failed: 0, errors: [] }
        
        set({ syncInProgress: true })
        
        let success = 0
        let failed = 0
        const errors: string[] = []
        
        // Ordenar por prioridad: high > medium > low
        const sortedOps = [...pendingOperations].sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
        
        for (const op of sortedOps) {
          try {
            const fetchOptions: RequestInit = {
              method: op.method,
              headers: { 'Content-Type': 'application/json' },
            }
            
            if (op.body) {
              fetchOptions.body = JSON.stringify(op.body)
            }
            
            const response = await fetch(op.url, fetchOptions)
            
            if (response.ok) {
              await get().removeOperation(op.id)
              success++
            } else {
              const errorData = await response.json().catch(() => ({}))
              const errorMsg = errorData.error || `HTTP ${response.status}`
              get().incrementAttempts(op.id, errorMsg)
              failed++
              errors.push(`${op.module}: ${errorMsg}`)
            }
          } catch (error: any) {
            get().incrementAttempts(op.id, error.message)
            failed++
            errors.push(`${op.module}: ${error.message}`)
          }
        }
        
        // También procesar la cola de IndexedDB existente
        try {
          const idxResult = await OfflineManager.processSyncQueue()
          success += idxResult.success
          failed += idxResult.failed
          errors.push(...idxResult.errors)
        } catch (e) {
          console.error('[OfflineStore] Error procesando IndexedDB queue:', e)
        }
        
        set({
          syncInProgress: false,
          lastSyncAt: Date.now(),
        })
        
        if (success > 0) {
          get().addNotification({
            type: 'success',
            message: `Sincronización completada: ${success} operaciones sincronizadas${failed > 0 ? `, ${failed} fallidas` : ''}`,
          })
        }
        
        return { success, failed, errors }
      },

      // Notificaciones
      addNotification: (notification) => {
        const n: OfflineNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          dismissed: false,
        }
        set(state => ({ notifications: [n, ...state.notifications].slice(0, 50) }))
      },

      dismissNotification: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, dismissed: true } : n
          ),
        }))
      },

      clearOldNotifications: () => {
        const oneHourAgo = Date.now() - 3600000
        set(state => ({
          notifications: state.notifications.filter(n => n.timestamp > oneHourAgo),
        }))
      },

      // Contador por módulo
      getPendingCountByModule: (module: string) => {
        return get().pendingByModule[module] || 0
      },

      // Cargar desde IndexedDB al iniciar
      loadFromIndexedDB: async () => {
        try {
          await OfflineManager.init()
          const pendingCount = await OfflineManager.getPendingSyncCount()
          if (pendingCount > 0) {
            get().addNotification({
              type: 'info',
              message: `Hay ${pendingCount} operaciones pendientes de sincronización.`,
            })
          }
        } catch (e) {
          console.error('[OfflineStore] Error cargando desde IndexedDB:', e)
        }
      },
    }),
    {
      name: 'solemar-offline-store',
      // Solo persistir lo esencial, no la cola (va en IndexedDB)
      partialize: (state) => ({
        lastOnlineAt: state.lastOnlineAt,
        lastSyncAt: state.lastSyncAt,
        pendingByModule: state.pendingByModule,
      }),
    }
  )
)

// Auto-detectar cambios de conexión
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useOfflineStore.getState().setOnline(true))
  window.addEventListener('offline', () => useOfflineStore.getState().setOnline(false))
  
  // Cargar pendientes de IndexedDB al inicio
  OfflineManager.init().then(() => {
    useOfflineStore.getState().loadFromIndexedDB()
  }).catch(console.error)
}

export default useOfflineStore
