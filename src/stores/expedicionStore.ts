'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// EXPEDICION STORE - Capa 1
// Despacho de productos - módulo crítico para facturación
// ============================================================

interface ExpedicionFormState {
  // Form fields
  clienteId: string
  destino: string
  transporte: string
  patente: string
  chofer: string
  temperatura: string
  observaciones: string
  mediasSeleccionadas: string[]

  // UI state
  activeTab: string
  expedicionSeleccionada: any | null

  // Server data
  expediciones: any[]
  mediasDisponibles: any[]
  clientes: any[]

  isDirty: boolean
}

interface ExpedicionActions {
  set: <K extends keyof ExpedicionFormState>(key: K, value: ExpedicionFormState[K]) => void
  setMulti: (updates: Partial<ExpedicionFormState>) => void
  resetForm: () => void
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: ExpedicionFormState = {
  clienteId: '',
  destino: '',
  transporte: '',
  patente: '',
  chofer: '',
  temperatura: '',
  observaciones: '',
  mediasSeleccionadas: [],
  activeTab: 'nueva',
  expedicionSeleccionada: null,
  expediciones: [],
  mediasDisponibles: [],
  clientes: [],
  isDirty: false,
}

export const useExpedicionStore = create<ExpedicionFormState & ExpedicionActions>()(
  persist(
    (set) => ({
      ...initialFormState,
      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),
      resetForm: () => set({ clienteId: '', destino: '', transporte: '', patente: '', chofer: '', temperatura: '', observaciones: '', mediasSeleccionadas: [], isDirty: false }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-expedicion',
      partialize: (state) => ({
        clienteId: state.clienteId,
        destino: state.destino,
        transporte: state.transporte,
        patente: state.patente,
        chofer: state.chofer,
        temperatura: state.temperatura,
        observaciones: state.observaciones,
        mediasSeleccionadas: state.mediasSeleccionadas,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
