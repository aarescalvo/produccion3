/**
 * API DE BORRADORES - Capa 2: Guardado automático como BORRADOR
 * 
 * Endpoint unificado para guardar/promocionar/recuperar borradores
 * de cualquier módulo del sistema.
 * 
 * POST /api/drafts          → Guardar como borrador
 * PUT  /api/drafts/promote  → Promocionar borrador a definitivo
 * GET  /api/drafts?module=X → Obtener borradores pendientes de un módulo
 * DELETE /api/drafts?id=X   → Eliminar borrador
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Mapeo de módulos a modelos Prisma y campos de estado
 */
const MODULE_CONFIG: Record<string, {
  model: string
  estadoField: string
  borradorValue: string
  promoteTo: string
}> = {
  'pesaje-camion': {
    model: 'pesajeCamion',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'ABIERTO',
  },
  'lista-faena': {
    model: 'listaFaena',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'ABIERTA',
  },
  'romaneo': {
    model: 'romaneo',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
  'expedicion': {
    model: 'despacho',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
  'facturacion': {
    model: 'factura',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
  'cuero': {
    model: 'cuero',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
  'rendering': {
    model: 'registroRendering',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'REGISTRADO',
  },
  'lote-despostada': {
    model: 'loteDespostada',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'ABIERTO',
  },
  'empaque': {
    model: 'registroEmpaque',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
  'ingreso-despostada': {
    model: 'ingresoDespostada',
    estadoField: 'estado',
    borradorValue: 'BORRADOR',
    promoteTo: 'PENDIENTE',
  },
}

// GET - Obtener borradores pendientes de un módulo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    const operadorId = searchParams.get('operadorId')

    if (!module || !MODULE_CONFIG[module]) {
      return NextResponse.json(
        { success: false, error: 'Módulo no válido' },
        { status: 400 }
      )
    }

    const config = MODULE_CONFIG[module]
    
    const drafts = await (prisma as any)[config.model].findMany({
      where: {
        [config.estadoField]: config.borradorValue,
        ...(operadorId ? { operadorId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: drafts,
      count: drafts.length,
    })
  } catch (error: any) {
    console.error('[Drafts API] Error GET:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Guardar como borrador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { module, data, draftId } = body

    if (!module || !MODULE_CONFIG[module]) {
      return NextResponse.json(
        { success: false, error: 'Módulo no válido' },
        { status: 400 }
      )
    }

    const config = MODULE_CONFIG[module]
    
    // Si hay draftId, actualizar borrador existente
    if (draftId) {
      const updated = await (prisma as any)[config.model].update({
        where: { id: draftId },
        data: {
          ...data,
          [config.estadoField]: config.borradorValue,
        },
      })
      
      return NextResponse.json({
        success: true,
        data: updated,
        action: 'updated',
      })
    }

    // Crear nuevo borrador
    const created = await (prisma as any)[config.model].create({
      data: {
        ...data,
        [config.estadoField]: config.borradorValue,
      },
    })

    return NextResponse.json({
      success: true,
      data: created,
      action: 'created',
    })
  } catch (error: any) {
    console.error('[Drafts API] Error POST:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT - Promocionar borrador a definitivo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { module, id, action, data } = body

    if (action === 'promote') {
      if (!module || !MODULE_CONFIG[module] || !id) {
        return NextResponse.json(
          { success: false, error: 'Módulo e ID requeridos para promocionar' },
          { status: 400 }
        )
      }

      const config = MODULE_CONFIG[module]
      
      const promoted = await (prisma as any)[config.model].update({
        where: { id },
        data: {
          ...(data || {}),
          [config.estadoField]: config.promoteTo,
        },
      })

      return NextResponse.json({
        success: true,
        data: promoted,
        action: 'promoted',
        previousState: config.borradorValue,
        newState: config.promoteTo,
      })
    }

    // Actualizar borrador sin promocionar
    if (!module || !MODULE_CONFIG[module] || !id) {
      return NextResponse.json(
        { success: false, error: 'Módulo e ID requeridos' },
        { status: 400 }
      )
    }

    const config = MODULE_CONFIG[module]
    const updated = await (prisma as any)[config.model].update({
      where: { id },
      data: {
        ...data,
        [config.estadoField]: config.borradorValue,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      action: 'updated',
    })
  } catch (error: any) {
    console.error('[Drafts API] Error PUT:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar borrador
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const module = searchParams.get('module')

    if (!module || !MODULE_CONFIG[module] || !id) {
      return NextResponse.json(
        { success: false, error: 'Módulo e ID requeridos' },
        { status: 400 }
      )
    }

    const config = MODULE_CONFIG[module]
    
    const existing = await (prisma as any)[config.model].findUnique({
      where: { id },
    })

    if (!existing || existing[config.estadoField] !== config.borradorValue) {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden eliminar borradores' },
        { status: 400 }
      )
    }

    await (prisma as any)[config.model].delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      action: 'deleted',
    })
  } catch (error: any) {
    console.error('[Drafts API] Error DELETE:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
