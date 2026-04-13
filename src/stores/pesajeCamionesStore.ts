'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================
// PESAJE CAMIONES STORE - Capa 1: Persiste estado del formulario
// Auto-salva a localStorage para recuperarse de refresh/close
// ============================================================

export interface TipoAnimalCounter {
  tipoAnimal: string
  cantidad: number
}

export interface Pesaje {
  id: string
  numeroTicket: number
  tipo: string
  patenteChasis: string
  patenteAcoplado?: string
  chofer?: string
  dniChofer?: string
  transportistaId?: string
  pesoBruto?: number
  pesoTara?: number
  pesoNeto?: number
  estado: string
  fecha: string
  [key: string]: unknown
}

export interface Cliente {
  id: string
  nombre: string
  esProductor: boolean
  esUsuarioFaena: boolean
  [key: string]: unknown
}

export interface Transportista {
  id: string
  nombre: string
  [key: string]: unknown
}

export interface Corral {
  id: string
  nombre: string
  [key: string]: unknown
}

interface PesajeCamionesFormState {
  // Form fields
  patenteChasis: string
  patenteAcoplado: string
  chofer: string
  dniChofer: string
  transportistaId: string
  dte: string
  guia: string
  productorId: string
  usuarioFaenaId: string
  especie: string
  corralId: string
  pesoBruto: number
  pesoTara: number
  observaciones: string
  destino: string
  remito: string
  descripcion: string
  tiposAnimales: TipoAnimalCounter[]

  // UI state
  tipoPesaje: string
  activeTab: string
  fechaDesde: string
  fechaHasta: string

  // Dialogs
  cerrarOpen: boolean
  editDialogOpen: boolean
  deleteDialogOpen: boolean
  quickAddOpen: 'transportista' | 'productor' | 'usuarioFaena' | null
  supervisorVerificado: boolean

  // Server data (cached)
  clientes: Cliente[]
  transportistas: Transportista[]
  corrales: Corral[]
  pesajesAbiertos: Pesaje[]
  pesajesCerrados: Pesaje[]
  nextTicket: number
  nextTropaCode: { codigo: string; numero: number } | null
}

interface PesajeCamionesActions {
  // Setters for form fields
  set: <K extends keyof PesajeCamionesFormState>(
    key: K,
    value: PesajeCamionesFormState[K]
  ) => void
  setMulti: (updates: Partial<PesajeCamionesFormState>) => void

  // Reset form
  resetForm: () => void

  // Server data setters
  setClientes: (data: Cliente[]) => void
  setTransportistas: (data: Transportista[]) => void
  setCorrales: (data: Corral[]) => void
  setPesajesAbiertos: (data: Pesaje[]) => void
  setPesajesCerrados: (data: Pesaje[]) => void
  setNextTicket: (n: number) => void
  setNextTropaCode: (data: { codigo: string; numero: number } | null) => void

  // Dirty flag
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const initialFormState: PesajeCamionesFormState = {
  patenteChasis: '',
  patenteAcoplado: '',
  chofer: '',
  dniChofer: '',
  transportistaId: '',
  dte: '',
  guia: '',
  productorId: '',
  usuarioFaenaId: '',
  especie: 'BOVINO',
  corralId: '',
  pesoBruto: 0,
  pesoTara: 0,
  observaciones: '',
  destino: '',
  remito: '',
  descripcion: '',
  tiposAnimales: [],
  tipoPesaje: 'INGRESO_HACIENDA',
  activeTab: 'nuevo',
  fechaDesde: '',
  fechaHasta: '',
  cerrarOpen: false,
  editDialogOpen: false,
  deleteDialogOpen: false,
  quickAddOpen: null,
  supervisorVerificado: false,
  clientes: [],
  transportistas: [],
  corrales: [],
  pesajesAbiertos: [],
  pesajesCerrados: [],
  nextTicket: 1,
  nextTropaCode: null,
}

export const usePesajeCamionesStore = create<
  PesajeCamionesFormState & PesajeCamionesActions
>()(
  persist(
    (set) => ({
      ...initialFormState,

      set: (key, value) => set({ [key]: value, isDirty: true }),
      setMulti: (updates) => set({ ...updates, isDirty: true }),

      resetForm: () =>
        set({
          patenteChasis: '',
          patenteAcoplado: '',
          chofer: '',
          dniChofer: '',
          transportistaId: '',
          dte: '',
          guia: '',
          productorId: '',
          usuarioFaenaId: '',
          especie: 'BOVINO',
          corralId: '',
          pesoBruto: 0,
          pesoTara: 0,
          observaciones: '',
          destino: '',
          remito: '',
          descripcion: '',
          tiposAnimales: [],
          isDirty: false,
        }),

      setClientes: (data) => set({ clientes: data }),
      setTransportistas: (data) => set({ transportistas: data }),
      setCorrales: (data) => set({ corrales: data }),
      setPesajesAbiertos: (data) => set({ pesajesAbiertos: data }),
      setPesajesCerrados: (data) => set({ pesajesCerrados: data }),
      setNextTicket: (n) => set({ nextTicket: n }),
      setNextTropaCode: (data) => set({ nextTropaCode: data }),

      isDirty: false,
      setIsDirty: (dirty) => set({ isDirty: dirty }),
    }),
    {
      name: 'solemar-pesaje-camiones',
      partialize: (state) => ({
        // Only persist form fields and UI state, NOT server data
        patenteChasis: state.patenteChasis,
        patenteAcoplado: state.patenteAcoplado,
        chofer: state.chofer,
        dniChofer: state.dniChofer,
        transportistaId: state.transportistaId,
        dte: state.dte,
        guia: state.guia,
        productorId: state.productorId,
        usuarioFaenaId: state.usuarioFaenaId,
        especie: state.especie,
        corralId: state.corralId,
        pesoBruto: state.pesoBruto,
        pesoTara: state.pesoTara,
        observaciones: state.observaciones,
        destino: state.destino,
        remito: state.remito,
        descripcion: state.descripcion,
        tiposAnimales: state.tiposAnimales,
        tipoPesaje: state.tipoPesaje,
        activeTab: state.activeTab,
        isDirty: state.isDirty,
      }),
    }
  )
)
