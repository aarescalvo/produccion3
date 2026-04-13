/**
 * MOVIMIENTO CAMARA STORE - Capa 1: Zustand + Persist
 * Protege los datos de movimiento de medias entre cámaras.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MovimientoMediaItem {
  mediaId: string
  garron: number
  lado: string
  tropaCodigo: string
  peso: number
  sigla: string
}

interface MovimientoCamaraFormState {
  camaraOrigenId: string
  camaraOrigenNombre: string
  camaraDestinoId: string
  camaraDestinoNombre: string
  operadorId: string
  observaciones: string
  
  // Medias a mover
  mediasSeleccionadas: MovimientoMediaItem[]
  
  // Totales
  totalMedias: number
  totalKg: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface MovimientoCamaraStore extends MovimientoCamaraFormState {
  setCamaraOrigenId: (v: string) => void
  setCamaraOrigenNombre: (v: string) => void
  setCamaraDestinoId: (v: string) => void
  setCamaraDestinoNombre: (v: string) => void
  setOperadorId: (v: string) => void
  setObservaciones: (v: string) => void
  setMediasSeleccionadas: (v: MovimientoMediaItem[]) => void
  addMedia: (media: MovimientoMediaItem) => void
  removeMedia: (mediaId: string) => void
  setSaveStatus: (v: MovimientoCamaraFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: MovimientoCamaraFormState = {
  camaraOrigenId: '',
  camaraOrigenNombre: '',
  camaraDestinoId: '',
  camaraDestinoNombre: '',
  operadorId: '',
  observaciones: '',
  mediasSeleccionadas: [],
  totalMedias: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useMovimientoCamaraStore = create<MovimientoCamaraStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCamaraOrigenId: (v) => set({ camaraOrigenId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraOrigenNombre: (v) => set({ camaraOrigenNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraDestinoId: (v) => set({ camaraDestinoId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraDestinoNombre: (v) => set({ camaraDestinoNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setMediasSeleccionadas: (v) => set({ mediasSeleccionadas: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      addMedia: (media) => {
        set(state => ({
          mediasSeleccionadas: [...state.mediasSeleccionadas, media],
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      removeMedia: (mediaId) => {
        set(state => ({
          mediasSeleccionadas: state.mediasSeleccionadas.filter(m => m.mediaId !== mediaId),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      recalcTotals: () => {
        const { mediasSeleccionadas } = get()
        set({
          totalMedias: mediasSeleccionadas.length,
          totalKg: mediasSeleccionadas.reduce((acc, m) => acc + m.peso, 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-movimiento-camara-form',
      partialize: (state) => ({
        camaraOrigenId: state.camaraOrigenId,
        camaraOrigenNombre: state.camaraOrigenNombre,
        camaraDestinoId: state.camaraDestinoId,
        camaraDestinoNombre: state.camaraDestinoNombre,
        operadorId: state.operadorId,
        observaciones: state.observaciones,
        mediasSeleccionadas: state.mediasSeleccionadas,
        totalMedias: state.totalMedias,
        totalKg: state.totalKg,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useMovimientoCamaraStore
