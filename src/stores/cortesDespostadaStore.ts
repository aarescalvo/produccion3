/**
 * CORTES DESPOSTADA STORE - Capa 1: Zustand + Persist
 * Protege los datos de cortes/desposte de medias.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CorteDespostadaItem {
  id: string
  tipoCorteId: string
  tipoCorteNombre: string
  pesoKg: number
  tropaCodigo: string
  destinoCamaraId: string
  observaciones: string
}

interface CortesDespostadaFormState {
  loteDespostadaId: string
  operadorId: string
  
  items: CorteDespostadaItem[]
  totalItems: number
  totalKg: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface CortesDespostadaStore extends CortesDespostadaFormState {
  setLoteDespostadaId: (v: string) => void
  setOperadorId: (v: string) => void
  setItems: (v: CorteDespostadaItem[]) => void
  addItem: (item: CorteDespostadaItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<CorteDespostadaItem>) => void
  setSaveStatus: (v: CortesDespostadaFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: CortesDespostadaFormState = {
  loteDespostadaId: '',
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

export const useCortesDespostadaStore = create<CortesDespostadaStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLoteDespostadaId: (v) => set({ loteDespostadaId: v, isDirty: true, saveStatus: 'dirty' }),
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
      name: 'solemar-cortes-despostada-form',
      partialize: (state) => ({
        loteDespostadaId: state.loteDespostadaId,
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

export default useCortesDespostadaStore
