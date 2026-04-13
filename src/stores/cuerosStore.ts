/**
 * CUEROS STORE - Capa 1: Zustand + Persist
 * Protege los datos de registro de cueros.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CueroItem {
  id: string
  tropaCodigo: string
  conservacion: string
  tipoDestino: string
  cantidad: number
  pesoKg: number
  observaciones: string
}

interface CuerosFormState {
  operadorId: string
  
  items: CueroItem[]
  totalItems: number
  totalKg: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface CuerosStore extends CuerosFormState {
  setOperadorId: (v: string) => void
  setItems: (v: CueroItem[]) => void
  addItem: (item: CueroItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<CueroItem>) => void
  setSaveStatus: (v: CuerosFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: CuerosFormState = {
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

export const useCuerosStore = create<CuerosStore>()(
  persist(
    (set, get) => ({
      ...initialState,

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
        set({ totalItems: items.reduce((acc, i) => acc + i.cantidad, 0), totalKg: items.reduce((acc, i) => acc + i.pesoKg, 0) })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-cueros-form',
      partialize: (state) => ({
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

export default useCuerosStore
