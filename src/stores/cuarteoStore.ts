/**
 * CUARTEO STORE - Capa 1: Zustand + Persist
 * Protege los datos de cuarteo de medias.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CuarteoItem {
  id: string
  mediaId: string
  garron: number
  lado: string
  tropaCodigo: string
  tipoCuarteo: string
  pesoOriginal: number
  pesoCuarteo1: number
  pesoCuarteo2: number
  observaciones: string
}

interface CuarteoFormState {
  camaraId: string
  camaraNombre: string
  operadorId: string
  
  // Medias a cuartear
  items: CuarteoItem[]
  totalItems: number
  totalKg: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface CuarteoStore extends CuarteoFormState {
  setCamaraId: (v: string) => void
  setCamaraNombre: (v: string) => void
  setOperadorId: (v: string) => void
  setItems: (v: CuarteoItem[]) => void
  addItem: (item: CuarteoItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<CuarteoItem>) => void
  setSaveStatus: (v: CuarteoFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: CuarteoFormState = {
  camaraId: '',
  camaraNombre: '',
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

export const useCuarteoStore = create<CuarteoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCamaraId: (v) => set({ camaraId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraNombre: (v) => set({ camaraNombre: v, isDirty: true, saveStatus: 'dirty' }),
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
      updateItem: (id, updates) => {
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, ...updates } : i), isDirty: true, saveStatus: 'dirty' }))
        get().recalcTotals()
      },

      recalcTotals: () => {
        const { items } = get()
        set({
          totalItems: items.length,
          totalKg: items.reduce((acc, i) => acc + i.pesoOriginal, 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-cuarteo-form',
      partialize: (state) => ({
        camaraId: state.camaraId,
        camaraNombre: state.camaraNombre,
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

export default useCuarteoStore
