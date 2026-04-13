/**
 * EXPEDICION STORE - Capa 1: Zustand + Persist
 * Protege los datos de expedición/despacho de mercadería.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExpedicionItem {
  mediaId: string
  garron: number
  lado: string
  tropaCodigo: string
  peso: number
  sigla: string
}

interface ExpedicionFormState {
  // Datos de la expedición
  clienteId: string
  clienteNombre: string
  transportistaId: string
  patente: string
  chofer: string
  dniChofer: string
  destino: string
  remito: string
  observaciones: string
  operadorId: string
  
  // Medias seleccionadas para despachar
  mediasSeleccionadas: ExpedicionItem[]
  
  // Totales
  totalMedias: number
  totalKg: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  
  // Borrador (Capa 2)
  expedicionId: string | null
  draftId: string | null
  isDraft: boolean
}

interface ExpedicionStore extends ExpedicionFormState {
  setClienteId: (v: string) => void
  setClienteNombre: (v: string) => void
  setTransportistaId: (v: string) => void
  setPatente: (v: string) => void
  setChofer: (v: string) => void
  setDniChofer: (v: string) => void
  setDestino: (v: string) => void
  setRemito: (v: string) => void
  setObservaciones: (v: string) => void
  setOperadorId: (v: string) => void
  setMediasSeleccionadas: (v: ExpedicionItem[]) => void
  addMedia: (media: ExpedicionItem) => void
  removeMedia: (mediaId: string) => void
  setSaveStatus: (v: ExpedicionFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  setExpedicionId: (v: string | null) => void
  
  recalcTotals: () => void
  
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: ExpedicionFormState = {
  clienteId: '',
  clienteNombre: '',
  transportistaId: '',
  patente: '',
  chofer: '',
  dniChofer: '',
  destino: '',
  remito: '',
  observaciones: '',
  operadorId: '',
  mediasSeleccionadas: [],
  totalMedias: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  expedicionId: null,
  draftId: null,
  isDraft: false,
}

export const useExpedicionStore = create<ExpedicionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setClienteId: (v) => set({ clienteId: v, isDirty: true, saveStatus: 'dirty' }),
      setClienteNombre: (v) => set({ clienteNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setTransportistaId: (v) => set({ transportistaId: v, isDirty: true, saveStatus: 'dirty' }),
      setPatente: (v) => set({ patente: v, isDirty: true, saveStatus: 'dirty' }),
      setChofer: (v) => set({ chofer: v, isDirty: true, saveStatus: 'dirty' }),
      setDniChofer: (v) => set({ dniChofer: v, isDirty: true, saveStatus: 'dirty' }),
      setDestino: (v) => set({ destino: v, isDirty: true, saveStatus: 'dirty' }),
      setRemito: (v) => set({ remito: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setMediasSeleccionadas: (v) => set({ mediasSeleccionadas: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),
      setExpedicionId: (v) => set({ expedicionId: v }),

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
      name: 'solemar-expedicion-form',
      partialize: (state) => ({
        clienteId: state.clienteId,
        clienteNombre: state.clienteNombre,
        transportistaId: state.transportistaId,
        patente: state.patente,
        chofer: state.chofer,
        dniChofer: state.dniChofer,
        destino: state.destino,
        remito: state.remito,
        observaciones: state.observaciones,
        operadorId: state.operadorId,
        mediasSeleccionadas: state.mediasSeleccionadas,
        totalMedias: state.totalMedias,
        totalKg: state.totalKg,
        expedicionId: state.expedicionId,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useExpedicionStore
