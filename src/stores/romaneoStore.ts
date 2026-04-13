'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// ROMANEO STORE - Capa 1
// El módulo más crítico: pesaje de medias reses
// ============================================================

export interface TropaRomaneo {
  id: string
  numero: number
  codigo: string
  especie: string
  estado: string
  cantidadCabezas: number
  [key: string]: unknown
}

export interface MediaResRomaneo {
  id: string
  lado: 'IZQUIERDA' | 'DERECHA'
  peso: number
  sigla: string
  barcode?: string
  camaraId?: string
  estado: string
  [key: string]: unknown
}

export interface RomaneoSession {
  tropaId: string
  tropaCodigo: string
  animalIndex: number
  mediasRegistradas: number
  ultimaMedia: MediaResRomaneo | null
}

interface RomaneoFormState {
  // Current session
  session: RomaneoSession | null

  // Form fields
  pesoMedia: string
  ladoSeleccionado: 'IZQUIERDA' | 'DERECHA'
  siglaSeleccionada: string
  camaraSeleccionada: string
  denticionSeleccionada: string
  tipificadorId: string

  // UI state
  activeTab: string
  tropaSeleccionada: TropaRomaneo | null

  // Server data
  tropas: TropaRomaneo[]
  camaras: { id: string; nombre: string; tipo: string }[]
  tipificadores: { id: string; nombre: string; matricula: string }[]

  // VB Romaneo
  vbRomaneoFilter: string
}

interface RomaneoActions {
  set: <K extends keyof RomaneoFormState>(
    key: K,
    value: RomaneoFormState[K]
  ) => void
  setMulti: (updates: Partial<RomaneoFormState>) => void
  resetForm: () => void
  resetSession: () => void
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: RomaneoFormState = {
  session: null,
  pesoMedia: '',
  ladoSeleccionado: 'IZQUIERDA',
  siglaSeleccionada: '',
  camaraSeleccionada: '',
  denticionSeleccionada: '',
  tipificadorId: '',
  activeTab: 'seleccionar',
  tropaSeleccionada: null,
  tropas: [],
  camaras: [],
  tipificadores: [],
  vbRomaneoFilter: '',
}

export const useRomaneoStore = create<RomaneoFormState & RomaneoActions>()(
  persist(
    (set) => ({
      ...initialFormState,

      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),

      resetForm: () =>
        set({
          pesoMedia: '',
          ladoSeleccionado: 'IZQUIERDA',
          siglaSeleccionada: '',
          denticionSeleccionada: '',
          isDirty: false,
        }),

      resetSession: () =>
        set({
          session: null,
          pesoMedia: '',
          ladoSeleccionado: 'IZQUIERDA',
          siglaSeleccionada: '',
          camaraSeleccionada: '',
          denticionSeleccionada: '',
          tipificadorId: '',
          tropaSeleccionada: null,
          isDirty: false,
        }),

      isDirty: false,
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-romaneo',
      partialize: (state) => ({
        session: state.session,
        pesoMedia: state.pesoMedia,
        ladoSeleccionado: state.ladoSeleccionado,
        siglaSeleccionada: state.siglaSeleccionada,
        camaraSeleccionada: state.camaraSeleccionada,
        denticionSeleccionada: state.denticionSeleccionada,
        tipificadorId: state.tipificadorId,
        activeTab: state.activeTab,
        tropaSeleccionada: state.tropaSeleccionada,
        isDirty: state.isDirty,
      }),
    }
  )
)
