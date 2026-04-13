'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// MOVIMIENTO HACIENDA STORE - Capa 1
// ============================================================

interface MovimientoHaciendaFormState {
  // Form fields
  tropaId: string
  corralOrigenId: string
  corralDestinoId: string
  cantidad: number
  motivo: string
  observaciones: string

  // UI state
  activeTab: string

  // Server data
  tropas: any[]
  corrales: any[]
  movimientos: any[]

  isDirty: boolean
}

interface MovimientoHaciendaActions {
  set: <K extends keyof MovimientoHaciendaFormState>(key: K, value: MovimientoHaciendaFormState[K]) => void
  setMulti: (updates: Partial<MovimientoHaciendaFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: MovimientoHaciendaFormState = {
  tropaId: '',
  corralOrigenId: '',
  corralDestinoId: '',
  cantidad: 0,
  motivo: '',
  observaciones: '',
  activeTab: 'nuevo',
  tropas: [],
  corrales: [],
  movimientos: [],
  isDirty: false,
}

export const useMovimientoHaciendaStore = create<MovimientoHaciendaFormState & MovimientoHaciendaActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ tropaId: '', corralOrigenId: '', corralDestinoId: '', cantidad: 0, motivo: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-movimiento-hacienda',
      partialize: (state) => ({
        tropaId: state.tropaId,
        corralOrigenId: state.corralOrigenId,
        corralDestinoId: state.corralDestinoId,
        cantidad: state.cantidad,
        motivo: state.motivo,
        observaciones: state.observaciones,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
