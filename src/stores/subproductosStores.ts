'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// SUBPRODUCTOS STORES - Capa 1
// Menudencias, Cueros, Rendering
// ============================================================

// --- MENUDENCIAS ---
interface MenudenciasFormState {
  tropaId: string
  tipoMenudenciaId: string
  peso: string
  destino: string
  observaciones: string
  tropaSeleccionada: any | null
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface MenudenciasActions {
  set: <K extends keyof MenudenciasFormState>(key: K, value: MenudenciasFormState[K]) => void
  setMulti: (updates: Partial<MenudenciasFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const menudenciasInitial: MenudenciasFormState = {
  tropaId: '',
  tipoMenudenciaId: '',
  peso: '',
  destino: '',
  observaciones: '',
  tropaSeleccionada: null,
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useMenudenciasStore = create<MenudenciasFormState & MenudenciasActions>()(
  persist(
    (set) => ({
      ...menudenciasInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ tipoMenudenciaId: '', peso: '', destino: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-menudencias', partialize: (s) => ({ tropaId: s.tropaId, tipoMenudenciaId: s.tipoMenudenciaId, peso: s.peso, destino: s.destino, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- CUEROS ---
interface CuerosFormState {
  tropaId: string
  conservacion: string
  destino: string
  cantidad: number
  pesoTotal: string
  observaciones: string
  tropaSeleccionada: any | null
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface CuerosActions {
  set: <K extends keyof CuerosFormState>(key: K, value: CuerosFormState[K]) => void
  setMulti: (updates: Partial<CuerosFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const cuerosInitial: CuerosFormState = {
  tropaId: '',
  conservacion: '',
  destino: '',
  cantidad: 0,
  pesoTotal: '',
  observaciones: '',
  tropaSeleccionada: null,
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useCuerosStore = create<CuerosFormState & CuerosActions>()(
  persist(
    (set) => ({
      ...cuerosInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ conservacion: '', destino: '', cantidad: 0, pesoTotal: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-cueros', partialize: (s) => ({ tropaId: s.tropaId, conservacion: s.conservacion, destino: s.destino, cantidad: s.cantidad, pesoTotal: s.pesoTotal, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- RENDERING ---
interface RenderingFormState {
  tipo: string  // GRASA | DESPERDICIOS | FONDO_DIGESTOR
  peso: string
  destino: string
  observaciones: string
  registros: any[]
  activeTab: string
  isDirty: boolean
}

interface RenderingActions {
  set: <K extends keyof RenderingFormState>(key: K, value: RenderingFormState[K]) => void
  setMulti: (updates: Partial<RenderingFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const renderingInitial: RenderingFormState = {
  tipo: 'GRASA',
  peso: '',
  destino: '',
  observaciones: '',
  registros: [],
  activeTab: 'nuevo',
  isDirty: false,
}

export const useRenderingStore = create<RenderingFormState & RenderingActions>()(
  persist(
    (set) => ({
      ...renderingInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ peso: '', destino: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-rendering', partialize: (s) => ({ tipo: s.tipo, peso: s.peso, destino: s.destino, observaciones: s.observaciones, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)

// --- FACTURACION ---
interface FacturacionFormState {
  clienteId: string
  tipoComprobante: string
  condicionIva: string
  observaciones: string
  items: any[]
  facturaSeleccionada: any | null
  activeTab: string
  isDirty: boolean
}

interface FacturacionActions {
  set: <K extends keyof FacturacionFormState>(key: K, value: FacturacionFormState[K]) => void
  setMulti: (updates: Partial<FacturacionFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const facturacionInitial: FacturacionFormState = {
  clienteId: '',
  tipoComprobante: 'A',
  condicionIva: '',
  observaciones: '',
  items: [],
  facturaSeleccionada: null,
  activeTab: 'nueva',
  isDirty: false,
}

export const useFacturacionStore = create<FacturacionFormState & FacturacionActions>()(
  persist(
    (set) => ({
      ...facturacionInitial,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ clienteId: '', tipoComprobante: 'A', condicionIva: '', observaciones: '', items: [], isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    { name: 'solemar-facturacion', partialize: (s) => ({ clienteId: s.clienteId, tipoComprobante: s.tipoComprobante, condicionIva: s.condicionIva, observaciones: s.observaciones, items: s.items, activeTab: s.activeTab, isDirty: s.isDirty }) }
  )
)
