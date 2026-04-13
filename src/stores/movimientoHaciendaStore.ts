/**
 * MOVIMIENTO HACIENDA STORE - Capa 1: Zustand + Persist
 * Protege los datos de movimiento de animales entre corrales.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MovimientoHaciendaFormState {
  corralOrigenId: string
  corralOrigenNombre: string
  corralDestinoId: string
  corralDestinoNombre: string
  tropaId: string
  tropaCodigo: string
  cantidad: number
  observaciones: string
  operadorId: string
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface MovimientoHaciendaStore extends MovimientoHaciendaFormState {
  setCorralOrigenId: (v: string) => void
  setCorralOrigenNombre: (v: string) => void
  setCorralDestinoId: (v: string) => void
  setCorralDestinoNombre: (v: string) => void
  setTropaId: (v: string) => void
  setTropaCodigo: (v: string) => void
  setCantidad: (v: number) => void
  setObservaciones: (v: string) => void
  setOperadorId: (v: string) => void
  setSaveStatus: (v: MovimientoHaciendaFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: MovimientoHaciendaFormState = {
  corralOrigenId: '',
  corralOrigenNombre: '',
  corralDestinoId: '',
  corralDestinoNombre: '',
  tropaId: '',
  tropaCodigo: '',
  cantidad: 0,
  observaciones: '',
  operadorId: '',
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useMovimientoHaciendaStore = create<MovimientoHaciendaStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCorralOrigenId: (v) => set({ corralOrigenId: v, isDirty: true, saveStatus: 'dirty' }),
      setCorralOrigenNombre: (v) => set({ corralOrigenNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setCorralDestinoId: (v) => set({ corralDestinoId: v, isDirty: true, saveStatus: 'dirty' }),
      setCorralDestinoNombre: (v) => set({ corralDestinoNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaId: (v) => set({ tropaId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaCodigo: (v) => set({ tropaCodigo: v, isDirty: true, saveStatus: 'dirty' }),
      setCantidad: (v) => set({ cantidad: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),
      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-movimiento-hacienda-form',
      partialize: (state) => ({
        corralOrigenId: state.corralOrigenId,
        corralOrigenNombre: state.corralOrigenNombre,
        corralDestinoId: state.corralDestinoId,
        corralDestinoNombre: state.corralDestinoNombre,
        tropaId: state.tropaId,
        tropaCodigo: state.tropaCodigo,
        cantidad: state.cantidad,
        observaciones: state.observaciones,
        operadorId: state.operadorId,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useMovimientoHaciendaStore
