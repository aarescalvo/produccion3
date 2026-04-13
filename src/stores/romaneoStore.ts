/**
 * ROMANEO STORE - Capa 1: Zustand + Persist
 * 
 * El romaneo es la operación más crítica del frigorífico.
 * Cada media pesada se guarda en localStorage para proteger
 * contra cualquier pérdida de datos.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MediaPesada {
  id: string
  garron: number
  lado: string
  peso: number
  siglas: string[]
  fecha: number  // timestamp
  tropaCodigo: string | null
  tipoAnimal: string | null
  decomisada?: boolean
  kgDecomiso?: number
  kgRestantes?: number
}

export interface AsignacionGarron {
  garron: number
  animalId: string | null
  animalCodigo: string | null
  tropaCodigo: string | null
  tipoAnimal: string | null
  pesoVivo: number | null
  tieneMediaDer: boolean
  tieneMediaIzq: boolean
}

interface RomaneoFormState {
  // Datos del romaneo
  tropaId: string
  tropaCodigo: string
  camaraId: string
  tipificadorId: string
  operadorId: string
  
  // Estado actual
  mediasPesadas: MediaPesada[]
  asignaciones: AsignacionGarron[]
  garronActual: number
  
  // Totales
  totalMedias: number
  totalKg: number
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  
  // Borrador (Capa 2)
  romaneoId: string | null
  draftId: string | null
  isDraft: boolean
  
  // UI
  confirmDialogOpen: boolean
  confirmAction: string | null
}

interface RomaneoStore extends RomaneoFormState {
  // Setters
  setTropaId: (v: string) => void
  setTropaCodigo: (v: string) => void
  setCamaraId: (v: string) => void
  setTipificadorId: (v: string) => void
  setOperadorId: (v: string) => void
  setGarronActual: (v: number) => void
  setMediasPesadas: (v: MediaPesada[]) => void
  setAsignaciones: (v: AsignacionGarron[]) => void
  addMediaPesada: (media: MediaPesada) => void
  removeMediaPesada: (id: string) => void
  updateMediaPesada: (id: string, updates: Partial<MediaPesada>) => void
  setSaveStatus: (v: RomaneoFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  setRomaneoId: (v: string | null) => void
  setConfirmDialogOpen: (v: boolean) => void
  setConfirmAction: (v: string | null) => void
  
  // Computed
  recalcTotals: () => void
  
  // Actions
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: RomaneoFormState = {
  tropaId: '',
  tropaCodigo: '',
  camaraId: '',
  tipificadorId: '',
  operadorId: '',
  mediasPesadas: [],
  asignaciones: [],
  garronActual: 1,
  totalMedias: 0,
  totalKg: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  romaneoId: null,
  draftId: null,
  isDraft: false,
  confirmDialogOpen: false,
  confirmAction: null,
}

export const useRomaneoStore = create<RomaneoStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTropaId: (v) => set({ tropaId: v, isDirty: true, saveStatus: 'dirty' }),
      setTropaCodigo: (v) => set({ tropaCodigo: v, isDirty: true, saveStatus: 'dirty' }),
      setCamaraId: (v) => set({ camaraId: v, isDirty: true, saveStatus: 'dirty' }),
      setTipificadorId: (v) => set({ tipificadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setOperadorId: (v) => set({ operadorId: v, isDirty: true, saveStatus: 'dirty' }),
      setGarronActual: (v) => set({ garronActual: v, isDirty: true, saveStatus: 'dirty' }),
      setMediasPesadas: (v) => set({ mediasPesadas: v, isDirty: true, saveStatus: 'dirty' }),
      setAsignaciones: (v) => set({ asignaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),
      setRomaneoId: (v) => set({ romaneoId: v }),
      setConfirmDialogOpen: (v) => set({ confirmDialogOpen: v }),
      setConfirmAction: (v) => set({ confirmAction: v }),

      addMediaPesada: (media) => {
        set(state => ({
          mediasPesadas: [...state.mediasPesadas, media],
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      removeMediaPesada: (id) => {
        set(state => ({
          mediasPesadas: state.mediasPesadas.filter(m => m.id !== id),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      updateMediaPesada: (id, updates) => {
        set(state => ({
          mediasPesadas: state.mediasPesadas.map(m =>
            m.id === id ? { ...m, ...updates } : m
          ),
          isDirty: true,
          saveStatus: 'dirty',
        }))
        get().recalcTotals()
      },

      recalcTotals: () => {
        const { mediasPesadas } = get()
        const noDecomisadas = mediasPesadas.filter(m => !m.decomisada)
        set({
          totalMedias: noDecomisadas.length,
          totalKg: noDecomisadas.reduce((acc, m) => acc + (m.kgRestantes ?? m.peso), 0),
        })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-romaneo-form',
      partialize: (state) => ({
        tropaId: state.tropaId,
        tropaCodigo: state.tropaCodigo,
        camaraId: state.camaraId,
        tipificadorId: state.tipificadorId,
        operadorId: state.operadorId,
        mediasPesadas: state.mediasPesadas,
        asignaciones: state.asignaciones,
        garronActual: state.garronActual,
        totalMedias: state.totalMedias,
        totalKg: state.totalKg,
        romaneoId: state.romaneoId,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useRomaneoStore
