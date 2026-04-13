/**
 * RENDERING STORE - Capa 1: Zustand + Persist
 * Protege los datos de registro de rendering (subproductos procesados).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RenderingItem {
  id: string
  tipoRendering: string
  cantidad: number
  pesoKg: number
  observaciones: string
}

interface RenderingFormState {
  operadorId: string
  
  items: RenderingItem[]
  totalItems: number
  totalKg: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface RenderingStore extends RenderingFormState {
  setOperadorId: (v: string) => void
  setItems: (v: RenderingItem[]) => void
  addItem: (item: RenderingItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<RenderingItem>) => void
  setSaveStatus: (v: RenderingFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: RenderingFormState = {
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

export const useRenderingStore = create<RenderingStore>()(
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
        set({ totalItems: items.length, totalKg: items.reduce((acc, i) => acc + i.pesoKg, 0) })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-rendering-form',
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

export default useRenderingStore
