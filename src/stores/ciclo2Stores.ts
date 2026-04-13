'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// CICLO II STORES - Capa 1
// Cuarteo, Ingreso Despostada, Movimientos Despostada,
// Cortes Despostada, Empaque
// ============================================================

// --- CUARTREO ---
interface CuarteoFormState {
  tropaId: string
  tipoCuarteo: string
  observaciones: string
  tropaSeleccionada: any | null
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface CuarteoActions {
  set: <K extends keyof CuarteoFormState>(key: K, value: CuarteoFormState[K]) => void
  setMulti: (updates: Partial<CuarteoFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const cuarteoInitial: CuarteoFormState = {
  tropaId: '',
  tipoCuarteo: '',
  observaciones: '',
  tropaSeleccionada: null,
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useCuarteoStore = create<CuarteoFormState & CuarteoActions>()(
  persist(
    (set) => ({
      ...cuarteoInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ tropaId: '', tipoCuarteo: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-cuarteo', partialize: (s) => ({ tropaId: s.tropaId, tipoCuarteo: s.tipoCuarteo, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- INGRESO DESPOSTADA ---
interface IngresoDespostadaFormState {
  tropaId: string
  loteId: string
  camaraId: string
  observaciones: string
  tropaSeleccionada: any | null
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface IngresoDespostadaActions {
  set: <K extends keyof IngresoDespostadaFormState>(key: K, value: IngresoDespostadaFormState[K]) => void
  setMulti: (updates: Partial<IngresoDespostadaFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const ingresoDespostadaInitial: IngresoDespostadaFormState = {
  tropaId: '',
  loteId: '',
  camaraId: '',
  observaciones: '',
  tropaSeleccionada: null,
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useIngresoDespostadaStore = create<IngresoDespostadaFormState & IngresoDespostadaActions>()(
  persist(
    (set) => ({
      ...ingresoDespostadaInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ tropaId: '', loteId: '', camaraId: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-ingreso-despostada', partialize: (s) => ({ tropaId: s.tropaId, loteId: s.loteId, camaraId: s.camaraId, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- MOVIMIENTOS DESPOSTADA ---
interface MovimientosDespostadaFormState {
  loteId: string
  tipoMovimiento: string
  observaciones: string
  loteSeleccionado: any | null
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface MovimientosDespostadaActions {
  set: <K extends keyof MovimientosDespostadaFormState>(key: K, value: MovimientosDespostadaFormState[K]) => void
  setMulti: (updates: Partial<MovimientosDespostadaFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const movimientosDespostadaInitial: MovimientosDespostadaFormState = {
  loteId: '',
  tipoMovimiento: '',
  observaciones: '',
  loteSeleccionado: null,
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useMovimientosDespostadaStore = create<MovimientosDespostadaFormState & MovimientosDespostadaActions>()(
  persist(
    (set) => ({
      ...movimientosDespostadaInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ loteId: '', tipoMovimiento: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-movimientos-despostada', partialize: (s) => ({ loteId: s.loteId, tipoMovimiento: s.tipoMovimiento, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- CORTES DESPOSTADA ---
interface CortesDespostadaFormState {
  loteId: string
  productoId: string
  peso: string
  observaciones: string
  loteSeleccionado: any | null
  cortesRealizados: any[]
  activeTab: string
  isDirty: boolean
}

interface CortesDespostadaActions {
  set: <K extends keyof CortesDespostadaFormState>(key: K, value: CortesDespostadaFormState[K]) => void
  setMulti: (updates: Partial<CortesDespostadaFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const cortesDespostadaInitial: CortesDespostadaFormState = {
  loteId: '',
  productoId: '',
  peso: '',
  observaciones: '',
  loteSeleccionado: null,
  cortesRealizados: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useCortesDespostadaStore = create<CortesDespostadaFormState & CortesDespostadaActions>()(
  persist(
    (set) => ({
      ...cortesDespostadaInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ productoId: '', peso: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-cortes-despostada', partialize: (s) => ({ loteId: s.loteId, productoId: s.productoId, peso: s.peso, observaciones: s.observaciones, cortesRealizados: s.cortesRealizados, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- EMPAQUE ---
interface EmpaqueFormState {
  corteId: string
  tipoEmpaque: string
  peso: string
  cantidad: number
  observaciones: string
  cortesDisponibles: any[]
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface EmpaqueActions {
  set: <K extends keyof EmpaqueFormState>(key: K, value: EmpaqueFormState[K]) => void
  setMulti: (updates: Partial<EmpaqueFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const empaqueInitial: EmpaqueFormState = {
  corteId: '',
  tipoEmpaque: '',
  peso: '',
  cantidad: 1,
  observaciones: '',
  cortesDisponibles: [],
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useEmpaqueStore = create<EmpaqueFormState & EmpaqueActions>()(
  persist(
    (set) => ({
      ...empaqueInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ corteId: '', tipoEmpaque: '', peso: '', cantidad: 1, observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-empaque', partialize: (s) => ({ corteId: s.corteId, tipoEmpaque: s.tipoEmpaque, peso: s.peso, cantidad: s.cantidad, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)
