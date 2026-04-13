'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// LISTA FAENA STORE - Capa 1
// ============================================================

interface ListaFaenaFormState {
  // Form fields
  fechaFaena: string
  especie: string
  observaciones: string
  tropasSeleccionadas: string[]

  // UI state
  activeTab: string
  listaSeleccionada: string | null

  // Server data
  listas: any[]
  tropasDisponibles: any[]

  isDirty: boolean
}

interface ListaFaenaActions {
  set: <K extends keyof ListaFaenaFormState>(key: K, value: ListaFaenaFormState[K]) => void
  setMulti: (updates: Partial<ListaFaenaFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: ListaFaenaFormState = {
  fechaFaena: new Date().toISOString().split('T')[0],
  especie: 'BOVINO',
  observaciones: '',
  tropasSeleccionadas: [],
  activeTab: 'nueva',
  listaSeleccionada: null,
  listas: [],
  tropasDisponibles: [],
  isDirty: false,
}

export const useListaFaenaStore = create<ListaFaenaFormState & ListaFaenaActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ fechaFaena: new Date().toISOString().split('T')[0], especie: 'BOVINO', observaciones: '', tropasSeleccionadas: [], isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-lista-faena',
      partialize: (state) => ({
        fechaFaena: state.fechaFaena,
        especie: state.especie,
        observaciones: state.observaciones,
        tropasSeleccionadas: state.tropasSeleccionadas,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
