/**
 * STORES INDEX - Exportación centralizada de todos los stores
 * 
 * Capa 1: Zustand + persist para protección de formularios
 * Cada módulo de carga de datos tiene su propio store que
 * auto-guarda en localStorage en cada cambio.
 */

// Ciclo I - Módulos principales
export { usePesajeCamionesStore } from './pesajeCamionesStore'
export { usePesajeIndividualStore } from './pesajeIndividualStore'
export { useListaFaenaStore } from './listaFaenaStore'
export { useRomaneoStore } from './romaneoStore'
export { useExpedicionStore } from './expedicionStore'
export { useMovimientoCamaraStore } from './movimientoCamaraStore'
export { useMovimientoHaciendaStore } from './movimientoHaciendaStore'
export { useIngresoCajonStore } from './ingresoCajonStore'
export { useMenudenciasStore } from './menudenciasStore'

// Ciclo II - Despostada
export { useCuarteoStore } from './cuarteoStore'
export { useIngresoDespostadaStore } from './ingresoDespostadaStore'
export { useCortesDespostadaStore } from './cortesDespostadaStore'
export { useEmpaqueStore } from './empaqueStore'

// Subproductos
export { useCuerosStore } from './cuerosStore'
export { useRenderingStore } from './renderingStore'

// Administración
export { useFacturacionStore } from './facturacionStore'

// Capa 3 - Offline
export { useOfflineStore } from './offlineStore'
