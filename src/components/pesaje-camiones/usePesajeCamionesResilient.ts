/**
 * USE PESAJE CAMIONES RESILIENT - Hook actualizado con las 3 capas de resiliencia
 * 
 * Capa 1: Zustand + persist (auto-save en localStorage)
 * Capa 2: Auto-save como BORRADOR en la DB cada 30s
 * Capa 3: Offline mode con cola de operaciones
 * 
 * Este hook reemplaza al usePesajeCamiones original pero mantiene
 * la misma interfaz para compatibilidad con el componente existente.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { usePesajeCamionesStore } from '@/stores/pesajeCamionesStore'
import { useResilientModule } from '@/hooks/useResilientModule'
import { resilientFetch } from '@/lib/resilientFetch'
import type { Cliente, Transportista, Corral, Pesaje, TipoAnimalCounter } from './types'
import { imprimirTicket, imprimirReporte } from './ticketPrint'

interface UsePesajeCamionesResilientOptions {
  operadorId: string
  onTropaCreada?: () => void
}

export function usePesajeCamionesResilient({ operadorId, onTropaCreada }: UsePesajeCamionesResilientOptions) {
  // Capa 1: Store Zustand con persist
  const store = usePesajeCamionesStore()
  
  // Data del servidor (no persistida - se refresca)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [transportistas, setTransportistas] = useState<Transportista[]>([])
  const [corrales, setCorrales] = useState<Corral[]>([])
  const [pesajesAbiertos, setPesajesAbiertos] = useState<Pesaje[]>([])
  const [pesajesCerrados, setPesajesCerrados] = useState<Pesaje[]>([])
  const [nextTicket, setNextTicket] = useState(1)
  const [nextTropaCode, setNextTropaCode] = useState<{ codigo: string; numero: number } | null>(null)
  
  // UI State (no persistida)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('nuevo')
  
  // History filters
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  
  // Dialogs (no persistidos)
  const [cerrarOpen, setCerrarOpen] = useState(false)
  const [pesajeSeleccionado, setPesajeSeleccionado] = useState<Pesaje | null>(null)
  const [taraForm, setTaraForm] = useState(0)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supervisorPin, setSupervisorPin] = useState('')
  const [supervisorVerificado, setSupervisorVerificado] = useState(false)
  const [pesajeAccion, setPesajeAccion] = useState<Pesaje | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState<'transportista' | 'productor' | 'usuarioFaena' | null>(null)

  // Capa 2 + 3: Integración de resiliencia
  const resilience = useResilientModule({
    module: 'pesaje-camion',
    apiPath: '/api/pesaje-camion',
    getFormData: () => ({
      tipoPesaje: store.tipoPesaje,
      patenteChasis: store.patenteChasis,
      patenteAcoplado: store.patenteAcoplado,
      chofer: store.chofer,
      dniChofer: store.dniChofer,
      transportistaId: store.transportistaId,
      dte: store.dte,
      guia: store.guia,
      productorId: store.productorId,
      usuarioFaenaId: store.usuarioFaenaId,
      especie: store.especie,
      corralId: store.corralId,
      tiposAnimales: store.tiposAnimales,
      pesoBruto: store.pesoBruto,
      pesoTara: store.pesoTara,
      destino: store.destino,
      remito: store.remito,
      descripcion: store.descripcion,
      observaciones: store.observaciones,
      operadorId,
    }),
    isDirty: store.isDirty,
    setSaveStatus: store.setSaveStatus,
    setDraftId: store.setDraftId,
    draftId: store.draftId,
    onDraftRecovered: (draft) => {
      // Restaurar datos del borrador al store
      store.loadFormData({
        tipoPesaje: draft.tipoPesaje || 'INGRESO_HACIENDA',
        patenteChasis: draft.patenteChasis || '',
        patenteAcoplado: draft.patenteAcoplado || '',
        chofer: draft.chofer || '',
        dniChofer: draft.dniChofer || '',
        transportistaId: draft.transportistaId || '',
        dte: draft.dte || '',
        guia: draft.guia || '',
        productorId: draft.productorId || '',
        usuarioFaenaId: draft.usuarioFaenaId || '',
        especie: draft.especie || 'BOVINO',
        corralId: draft.corralId || '',
        tiposAnimales: draft.tiposAnimales || [],
        pesoBruto: draft.pesoBruto || 0,
        pesoTara: draft.pesoTara || 0,
        destino: draft.destino || '',
        remito: draft.remito || '',
        descripcion: draft.descripcion || '',
        observaciones: draft.observaciones || '',
        draftId: draft.id,
        isDraft: true,
      })
    },
    autoSaveInterval: 30000, // 30 segundos
  })

  // Computed
  const pesoNeto = store.pesoNeto()
  const productores = clientes.filter(c => c.esProductor)
  const usuariosFaena = clientes.filter(c => c.esUsuarioFaena)
  const totalCabezas = store.totalCabezas()
  
  const pesajesFiltrados = pesajesCerrados.filter(p => {
    if (fechaDesde) {
      const desde = new Date(fechaDesde)
      desde.setHours(0, 0, 0, 0)
      if (new Date(p.fecha) < desde) return false
    }
    if (fechaHasta) {
      const hasta = new Date(fechaHasta)
      hasta.setHours(23, 59, 59, 999)
      if (new Date(p.fecha) > hasta) return false
    }
    return true
  })

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [pesajesRes, transRes, clientesRes, corralesRes] = await Promise.all([
        fetch('/api/pesaje-camion'),
        fetch('/api/transportistas'),
        fetch('/api/clientes'),
        fetch('/api/corrales')
      ])
      
      const pesajesData = await pesajesRes.json()
      const transData = await transRes.json()
      const clientesData = await clientesRes.json()
      const corralesData = await corralesRes.json()
      
      if (pesajesData.success) {
        setPesajesAbiertos(pesajesData.data.filter((p: Pesaje) => p.estado === 'ABIERTO'))
        setPesajesCerrados(pesajesData.data.filter((p: Pesaje) => p.estado === 'CERRADO'))
        setNextTicket(pesajesData.nextTicketNumber)
      }
      
      if (transData.success) setTransportistas(transData.data)
      if (clientesData.success) setClientes(clientesData.data)
      if (corralesData.success) setCorrales(corralesData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch next tropa code
  const fetchNextTropaCode = useCallback(async (especieParam: string) => {
    try {
      const res = await fetch(`/api/pesaje-camion?action=nextTropaCode&especie=${especieParam}`)
      const data = await res.json()
      if (data.success) {
        setNextTropaCode(data.data)
      }
    } catch (error) {
      console.error('Error fetching next tropa code:', error)
    }
  }, [])

  // Initialize
  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (store.tipoPesaje === 'INGRESO_HACIENDA') {
      fetchNextTropaCode(store.especie)
    }
  }, [store.especie, store.tipoPesaje, fetchNextTropaCode])

  // Reset form
  const resetForm = useCallback(() => {
    store.resetForm()
    fetchNextTropaCode('BOVINO')
  }, [store, fetchNextTropaCode])

  // Handle quick add
  const handleQuickAdd = useCallback((tipo: string, data: Cliente | Transportista) => {
    if (tipo === 'transportista') {
      setTransportistas(prev => [...prev, data as Transportista])
      store.setTransportistaId(data.id)
    } else {
      setClientes(prev => [...prev, data as Cliente])
      if (tipo === 'productor') store.setProductorId(data.id)
      else store.setUsuarioFaenaId(data.id)
    }
  }, [store])

  // Save pesaje - usa resilientFetch (Capa 3)
  const handleGuardar = useCallback(async () => {
    // Validations
    if (!store.patenteChasis) {
      toast.error('Ingrese la patente del chasis')
      return
    }
    
    if (store.tipoPesaje === 'INGRESO_HACIENDA') {
      if (!store.usuarioFaenaId) {
        toast.error('Seleccione el usuario de faena')
        return
      }
      if (totalCabezas <= 0) {
        toast.error('Indique la cantidad de animales')
        return
      }
      if (!store.corralId) {
        toast.error('Seleccione el corral')
        return
      }
      if (store.pesoBruto <= 0) {
        toast.error('Ingrese el peso bruto')
        return
      }
    }
    
    if (store.tipoPesaje === 'SALIDA_MERCADERIA' && !store.destino) {
      toast.error('Ingrese el destino')
      return
    }
    
    if ((store.tipoPesaje === 'PESAJE_PARTICULAR' || store.tipoPesaje === 'SALIDA_MERCADERIA') && store.pesoBruto <= 0) {
      toast.error('Ingrese el peso bruto')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        tipo: store.tipoPesaje,
        patenteChasis: store.patenteChasis.toUpperCase(),
        patenteAcoplado: store.patenteAcoplado?.toUpperCase() || null,
        chofer: store.chofer || null,
        dniChofer: store.dniChofer || null,
        transportistaId: store.transportistaId || null,
        pesoBruto: store.pesoBruto || null,
        pesoTara: store.tipoPesaje === 'INGRESO_HACIENDA' ? null : (store.pesoTara || null),
        pesoNeto: store.tipoPesaje === 'INGRESO_HACIENDA' ? null : (pesoNeto || null),
        observaciones: store.observaciones || null,
        destino: store.destino || null,
        remito: store.remito || null,
        descripcion: store.descripcion || null,
        operadorId
      }
      
      if (store.tipoPesaje === 'INGRESO_HACIENDA') {
        payload.dte = store.dte || ''
        payload.guia = store.guia || ''
        payload.productorId = store.productorId || null
        payload.usuarioFaenaId = store.usuarioFaenaId
        payload.especie = store.especie
        payload.tiposAnimales = store.tiposAnimales
        payload.cantidadCabezas = totalCabezas
        payload.corralId = store.corralId || null
      }
      
      // Capa 3: Usar resilientFetch en lugar de fetch directo
      const result = await resilience.saveFinal(payload)
      
      if (result.success) {
        if (result.data?.offline) {
          toast.info('Sin conexión - el pesaje se guardará cuando vuelva la conexión')
          resetForm()
          return
        }
        
        const data = result.data
        if (store.tipoPesaje === 'INGRESO_HACIENDA') {
          const animalesCreados = data?.animalesCreados || 0
          toast.success(`Tropa ${data?.tropa?.codigo} creada con ${animalesCreados} animales individuales`, { duration: 6000 })
          toast.info(`Ticket #${String(data?.numeroTicket).padStart(6, '0')} - Pendiente de tara`)
        } else {
          toast.success(`Ticket #${String(data?.numeroTicket).padStart(6, '0')} creado`)
        }
        
        resetForm()
        
        if (data?.estado === 'ABIERTO') {
          setPesajesAbiertos(prev => [data, ...prev])
        } else {
          setPesajesCerrados(prev => [data, ...prev])
          imprimirTicket(data, true)
        }
        
        setNextTicket(prev => prev + 1)
        onTropaCreada?.()
      } else {
        toast.error(result.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }, [store, totalCabezas, pesoNeto, operadorId, resetForm, onTropaCreada, resilience])

  // Cerrar pesaje (add tara)
  const handleCerrarPesaje = useCallback(async () => {
    if (!pesajeSeleccionado || taraForm <= 0) {
      toast.error('Ingrese el peso tara')
      return
    }
    
    setSaving(true)
    try {
      const result = await resilientFetch('/api/pesaje-camion', {
        method: 'PUT',
        body: {
          id: pesajeSeleccionado.id,
          pesoTara: taraForm,
          pesoNeto: pesajeSeleccionado.pesoBruto! - taraForm
        },
        module: 'pesaje-camion',
      })
      
      if (result.success && !result.fromOfflineQueue) {
        toast.success('Pesaje cerrado correctamente')
        setCerrarOpen(false)
        setPesajeSeleccionado(null)
        setTaraForm(0)
        
        setTimeout(() => result.data && imprimirTicket(result.data as Pesaje, true), 100)
        await fetchData()
        onTropaCreada?.()
      } else if (result.fromOfflineQueue) {
        toast.info('Sin conexión - operación encolada')
        setCerrarOpen(false)
      } else {
        toast.error(result.error || 'Error al cerrar')
      }
    } catch (error) {
      console.error('Error al cerrar pesaje:', error)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }, [pesajeSeleccionado, taraForm, fetchData, onTropaCreada])

  // Delete pesaje
  const handleDeletePesaje = useCallback(async () => {
    if (!pesajeAccion) return
    
    try {
      const result = await resilientFetch(`/api/pesaje-camion?id=${pesajeAccion.id}`, {
        method: 'DELETE',
        module: 'pesaje-camion',
        queueOffline: false, // No encolar eliminaciones offline
      })
      
      if (result.success) {
        toast.success('Pesaje eliminado')
        setDeleteDialogOpen(false)
        setPesajeAccion(null)
        setSupervisorPin('')
        fetchData()
      } else {
        toast.error(result.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }, [pesajeAccion, fetchData])

  // Print report
  const handleImprimirReporte = useCallback(() => {
    imprimirReporte(pesajesFiltrados, fechaDesde, fechaHasta)
  }, [pesajesFiltrados, fechaDesde, fechaHasta])

  return {
    // Data
    clientes,
    transportistas,
    corrales,
    pesajesAbiertos,
    pesajesCerrados,
    pesajesFiltrados,
    nextTicket,
    nextTropaCode,
    productores,
    usuariosFaena,
    
    // UI State
    loading,
    saving,
    activeTab,
    setActiveTab,
    
    // Form State (from Zustand store - Capa 1)
    tipoPesaje: store.tipoPesaje,
    setTipoPesaje: store.setTipoPesaje,
    patenteChasis: store.patenteChasis,
    setPatenteChasis: store.setPatenteChasis,
    patenteAcoplado: store.patenteAcoplado,
    setPatenteAcoplado: store.setPatenteAcoplado,
    chofer: store.chofer,
    setChofer: store.setChofer,
    dniChofer: store.dniChofer,
    setDniChofer: store.setDniChofer,
    transportistaId: store.transportistaId,
    setTransportistaId: store.setTransportistaId,
    dte: store.dte,
    setDte: store.setDte,
    guia: store.guia,
    setGuia: store.setGuia,
    productorId: store.productorId,
    setProductorId: store.setProductorId,
    usuarioFaenaId: store.usuarioFaenaId,
    setUsuarioFaenaId: store.setUsuarioFaenaId,
    especie: store.especie,
    setEspecie: store.setEspecie,
    corralId: store.corralId,
    setCorralId: store.setCorralId,
    pesoBruto: store.pesoBruto,
    setPesoBruto: store.setPesoBruto,
    pesoTara: store.pesoTara,
    setPesoTara: store.setPesoTara,
    pesoNeto,
    observaciones: store.observaciones,
    setObservaciones: store.setObservaciones,
    destino: store.destino,
    setDestino: store.setDestino,
    remito: store.remito,
    setRemito: store.setRemito,
    descripcion: store.descripcion,
    setDescripcion: store.setDescripcion,
    tiposAnimales: store.tiposAnimales,
    setTiposAnimales: store.setTiposAnimales,
    totalCabezas,
    
    // Save status (Capa 1 + 2)
    saveStatus: store.saveStatus,
    isDirty: store.isDirty,
    
    // History filters
    fechaDesde, setFechaDesde,
    fechaHasta, setFechaHasta,
    
    // Dialogs
    cerrarOpen, setCerrarOpen,
    pesajeSeleccionado, setPesajeSeleccionado,
    taraForm, setTaraForm,
    editDialogOpen, setEditDialogOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    supervisorPin, setSupervisorPin,
    supervisorVerificado, setSupervisorVerificado,
    pesajeAccion, setPesajeAccion,
    quickAddOpen, setQuickAddOpen,
    
    // Resilience (Capa 2 + 3)
    isOnline: resilience.isOnline,
    pendingDrafts: resilience.pendingDrafts,
    recoverDraft: resilience.recoverDraft,
    dismissDrafts: resilience.dismissDrafts,
    saveDraftNow: resilience.saveDraftNow,
    
    // Actions
    fetchData,
    resetForm,
    handleQuickAdd,
    handleGuardar,
    handleCerrarPesaje,
    handleDeletePesaje,
    handleImprimirReporte,
    imprimirTicket
  }
}
