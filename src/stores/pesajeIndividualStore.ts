/**
 * PESAJE INDIVIDUAL STORE - Capa 1: Zustand + Persist
 * 
 * Protege los datos de pesaje individual de cada animal.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PesajeIndividualItem {
  id: string
  animalId: string
  codigo: string
  tropaCodigo: string
  peso: number
  fecha: number
  operadorId: string
  sincronizado: boolean
}

interface PesajeIndividualFormState {
  // Datos del pesaje
  tropaId: string
  tropaCodigo: string
  operadorId: string
  balanzaId: string
  
  // Pesajes realizados (sin sincronizar)
  pesajes: PesajeIndividualItem[]
  
  // Pesaje actual
  animalId: string
  animalCodigo: string
  pesoActual: number
  
  // Totales
  totalPesajes: number
  totalKg: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  
  // Borrador (Capa 2)
  draftId: string | null
  isDraft: boolean
}

interface PesajeIndividualStore extends PesajeIndividualFormState {
  setTropaId: (v: string) => void
  setTropaCodigo: (v: string) => void
  setOperadorId: (v: string) => void
  setBalanzaId: (v: string) => void
  setAnimalId: (v: string) => void
  setAnimalCodigo: (v: string) => void
  setPesoActual: (v: number) => void
  setPesajes: (v: PesajeIndividualItem[]) => void
  addPesaje: (pesaje: PesajeIndividualItem) => void
  removePesaje: (id: string) => void
  markPesajeSincronizado: (id: string) => void
  setSaveStatus: (v: PesajeIndividualFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  
  recalcTotals: () => void
  
  resetForm: () => void
  resetCurrentPesaje: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: PesajeIndividualFormState = {
  tropaId: '',
  tropaCodigo: '',
  operadorId: '',
  balanzaId: '',
  pesajes: [],
  animalId: '',
  animalCodigo: '',
  pesoActual: 0,
  totalPesajes: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const usePesajeIndividualStore = create<PesajeIndividualStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTropaId: (v) => set({ tropaId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaCodigo: (v) => set({ tropaCodigo: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setBalanzaId: (v) => set({ balanzaId: v, isDirty: true, saveStatus: 'dirty' }),
      setAnimalId: (v) => set({ animalId: v, isDirty: true, saveStatus: 'dirty' }),
      setAnimalCodigo: (v) => set({ animalCodigo: v, isDirty: true, saveStatus: 'dirty' }),
      setPesoActual: (v) => set({ pesoActual: v, isDirty: true, saveStatus: 'dirty' }),
      setPesajes: (v) => set({ pesajes: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      addPesaje: (pesaje) => {
        set(state => ({
          pesajes: [...state.pesajes, pesaje],
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      removePesaje: (id) => {
        set(state => ({
          pesajes: state.pesajes.filter(p => p.id !== id),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      markPesajeSincronizado: (id) => {
        set(state => ({
          pesajes: state.pesajes.map(p =>
            p.id === id ? { ...p, sincronizado: true } : p
          ),
        }))
      },

      recalcTotals: () => {
        const { pesajes } = get()
        set({
          totalPesajes: pesajes.length,
          totalKg: pesajes.reduce((acc, p) => acc + p.peso, 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      resetCurrentPesaje: () => set({ animalId: '', animalCodigo: '', pesoActual: 0 }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-pesaje-individual-form',
      partialize: (state) => ({
        tropaId: state.tropaId,
        tropaCodigo: state.tropaCodigo,
        operadorId: state.operadorId,
        balanzaId: state.balanzaId,
        pesajes: state.pesajes,
        totalPesajes: state.totalPesajes,
        totalKg: state.totalKg,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default usePesajeIndividualStore
