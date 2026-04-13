'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// PESAJE INDIVIDUAL STORE - Capa 1
// ============================================================

export interface Tropa {
  id: string
  numero: number
  codigo: string
  especie: string
  estado: string
  corralId?: string
  corral?: { id: string; nombre: string }
  tiposAnimales?: { tipoAnimal: string; cantidad: number }[]
  cantidadCabezas: number
  [key: string]: unknown
}

export interface Animal {
  id: string
  numero: number
  codigo: string
  tipoAnimal: string
  caravana?: string
  raza?: string
  pesoVivo?: number
  observaciones?: string
  estado: string
  [key: string]: unknown
}

export interface Corral {
  id: string
  nombre: string
  [key: string]: unknown
}

interface TipoAnimalConfig {
  tipoAnimal: string
  cantidad: number
}

interface PesajeIndividualFormState {
  // Form fields
  caravana: string
  tipoAnimalSeleccionado: string
  raza: string
  pesoActual: string
  observacionesAnimal: string
  corralDestinoId: string

  // Session state
  tropaSeleccionada: Tropa | null
  animales: Animal[]
  animalActual: number
  tiposConfirmados: TipoAnimalConfig[]

  // UI state
  activeTab: string

  // Edit dialog
  editDialogOpen: boolean
  editingAnimal: Animal | null
  editCaravana: string
  editTipoAnimal: string
  editRaza: string
  editPeso: string

  // Confirmar tipos dialog
  confirmarTiposOpen: boolean

  // Rotulo preview
  showRotuloPreview: boolean
  rotuloPreviewData: Animal | null

  // Server data (cached)
  tropas: Tropa[]
  corrales: Corral[]
}

interface PesajeIndividualActions {
  set: <K extends keyof PesajeIndividualFormState>(
    key: K,
    value: PesajeIndividualFormState[K]
  ) => void
  setMulti: (updates: Partial<PesajeIndividualFormState>) => void
  resetFormFields: () => void
  resetSession: () => void
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: PesajeIndividualFormState = {
  caravana: '',
  tipoAnimalSeleccionado: '',
  raza: '',
  pesoActual: '',
  observacionesAnimal: '',
  corralDestinoId: '',
  tropaSeleccionada: null,
  animales: [],
  animalActual: 0,
  tiposConfirmados: [],
  activeTab: 'solicitar',
  editDialogOpen: false,
  editingAnimal: null,
  editCaravana: '',
  editTipoAnimal: '',
  editRaza: '',
  editPeso: '',
  confirmarTiposOpen: false,
  showRotuloPreview: false,
  rotuloPreviewData: null,
  tropas: [],
  corrales: [],
}

export const usePesajeIndividualStore = create<
  PesajeIndividualFormState & PesajeIndividualActions
>()(
  persist(
    (set) => ({
      ...initialFormState,

      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),

      resetFormFields: () =>
        set({
          caravana: '',
          tipoAnimalSeleccionado: '',
          raza: '',
          pesoActual: '',
          observacionesAnimal: '',
          isDirty: false,
        }),

      resetSession: () =>
        set({
          tropaSeleccionada: null,
          animales: [],
          animalActual: 0,
          tiposConfirmados: [],
          activeTab: 'solicitar',
          caravana: '',
          tipoAnimalSeleccionado: '',
          raza: '',
          pesoActual: '',
          observacionesAnimal: '',
          corralDestinoId: '',
          isDirty: false,
        }),

      isDirty: false,
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-pesaje-individual',
      partialize: (state) => ({
        // Persist form + session state (the most valuable data to recover)
        caravana: state.caravana,
        tipoAnimalSeleccionado: state.tipoAnimalSeleccionado,
        raza: state.raza,
        pesoActual: state.pesoActual,
        observacionesAnimal: state.observacionesAnimal,
        corralDestinoId: state.corralDestinoId,
        tropaSeleccionada: state.tropaSeleccionada,
        animales: state.animales,
        animalActual: state.animalActual,
        tiposConfirmados: state.tiposConfirmados,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
