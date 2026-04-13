'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// VB ROMANEO STORE - Capa 1
// Verificación de romaneo por supervisor
// ============================================================

interface VBRomaneoFormState {
  // Filters
  filtroTropa: string
  filtroFecha: string
  filtroEstado: string

  // Selection
  romaneoSeleccionado: any | null

  // VB form
  observacionesVB: string
  estadoVB: string  // APROBADO | RECHAZADO | OBSERVADO

  // UI state
  activeTab: string

  // Server data
  romaneos: any[]

  isDirty: boolean
}

interface VBRomaneoActions {
  set: <K extends keyof VBRomaneoFormState>(key: K, value: VBRomaneoFormState[K]) => void
  setMulti: (updates: Partial<VBRomaneoFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: VBRomaneoFormState = {
  filtroTropa: '',
  filtroFecha: '',
  filtroEstado: '',
  romaneoSeleccionado: null,
  observacionesVB: '',
  estadoVB: '',
  activeTab: 'pendientes',
  romaneos: [],
  isDirty: false,
}

export const useVBRomaneoStore = create<VBRomaneoFormState & VBRomaneoActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ observacionesVB: '', estadoVB: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-vb-romaneo',
      partialize: (state) => ({
        filtroTropa: state.filtroTropa,
        filtroFecha: state.filtroFecha,
        filtroEstado: state.filtroEstado,
        observacionesVB: state.observacionesVB,
        estadoVB: state.estadoVB,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
