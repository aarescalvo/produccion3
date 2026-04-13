/**
 * PESAJE CAMIONES STORE - Capa 1: Zustand + Persist
 * 
 * Auto-guarda todo el estado del formulario de pesaje de camiones
 * en localStorage en cada cambio. Si el operario refresca o cierra
 * la página, los datos se recuperan automáticamente.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TipoAnimalCounter } from '@/components/pesaje-camiones/types'

export interface PesajeCamionesFormState {
  // Tipo de pesaje
  tipoPesaje: string
  
  // Datos del camión
  patenteChasis: string
  patenteAcoplado: string
  chofer: string
  dniChofer: string
  transportistaId: string
  
  // Datos de la tropa (ingreso hacienda)
  dte: string
  guia: string
  productorId: string
  usuarioFaenaId: string
  especie: string
  corralId: string
  tiposAnimales: TipoAnimalCounter[]
  
  // Pesos
  pesoBruto: number
  pesoTara: number
  
  // Salida mercadería
  destino: string
  remito: string
  descripcion: string
  
  // Observaciones
  observaciones: string
  
  // Estado de guardado
  isDirty: boolean
  lastSavedAt: number | null
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'offline-saved'
  
  // Borrador (Capa 2)
  draftId: string | null
  isDraft: boolean
}

interface PesajeCamionesStore extends PesajeCamionesFormState {
  // Setters individuales
  setTipoPesaje: (v: string) => void
  setPatenteChasis: (v: string) => void
  setPatenteAcoplado: (v: string) => void
  setChofer: (v: string) => void
  setDniChofer: (v: string) => void
  setTransportistaId: (v: string) => void
  setDte: (v: string) => void
  setGuia: (v: string) => void
  setProductorId: (v: string) => void
  setUsuarioFaenaId: (v: string) => void
  setEspecie: (v: string) => void
  setCorralId: (v: string) => void
  setTiposAnimales: (v: TipoAnimalCounter[]) => void
  setPesoBruto: (v: number) => void
  setPesoTara: (v: number) => void
  setDestino: (v: string) => void
  setRemito: (v: string) => void
  setDescripcion: (v: string) => void
  setObservaciones: (v: string) => void
  setSaveStatus: (v: PesajeCamionesFormState['saveStatus']) => void
  setDraftId: (v: string | null) => void
  
  // Computed
  pesoNeto: () => number
  totalCabezas: () => number
  
  // Actions
  resetForm: () => void
  markDirty: () => void
  markSaved: () => void
  loadFormData: (data: Partial<PesajeCamionesFormState>) => void
}

const initialState: PesajeCamionesFormState = {
  tipoPesaje: 'INGRESO_HACIENDA',
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
  tiposAnimales: [],
  pesoBruto: 0,
  pesoTara: 0,
  destino: '',
  remito: '',
  descripcion: '',
  observaciones: '',
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle',
  draftId: null,
  isDraft: false,
}

export const usePesajeCamionesStore = create<PesajeCamionesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters - cada uno marca como dirty automáticamente
      setTipoPesaje: (v) => set({ tipoPesaje: v, isDirty: true, saveStatus: 'dirty' }),
      setPatenteChasis: (v) => set({ patenteChasis: v, isDirty: true, saveStatus: 'dirty' }),
      setPatenteAcoplado: (v) => set({ patenteAcoplado: v, isDirty: true, saveStatus: 'dirty' }),
      setChofer: (v) => set({ chofer: v, isDirty: true, saveStatus: 'dirty' }),
      setDniChofer: (v) => set({ dniChofer: v, isDirty: true, saveStatus: 'dirty' }),
      setTransportistaId: (v) => set({ transportistaId: v, isDirty: true, saveStatus: 'dirty' }),
      setDte: (v) => set({ dte: v, isDirty: true, saveStatus: 'dirty' }),
      setGuia: (v) => set({ guia: v, isDirty: true, saveStatus: 'dirty' }),
      setProductorId: (v) => set({ productorId: v, isDirty: true, saveStatus: 'dirty' }),
      setUsuarioFaenaId: (v) => set({ usuarioFaenaId: v, isDirty: true, saveStatus: 'dirty' }),
      setEspecie: (v) => set({ especie: v, isDirty: true, saveStatus: 'dirty' }),
      setCorralId: (v) => set({ corralId: v, isDirty: true, saveStatus: 'dirty' }),
      setTiposAnimales: (v) => set({ tiposAnimales: v, isDirty: true, saveStatus: 'dirty' }),
      setPesoBruto: (v) => set({ pesoBruto: v, isDirty: true, saveStatus: 'dirty' }),
      setPesoTara: (v) => set({ pesoTara: v, isDirty: true, saveStatus: 'dirty' }),
      setDestino: (v) => set({ destino: v, isDirty: true, saveStatus: 'dirty' }),
      setRemito: (v) => set({ remito: v, isDirty: true, saveStatus: 'dirty' }),
      setDescripcion: (v) => set({ descripcion: v, isDirty: true, saveStatus: 'dirty' }),
      setObservaciones: (v) => set({ observaciones: v, isDirty: true, saveStatus: 'dirty' }),
      setSaveStatus: (v) => set({ saveStatus: v }),
      setDraftId: (v) => set({ draftId: v }),

      // Computed
      pesoNeto: () => {
        const { pesoBruto, pesoTara } = get()
        return pesoBruto > 0 && pesoTara > 0 ? pesoBruto - pesoTara : 0
      },
      totalCabezas: () => {
        const { tiposAnimales } = get()
        return tiposAnimales.reduce((acc, t) => acc + t.cantidad, 0)
      },

      // Actions
      resetForm: () => set({ ...initialState }),
      markDirty: () => set({ isDirty: true, saveStatus: 'dirty' }),
      markSaved: () => set({ isDirty: false, lastSavedAt: Date.now(), saveStatus: 'saved' }),
      loadFormData: (data) => set({ ...data }),
    }),
    {
      name: 'solemar-pesaje-camiones-form',
      partialize: (state) => ({
        // Solo persistir datos del formulario, no estado UI
        tipoPesaje: state.tipoPesaje,
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
        tiposAnimales: state.tiposAnimales,
        pesoBruto: state.pesoBruto,
        pesoTara: state.pesoTara,
        destino: state.destino,
        remito: state.remito,
        descripcion: state.descripcion,
        observaciones: state.observaciones,
        draftId: state.draftId,
        isDraft: state.isDraft,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
)

export default usePesajeCamionesStore
