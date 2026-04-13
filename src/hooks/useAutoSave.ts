/**
 * USE AUTO SAVE - Capa 2: Hook de auto-guardado como BORRADOR
 * 
 * Guarda automáticamente el estado del formulario como BORRADOR
 * en la base de datos cada N segundos (configurable).
 * 
 * Esto protege contra:
 * - Cierre del navegador (Capa 1 protege esto también con localStorage)
 * - Crash del navegador o del OS
 * - Corte de energía
 * - Múltiples pestañas (localStorage es por pestaña, DB es compartida)
 * 
 * El borrador se promociona a estado final cuando el usuario
 * confirma la operación (guardar正式mente).
 */

import { useEffect, useRef, useCallback } from 'react'
import { resilientFetch, saveDraft, promoteDraft } from '@/lib/resilientFetch'
import { useOfflineStore } from '@/stores/offlineStore'
import type { SaveStatus } from '@/hooks/useUnsavedChanges'

interface UseAutoSaveOptions {
  /** Función que devuelve los datos actuales del formulario */
  getData: () => Record<string, unknown>
  /** URL de la API para guardar el borrador */
  apiPath: string
  /** Nombre del módulo (para logging y cola offline) */
  module: string
  /** Si hay cambios sin guardar (para saber si hay que guardar) */
  isDirty: boolean
  /** ID del borrador existente (si se está editando) */
  draftId?: string | null
  /** Intervalo de auto-guardado en ms (default: 30000 = 30 seg) */
  intervalMs?: number
  /** Callback al guardar exitosamente */
  onSave?: (data: any) => void
  /** Callback al recuperar un borrador */
  onDraftRecovered?: (data: any) => void
  /** Función para actualizar el status de guardado en el store */
  setSaveStatus?: (status: SaveStatus) => void
  /** Función para actualizar el draftId en el store */
  setDraftId?: (id: string | null) => void
}

interface UseAutoSaveReturn {
  /** Forzar guardado manual */
  saveNow: () => Promise<void>
  /** Promocionar borrador a definitivo */
  promoteNow: () => Promise<void>
  /** Último resultado de guardado */
  lastSaveResult: React.MutableRefObject<{ success: boolean; data?: any; error?: string } | null>
}

export function useAutoSave({
  getData,
  apiPath,
  module,
  isDirty,
  draftId,
  intervalMs = 30000,
  onSave,
  onDraftRecovered,
  setSaveStatus,
  setDraftId: setStoreDraftId,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const lastSaveResult = useRef<{ success: boolean; data?: any; error?: string } | null>(null)
  const lastSavedData = useRef<string>('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isSaving = useRef(false)

  // Función de guardado
  const doSave = useCallback(async () => {
    if (isSaving.current) return
    
    const data = getData()
    const dataStr = JSON.stringify(data)
    
    // No guardar si no hay cambios desde el último guardado
    if (dataStr === lastSavedData.current) return
    
    isSaving.current = true
    setSaveStatus?.('saving')
    
    try {
      const payload = {
        ...data,
        estado: 'BORRADOR',
        isDraft: true,
        draftId: draftId || undefined,
      }
      
      const result = await saveDraft(apiPath, payload, module)
      
      if (result.success) {
        lastSavedData.current = dataStr
        lastSaveResult.current = { success: true, data: result.data }
        
        // Si es nuevo borrador, guardar el ID
        if (result.data && typeof result.data === 'object' && 'id' in (result.data as any) && !draftId) {
          setStoreDraftId?.((result.data as any).id)
        }
        
        setSaveStatus?.('saved')
        onSave?.(result.data)
      } else if (result.fromOfflineQueue) {
        // Se guardó en la cola offline
        setSaveStatus?.('offline-saved')
        lastSaveResult.current = { success: true, data: { offline: true } }
      } else {
        setSaveStatus?.('error')
        lastSaveResult.current = { success: false, error: result.error }
      }
    } catch (error: any) {
      setSaveStatus?.('error')
      lastSaveResult.current = { success: false, error: error.message }
    } finally {
      isSaving.current = false
    }
  }, [getData, apiPath, module, draftId, setSaveStatus, setStoreDraftId, onSave])

  // Promocionar borrador
  const promoteNow = useCallback(async () => {
    if (!draftId) return
    
    try {
      const result = await promoteDraft(apiPath, draftId, module)
      if (result.success) {
        lastSaveResult.current = { success: true, data: result.data }
      } else {
        lastSaveResult.current = { success: false, error: result.error }
      }
    } catch (error: any) {
      lastSaveResult.current = { success: false, error: error.message }
    }
  }, [draftId, apiPath, module])

  // Auto-save timer
  useEffect(() => {
    if (!isDirty) return
    
    timerRef.current = setInterval(() => {
      doSave()
    }, intervalMs)
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isDirty, intervalMs, doSave])

  // Guardar al cambiar de pestaña (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirty) {
        doSave()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isDirty, doSave])

  return {
    saveNow: doSave,
    promoteNow,
    lastSaveResult,
  }
}

export default useAutoSave
