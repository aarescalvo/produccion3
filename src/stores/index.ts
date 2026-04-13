// ============================================================
// SOLEMAR STORES - Barrel Export
// Todos los stores Zustand del sistema con Capa 1 (persist)
// ============================================================

// Core
export { useAppStore } from './appStore'
export type { Operador, Page } from './appStore'

// Offline (Capa 3)
export { useOfflineStore } from './offlineStore'
export type { QueueItem } from './offlineStore'

// Ciclo I
export { usePesajeCamionesStore } from './pesajeCamionesStore'
export { usePesajeIndividualStore } from './pesajeIndividualStore'
export { useRomaneoStore } from './romaneoStore'
export { useListaFaenaStore } from './listaFaenaStore'
export { useIngresoCajonStore } from './ingresoCajonStore'
export { useVBRomaneoStore } from './vbRomaneoStore'
export { useMovimientoCamarasStore } from './movimientoCamarasStore'
export { useMovimientoHaciendaStore } from './movimientoHaciendaStore'
export { useExpedicionStore } from './expedicionStore'

// Ciclo II
export {
  useCuarteoStore,
  useIngresoDespostadaStore,
  useMovimientosDespostadaStore,
  useCortesDespostadaStore,
  useEmpaqueStore,
} from './ciclo2Stores'

// Subproductos + Admin
export {
  useMenudenciasStore,
  useCuerosStore,
  useRenderingStore,
  useFacturacionStore,
} from './subproductosStores'
