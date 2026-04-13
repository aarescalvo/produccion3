/**
 * INGRESO DESPOSTADA STORE - Capa 1: Zustand + Persist
 * Protege los datos de ingreso de medias a despostada.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IngresoDespostadaItem {
  id: string
  mediaId: string
  garron: number
  lado: string
  tropaCodigo: string
  peso: number
  tipoMedia: string
}

interface IngresoDespostadaFormState {
  camaraOrigenId: string
  camaraOrigenNombre: string
  camaraDestinoId: string
  camaraDestinoNombre: string
  operadorId: string
  
  items: IngresoDespostadaItem[]
  totalItems: number
  totalKg: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface IngresoDespostadaStore extends IngresoDespostadaFormState {
  setCamaraOrigenId: (v: string) => void
  setCamaraOrigenNombre: (v: string) => void
  setCamaraDestinoId: (v: string) => void
  setCamaraDestinoNombre: (v: string) => void
  setOperadorId: (v: string) => void
  setItems: (v: IngresoDespostadaItem[]) => void
  addItem: (item: IngresoDespostadaItem) => void
  removeItem: (id: string) => void
  setSaveStatus: (v: IngresoDespostadaFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: IngresoDespostadaFormState = {
  camaraOrigenId: '',
  camaraOrigenNombre: '',
  camaraDestinoId: '',
  camaraDestinoNombre: '',
  operadorId: '',
  items: [],
  totalItems: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useIngresoDespostadaStore = create<IngresoDespostadaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCamaraOrigenId: (v) => set({ camaraOrigenId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraOrigenNombre: (v) => set({ camaraOrigenNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraDestinoId: (v) => set({ camaraDestinoId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraDestinoNombre: (v) => set({ camaraDestinoNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setItems: (v) => set({ items: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      addItem: (item) => {
        set(state => ({ items: [...state.items, item], isDirty: true, saveStatus: 'dirty' }))
        get().recalcTotals()
      },
      removeItem: (id) => {
        set(state => ({ items: state.items.filter(i => i.id !== id), isDirty: true, saveStatus: 'dirty' }))
        get().recalcTotals()
      },

      recalcTotals: () => {
        const { items } = get()
        set({ totalItems: items.length, totalKg: items.reduce((acc, i) => acc + i.peso, 0) })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-ingreso-despostada-form',
      partialize: (state) => ({
        camaraOrigenId: state.camaraOrigenId,
        camaraOrigenNombre: state.camaraOrigenNombre,
        camaraDestinoId: state.camaraDestinoId,
        camaraDestinoNombre: state.camaraDestinoNombre,
        operadorId: state.operadorId,
        items: state.items,
        totalItems: state.totalItems,
        totalKg: state.totalKg,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useIngresoDespostadaStore
