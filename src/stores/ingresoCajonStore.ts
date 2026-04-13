/**
 * INGRESO CAJON STORE - Capa 1: Zustand + Persist
 * Protege los datos de ingreso de cajones (menudencias) a cámara.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IngresoCajonItem {
  id: string
  tipoMenudenciaId: string
  tipoMenudenciaNombre: string
  cantidad: number
  pesoKg: number
  tropaCodigo: string
  observaciones: string
}

interface IngresoCajonFormState {
  tropaId: string
  tropaCodigo: string
  camaraId: string
  camaraNombre: string
  operadorId: string
  
  // Cajones
  cajones: IngresoCajonItem[]
  totalCajones: number
  totalKg: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface IngresoCajonStore extends IngresoCajonFormState {
  setTropaId: (v: string) => void
  setTropaCodigo: (v: string) => void
  setCamaraId: (v: string) => void
  setCamaraNombre: (v: string) => void
  setOperadorId: (v: string) => void
  setCajones: (v: IngresoCajonItem[]) => void
  addCajon: (cajon: IngresoCajonItem) => void
  removeCajon: (id: string) => void
  updateCajon: (id: string, updates: Partial<IngresoCajonItem>) => void
  setSaveStatus: (v: IngresoCajonFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: IngresoCajonFormState = {
  tropaId: '',
  tropaCodigo: '',
  camaraId: '',
  camaraNombre: '',
  operadorId: '',
  cajones: [],
  totalCajones: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useIngresoCajonStore = create<IngresoCajonStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTropaId: (v) => set({ tropaId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaCodigo: (v) => set({ tropaCodigo: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraId: (v) => set({ camaraId: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraNombre: (v) => set({ camaraNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setCajones: (v) => set({ cajones: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      addCajon: (cajon) => {
        set(state => ({
          cajones: [...state.cajones, cajon],
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      removeCajon: (id) => {
        set(state => ({
          cajones: state.cajones.filter(c => c.id !== id),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      updateCajon: (id, updates) => {
        set(state => ({
          cajones: state.cajones.map(c => c.id === id ? { ...c, ...updates } : c),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      recalcTotals: () => {
        const { cajones } = get()
        set({
          totalCajones: cajones.reduce((acc, c) => acc + c.cantidad, 0),
          totalKg: cajones.reduce((acc, c) => acc + c.pesoKg, 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-ingreso-cajon-form',
      partialize: (state) => ({
        tropaId: state.tropaId,
        tropaCodigo: state.tropaCodigo,
        camaraId: state.camaraId,
        camaraNombre: state.camaraNombre,
        operadorId: state.operadorId,
        cajones: state.cajones,
        totalCajones: state.totalCajones,
        totalKg: state.totalKg,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useIngresoCajonStore
