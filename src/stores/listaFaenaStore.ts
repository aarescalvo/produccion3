/**
 * LISTA FAENA STORE - Capa 1: Zustand + Persist
 * 
 * Protege la selección de tropas y cantidades para la lista de faena.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TropaEnLista {
  tropaId: string
  tropaCodigo: string
  especie: string
  cantidadSeleccionada: number
  cantidadMaxima: number
  corralId: string | null
  corralNombre: string | null
  usuarioFaenaNombre: string | null
}

interface ListaFaenaFormState {
  // Datos de la lista
  listaId: string | null
  numero: number
  fecha: string
  observaciones: string
  supervisorId: string
  
  // Tropas seleccionadas
  tropasSeleccionadas: TropaEnLista[]
  cantidadTotal: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  
  // Borrador (Capa 2)
  draftId: string | null
  isDraft: boolean
}

interface ListaFaenaStore extends ListaFaenaFormState {
  setListaId: (v: string | null) => void
  setNumero: (v: number) => void
  setFecha: (v: string) => void
  setObservaciones: (v: string) => void
  setSupervisorId: (v: string) => void
  setTropasSeleccionadas: (v: TropaEnLista[]) => void
  addTropa: (tropa: TropaEnLista) => void
  removeTropa: (tropaId: string) => void
  updateTropaCantidad: (tropaId: string, cantidad: number) => void
  setSaveStatus: (v: ListaFaenaFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  
  recalcTotal: () => void
  
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: ListaFaenaFormState = {
  listaId: null,
  numero: 0,
  fecha: new Date().toISOString().split('T')[0],
  observaciones: '',
  supervisorId: '',
  tropasSeleccionadas: [],
  cantidadTotal: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useListaFaenaStore = create<ListaFaenaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setListaId: (v) => set({ listaId: v, isDirty: true, saveStatus: 'dirty' }),
      setNumero: (v) => set({ numero: v, isDirty: true, saveStatus: 'dirty' }),
      setFecha: (v) => set({ fecha: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setSupervisorId: (v) => set({ supervisorId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropasSeleccionadas: (v) => set({ tropasSeleccionadas: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      addTropa: (tropa) => {
        set(state => ({
          tropasSeleccionadas: [...state.tropasSeleccionadas, tropa],
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotal()
      },

      removeTropa: (tropaId) => {
        set(state => ({
          tropasSeleccionadas: state.tropasSeleccionadas.filter(t => t.tropaId !== tropaId),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotal()
      },

      updateTropaCantidad: (tropaId, cantidad) => {
        set(state => ({
          tropasSeleccionadas: state.tropasSeleccionadas.map(t =>
            t.tropaId === tropaId ? { ...t, cantidadSeleccionada: cantidad } : t
          ),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotal()
      },

      recalcTotal: () => {
        const { tropasSeleccionadas } = get()
        set({
          cantidadTotal: tropasSeleccionadas.reduce((acc, t) => acc + t.cantidadSeleccionada, 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-lista-faena-form',
      partialize: (state) => ({
        listaId: state.listaId,
        numero: state.numero,
        fecha: state.fecha,
        observaciones: state.observaciones,
        supervisorId: state.supervisorId,
        tropasSeleccionadas: state.tropasSeleccionadas,
        cantidadTotal: state.cantidadTotal,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useListaFaenaStore
