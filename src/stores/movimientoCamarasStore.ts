'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// MOVIMIENTO CAMARAS STORE - Capa 1
// ============================================================

interface MovimientoCamarasFormState {
  // Form fields
  camaraOrigenId: string
  camaraDestinoId: string
  mediasSeleccionadas: string[]
  motivo: string
  observaciones: string

  // UI state
  activeTab: string

  // Server data
  camaras: any[]
  mediasEnCamara: any[]
  movimientos: any[]

  isDirty: boolean
}

interface MovimientoCamarasActions {
  set: <K extends keyof MovimientoCamarasFormState>(key: K, value: MovimientoCamarasFormState[K]) => void
  setMulti: (updates: Partial<MovimientoCamarasFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: MovimientoCamarasFormState = {
  camaraOrigenId: '',
  camaraDestinoId: '',
  mediasSeleccionadas: [],
  motivo: '',
  observaciones: '',
  activeTab: 'nuevo',
  camaras: [],
  mediasEnCamara: [],
  movimientos: [],
  isDirty: false,
}

export const useMovimientoCamarasStore = create<MovimientoCamarasFormState & MovimientoCamarasActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ camaraOrigenId: '', camaraDestinoId: '', mediasSeleccionadas: [], motivo: '', observaciones: '', isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-movimiento-camaras',
      partialize: (state) => ({
        camaraOrigenId: state.camaraOrigenId,
        camaraDestinoId: state.camaraDestinoId,
        mediasSeleccionadas: state.mediasSeleccionadas,
        motivo: state.motivo,
        observaciones: state.observaciones,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
