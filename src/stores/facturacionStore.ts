/**
 * FACTURACION STORE - Capa 1: Zustand + Persist
 * Protege los datos de facturación.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FacturacionItem {
  id: string
  tipoProducto: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  alicuotaIva: number
}

interface FacturacionFormState {
  clienteId: string
  clienteNombre: string
  tipoComprobante: string
  condicionIva: string
  puntoVenta: number
  fecha: string
  observaciones: string
  operadorId: string
  
  items: FacturacionItem[]
  totalItems: number
  subtotal: number
  totalIva: number
  total: number
  
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  draftId: string | null
  isDraft: boolean
}

interface FacturacionStore extends FacturacionFormState {
  setClienteId: (v: string) => void
  setClienteNombre: (v: string) => void
  setTipoComprobante: (v: string) => void
  setCondicionIva: (v: string) => void
  setPuntoVenta: (v: number) => void
  setFecha: (v: string) => void
  setObservaciones: (v: string) => void
  setOperadorId: (v: string) => void
  setItems: (v: FacturacionItem[]) => void
  addItem: (item: FacturacionItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<FacturacionItem>) => void
  setSaveStatus: (v: FacturacionFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  recalcTotals: () => void
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
}

const initialState: FacturacionFormState = {
  clienteId: '',
  clienteNombre: '',
  tipoComprobante: 'FACTURA_A',
  condicionIva: 'RESPONSABLE_INSCRIPTO',
  puntoVenta: 1,
  fecha: new Date().toISOString().split('T')[0],
  observaciones: '',
  operadorId: '',
  items: [],
  totalItems: 0,
  subtotal: 0,
  totalIva: 0,
  total: 0,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const useFacturacionStore = create<FacturacionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setClienteId: (v) => set({ clienteId: v, isDirty: true, saveStatus: 'dirty' }),
      setClienteNombre: (v) => set({ clienteNombre: v, isDirty: true, saveStatus: 'dirty' }),
      setTipoComprobante: (v) => set({ tipoComprobante: v, isDirty: true, saveStatus: 'dirty' }),
      setCondicionIva: (v) => set({ condicionIva: v, isDirty: true, saveStatus: 'dirty' }),
      setPuntoVenta: (v) => set({ puntoVenta: v, isDirty: true, saveStatus: 'dirty' }),
      setFecha: (v) => set({ fecha: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
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
        const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0)
        const totalIva = items.reduce((acc, i) => acc + (i.subtotal * i.alicuotaIva / 100), 0)
        set({ totalItems: items.length, subtotal, totalIva, total: subtotal + totalIva })
      },

      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
    }),
    {
      name: 'solemar-facturacion-form',
      partialize: (state) => ({
        clienteId: state.clienteId,
        clienteNombre: state.clienteNombre,
        tipoComprobante: state.tipoComprobante,
        condicionIva: state.condicionIva,
        puntoVenta: state.puntoVenta,
        fecha: state.fecha,
        observaciones: state.observaciones,
        operadorId: state.operadorId,
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        totalIva: state.totalIva,
        total: state.total,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default useFacturacionStore
