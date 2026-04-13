/**
 * HOOK DE INTEGRACIÓN DE RESILIENCIA - Integra las 3 capas en cualquier módulo
 * 
 * Uso: importar y llamar en cada componente de módulo de carga de datos.
 * Provee:
 * - Capa 1: beforeUnload protection + save status
 * - Capa 2: auto-save como borrador cada 30s
 * - Capa 3: detección offline + cola de operaciones
 */

'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useOfflineStore } from '@/stores/offlineStore'
import { resilientFetch } from '@/lib/resilientFetch'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import type { SaveStatus } from '@/hooks/useUnsavedChanges'

interface UseResilientModuleOptions {
  /** Nombre del módulo (para logging y cola) */
  module: string
  /** API path para guardar borradores */
  apiPath: string
  /** Función que devuelve los datos del formulario */
  getFormData: () => Record<string, unknown>
  /** Si hay cambios sin guardar */
  isDirty: boolean
  /** Función para actualizar saveStatus en el store del módulo */
  setSaveStatus: (status: SaveStatus) => void
  /** Función para actualizar draftId en el store del módulo */
  setDraftId: (id: string | null) => void
  /** ID del borrador existente */
  draftId?: string | null
  /** Callback cuando se recupera un borrador */
  onDraftRecovered?: (data: any) => void
  /** Callback cuando se guarda exitosamente */
  onSave?: (data: any) => void
  /** Intervalo de auto-guardado (ms), default 30000 */
  autoSaveInterval?: number
}

interface UseResilientModuleReturn {
  /** Estado de conexión */
  isOnline: boolean
  /** Hay operaciones pendientes de sync */
  hasPendingOps: boolean
  /** Forzar guardado de borrador */
  saveDraftNow: () => Promise<void>
  /** Guardar definitivamente (promociona borrador) */
  saveFinal: (data: Record<string, unknown>) => Promise<{ success: boolean; data?: any; error?: string }>
  /** Hook de auto-save */
  autoSave: ReturnType<typeof useAutoSave>
  /** Hook de beforeUnload */
  unsavedChanges: {
    showAlert: boolean
    confirmNavigation: (cb: () => void) => void
    handleConfirmDiscard: () => void
    handleCancelNavigation: () => void
  }
  /** Borradores pendientes de recuperar */
  pendingDrafts: any[]
  /** Cargar borradores */
  loadDrafts: () => Promise<void>
  /** Recuperar un borrador */
  recoverDraft: (draft: any) => void
  /** Descartar borradores */
  dismissDrafts: () => void
}

export function useResilientModule({
  module,
  apiPath,
  getFormData,
  isDirty,
  setSaveStatus,
  setDraftId,
  draftId,
  onDraftRecovered,
  onSave,
  autoSaveInterval = 30000,
}: UseResilientModuleOptions): UseResilientModuleReturn {
  
  const offlineStore = useOfflineStore()
  const isOnline = offlineStore.isOnline
  const [pendingDrafts, setPendingDrafts] = useState<any[]>([])

  // Capa 2: Auto-save como borrador
  const autoSave = useAutoSave({
    getData: getFormData,
    apiPath: '/api/drafts',
    module,
    isDirty,
    draftId,
    intervalMs: autoSaveInterval,
    setSaveStatus,
    setDraftId,
    onSave,
  })

  // Capa 1: Protección beforeUnload
  const unsavedChanges = useUnsavedChanges({
    isDirty,
    onDiscard: () => {
      // Limpiar store del módulo al descartar
      setSaveStatus('idle')
    },
  })

  // Guardar borrador manualmente
  const saveDraftNow = useCallback(async () => {
    await autoSave.saveNow()
  }, [autoSave])

  // Guardar definitivamente (Capa 2 → promover + Capa 3 → resilientFetch)
  const saveFinal = useCallback(async (data: Record<string, unknown>) => {
    setSaveStatus('saving')
    
    try {
      const result = await resilientFetch(apiPath, {
        method: 'POST',
        body: data,
        module,
        priority: 'high',
      })
      
      if (result.success && !result.fromOfflineQueue) {
        setSaveStatus('saved')
        
        // Si había un borrador, eliminarlo
        if (draftId) {
          try {
            await fetch(`/api/drafts?id=${draftId}&module=${module}`, { method: 'DELETE' })
          } catch (e) {
            console.error('[ResilientModule] Error eliminando borrador:', e)
          }
        }
        
        return { success: true, data: result.data }
      } else if (result.fromOfflineQueue) {
        setSaveStatus('offline-saved')
        toast.info('Sin conexión - datos guardados localmente')
        return { success: true, data: { offline: true } }
      } else {
        setSaveStatus('error')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      setSaveStatus('error')
      return { success: false, error: error.message }
    }
  }, [apiPath, module, draftId, setSaveStatus])

  // Cargar borradores pendientes
  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetch(`/api/drafts?module=${module}`)
      const data = await res.json()
      if (data.success) {
        setPendingDrafts(data.data || [])
      }
    } catch (e) {
      console.error('[ResilientModule] Error cargando borradores:', e)
    }
  }, [module])

  // Recuperar borrador
  const recoverDraft = useCallback((draft: any) => {
    onDraftRecovered?.(draft)
    setPendingDrafts(prev => prev.filter(d => d.id !== draft.id))
    toast.success('Borrador recuperado')
  }, [onDraftRecovered])

  // Descartar borradores
  const dismissDrafts = useCallback(() => {
    setPendingDrafts([])
    // Eliminar borradores del servidor
    pendingDrafts.forEach(async (draft) => {
      try {
        await fetch(`/api/drafts?id=${draft.id}&module=${module}`, { method: 'DELETE' })
      } catch (e) {
        console.error('[ResilientModule] Error eliminando borrador:', e)
      }
    })
  }, [pendingDrafts, module])

  // Cargar borradores al montar el componente
  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  return {
    isOnline,
    hasPendingOps: offlineStore.pendingOperations.length > 0,
    saveDraftNow,
    saveFinal,
    autoSave,
    unsavedChanges,
    pendingDrafts,
    loadDrafts,
    recoverDraft,
    dismissDrafts,
  }
}

export default useResilientModule
