'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// INGRESO CAJON STORE - Capa 1
// Asignación de garrones durante la faena
// ============================================================

interface IngresoCajonFormState {
  // Session
  tropaSeleccionada: any | null
  listaFaenaId: string

  // Form fields
  garronDesde: number
  garronHasta: number
  observaciones: string

  // UI state
  activeTab: string
  animalesAsignados: any[]

  // Server data
  tropas: any[]
  listasFaena: any[]

  isDirty: boolean
}

interface IngresoCajonActions {
  set: <K extends keyof IngresoCajonFormState>(key: K, value: IngresoCajonFormState[K]) => void
  setMulti: (updates: Partial<IngresoCajonFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: IngresoCajonFormState = {
  tropaSeleccionada: null,
  listaFaenaId: '',
  garronDesde: 1,
  garronHasta: 1,
  observaciones: '',
  activeTab: 'asignar',
  animalesAsignados: [],
  tropas: [],
  listasFaena: [],
  isDirty: false,
}

export const useIngresoCajonStore = create<IngresoCajonFormState & IngresoCajonActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ garronDesde: 1, garronHasta: 1, observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-ingreso-cajon',
      partialize: (state) => ({
        tropaSeleccionada: state.tropaSeleccionada,
        listaFaenaId: state.listaFaenaId,
        garronDesde: state.garronDesde,
        garronHasta: state.garronHasta,
        observaciones: state.observaciones,
        activeTab: state.activeTab,
        animalesAsignados: state.animalesAsignados,
        isDirty: state.isDirty,
      }),
    }
  )
)
