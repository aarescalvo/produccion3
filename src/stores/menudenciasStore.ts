/**
 * MENUDENCIAS STORE - Capa 1: Zustand + Persist
 * Protege los datos de registro de menudencias por tropa.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MenudenciaItem {
  id: string
  tipoMenudenciaId: string
  tipoMenudenciaNombre: string
  cantidad: number
  pesoKg: number
  precioUnitario: number
}

interface MenudenciasFormState {
  tropaId: string
  tropaCodigo: string
  operadorId: string
  
  items: MenudenciaItem[]
  totalItems: number
  totalKg: number
  totalImporte: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface MenudenciasStore extends MenudenciasFormState {
  setTropaId: (v: string) => void
  setTropaCodigo: (v: string) => void
  setOperadorId: (v: string) => void
  setItems: (v: MenudenciaItem[]) => void
  addItem: (item: MenudenciaItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<MenudenciaItem>) => void
  setSaveStatus: (v: MenudenciasFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: MenudenciasFormState = {
  tropaId: '',
  tropaCodigo: '',
  operadorId: '',
  items: [],
  totalItems: 0,
  totalKg: 0,
  totalImporte: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useMenudenciasStore = create<MenudenciasStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTropaId: (v) => set({ tropaId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaCodigo: (v) => set({ tropaCodigo: v, isDirty: true, saveStatus: 'dirty' }),
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
          totalKg: items.reduce((acc, i) => acc + i.pesoKg, 0),
          totalImporte: items.reduce((acc, i) => acc + (i.pesoKg * i.precioUnitario), 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-menudencias-form',
      partialize: (state) => ({
        tropaId: state.tropaId,
        tropaCodigo: state.tropaCodigo,
        operadorId: state.operadorId,
        items: state.items,
        totalItems: state.totalItems,
        totalKg: state.totalKg,
        totalImporte: state.totalImporte,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useMenudenciasStore
