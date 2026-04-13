/**
 * RESILIENCE PROVIDER - Componente integrador de las 3 capas
 * 
 * Se importa en el layout principal y provee:
 * - Indicador de estado offline (Capa 3)
 * - Indicador de borradores pendientes (Capa 2)
 * - Auto-detección de conexión
 * - Sincronización automática
 * - Alertas beforeunload (Capa 1)
 */

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOfflineStore } from '@/stores/offlineStore'
import { getSaveStatusText, getSaveStatusColor, type SaveStatus } from '@/hooks/useUnsavedChanges'

export function ResilienceProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ResilienceIndicator />
    </>
  )
}

/**
 * Indicador visual del estado de resiliencia
 * Se muestra en esquina inferior derecha
 */
function ResilienceIndicator() {
  const {
    isOnline,
    syncInProgress,
    pendingOperations,
    lastSyncAt,
    syncAll,
    notifications,
    dismissNotification,
  } = useOfflineStore()

  const [expanded, setExpanded] = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  const pendingCount = pendingOperations.length
  const hasIssues = !isOnline || pendingCount > 0
  const visibleNotifications = notifications.filter(n => !n.dismissed).slice(0, 3)

  // Mostrar notificaciones brevemente
  useEffect(() => {
    if (visibleNotifications.length > 0) {
      setShowNotif(true)
      const timer = setTimeout(() => setShowNotif(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [visibleNotifications.length])

  // Si todo está bien, no mostrar nada
  if (!hasIssues && visibleNotifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {/* Notificaciones */}
      {showNotif && visibleNotifications.map(n => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-sm text-white max-w-xs animate-in slide-in-from-right ${
            n.type === 'warning' ? 'bg-amber-500' :
            n.type === 'error' ? 'bg-red-500' :
            n.type === 'success' ? 'bg-green-500' :
            'bg-blue-500'
          }`}
          onClick={() => dismissNotification(n.id)}
        >
          {n.message}
        </div>
      ))}

      {/* Panel expandido */}
      {expanded && (
        <div className="bg-white border rounded-lg shadow-xl p-4 max-w-xs text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Estado del Sistema</span>
            <button onClick={() => setExpanded(false)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Conexión:</span>
              <Badge variant={isOnline ? 'default' : 'destructive'} className={isOnline ? 'bg-green-500' : ''}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Pendientes:</span>
              <Badge variant={pendingCount > 0 ? 'destructive' : 'default'} className={pendingCount === 0 ? 'bg-green-500' : ''}>
                {pendingCount}
              </Badge>
            </div>
            
            {lastSyncAt && (
              <div className="flex items-center justify-between">
                <span>Última sync:</span>
                <span className="text-gray-500">
                  {new Date(lastSyncAt).toLocaleTimeString('es-AR')}
                </span>
              </div>
            )}
            
            {pendingCount > 0 && isOnline && (
              <Button
                size="sm"
                onClick={() => syncAll()}
                disabled={syncInProgress}
                className="w-full mt-2"
              >
                {syncInProgress ? 'Sincronizando...' : `Sincronizar ${pendingCount} operaciones`}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Indicador principal */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
          !isOnline
            ? 'bg-red-500 text-white animate-pulse'
            : pendingCount > 0
            ? 'bg-amber-500 text-white'
            : 'bg-green-500 text-white'
        }`}
        title={
          !isOnline
            ? 'Sin conexión - datos guardados localmente'
            : pendingCount > 0
            ? `${pendingCount} operaciones pendientes de sincronización`
            : 'Sistema funcionando normalmente'
        }
      >
        {!isOnline ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        ) : syncInProgress ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        ) : pendingCount > 0 ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        )}
      </button>
    </div>
  )
}

/**
 * Save Status Indicator - Para mostrar dentro de cada módulo
 * Indica si los datos del formulario están guardados o hay cambios pendientes
 */
export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const text = getSaveStatusText(status)
  const color = getSaveStatusColor(status)
  
  if (status === 'idle') return null
  
  return (
    <div className={`flex items-center gap-1.5 text-xs ${color}`}>
      {status === 'saving' && (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'saved' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {status === 'dirty' && (
        <div className="w-2 h-2 bg-current rounded-full" />
      )}
      {status === 'error' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      {status === 'offline-saved' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      )}
      <span>{text}</span>
    </div>
  )
}

/**
 * Draft Recovery Banner - Se muestra cuando hay borradores pendientes de recuperar
 */
export function DraftRecoveryBanner({
  module,
  drafts,
  onRecover,
  onDismiss,
}: {
  module: string
  drafts: any[]
  onRecover: (draft: any) => void
  onDismiss: () => void
}) {
  if (drafts.length === 0) return null
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-sm text-blue-700">
            Tiene {drafts.length} borrador{drafts.length > 1 ? 'es' : ''} guardado{drafts.length > 1 ? 's' : ''} de una sesión anterior
          </span>
        </div>
        <div className="flex gap-2">
          {drafts.map((draft, i) => (
            <Button
              key={draft.id}
              size="sm"
              variant="outline"
              onClick={() => onRecover(draft)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Recuperar borrador {i + 1}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-gray-400"
          >
            Descartar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResilienceProvider
