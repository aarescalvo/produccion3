/**
 * USE UNSAVED CHANGES - Protección contra pérdida de datos
 * 
 * Hook que:
 * 1. Muestra alerta beforeunload cuando hay cambios sin guardar
 * 2. Proporciona estado reactivo de "dirty" para indicadores UI
 * 3. Se integra con los Zustand stores de cada módulo
 */

import { useEffect, useCallback, useState } from 'react'

interface UseUnsavedChangesOptions {
  /** Si hay cambios sin guardar */
  isDirty: boolean
  /** Mensaje personalizado para la alerta */
  message?: string
  /** Callback al confirmar descartar cambios */
  onDiscard?: () => void
}

export function useUnsavedChanges({
  isDirty,
  message = 'Hay cambios sin guardar. ¿Está seguro de que desea salir?',
  onDiscard,
}: UseUnsavedChangesOptions) {
  const [showAlert, setShowAlert] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  // BeforeUnload - prevenir cierre/refresh del navegador
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Navegadores modernos ignoran el mensaje personalizado
      // pero lo incluimos para compatibilidad
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, message])

  // Interceptar navegación interna (cambio de módulo)
  const confirmNavigation = useCallback(
    (navigationCallback: () => void) => {
      if (isDirty) {
        setShowAlert(true)
        setPendingNavigation(() => navigationCallback)
      } else {
        navigationCallback()
      }
    },
    [isDirty]
  )

  // Confirmar descartar y navegar
  const handleConfirmDiscard = useCallback(() => {
    onDiscard?.()
    setShowAlert(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }, [onDiscard, pendingNavigation])

  // Cancelar navegación
  const handleCancelNavigation = useCallback(() => {
    setShowAlert(false)
    setPendingNavigation(null)
  }, [])

  return {
    showAlert,
    confirmNavigation,
    handleConfirmDiscard,
    handleCancelNavigation,
  }
}

/**
 * Indicador visual de estado de guardado
 */
export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'

export function getSaveStatusText(status: SaveStatus): string {
  switch (status) {
    case 'idle': return ''
    case 'dirty': return 'Cambios sin guardar'
    case 'saving': return 'Guardando...'
    case 'saved': return 'Guardado ✓'
    case 'error': return 'Error al guardar'
    case 'offline-saved': return 'Guardado localmente (sin conexión)'
  }
}

export function getSaveStatusColor(status: SaveStatus): string {
  switch (status) {
    case 'idle': return 'text-gray-400'
    case 'dirty': return 'text-amber-500'
    case 'saving': return 'text-blue-500'
    case 'saved': return 'text-green-500'
    case 'error': return 'text-red-500'
    case 'offline-saved': return 'text-amber-500'
  }
}

export default useUnsavedChanges
