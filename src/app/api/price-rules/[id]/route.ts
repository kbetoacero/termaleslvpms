// src/app/api/price-rules/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener una regla específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rule = await prisma.priceRule.findUnique({
      where: { id },
      include: {
        roomType: true,
      },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    // Convertir Decimals
    const ruleConverted = {
      ...rule,
      multiplier: Number(rule.multiplier),
      roomType: {
        ...rule.roomType,
        basePrice: Number(rule.roomType.basePrice),
      },
    }

    return NextResponse.json(ruleConverted)
  } catch (error) {
    console.error("Error fetching price rule:", error)
    return NextResponse.json(
      { error: "Error al obtener regla" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar regla
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existingRule = await prisma.priceRule.findUnique({
      where: { id },
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    const startDate = data.startDate ? new Date(data.startDate) : undefined
    const endDate = data.endDate ? new Date(data.endDate) : undefined

    if (startDate && endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      )
    }

    const updatedRule = await prisma.priceRule.update({
      where: { id },
      data: {
        name: data.name,
        roomTypeId: data.roomTypeId,
        startDate,
        endDate,
        multiplier: data.multiplier ? parseFloat(data.multiplier) : undefined,
        priority: data.priority !== undefined ? parseInt(data.priority) : undefined,
        isActive: data.isActive,
        isRecurring: data.isRecurring,
        recurringType: data.isRecurring ? data.recurringType : null,
        daysOfWeek: data.isRecurring ? (data.daysOfWeek || []) : [],
        recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
      },
      include: {
        roomType: true,
      },
    })

    // Convertir Decimals
    const ruleConverted = {
      ...updatedRule,
      multiplier: Number(updatedRule.multiplier),
      roomType: {
        ...updatedRule.roomType,
        basePrice: Number(updatedRule.roomType.basePrice),
      },
    }

    return NextResponse.json(ruleConverted)
  } catch (error) {
    console.error("Error updating price rule:", error)
    return NextResponse.json(
      { error: "Error al actualizar regla" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar regla
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rule = await prisma.priceRule.findUnique({
      where: { id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Regla no encontrada" },
        { status: 404 }
      )
    }

    await prisma.priceRule.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Regla eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting price rule:", error)
    return NextResponse.json(
      { error: "Error al eliminar regla" },
      { status: 500 }
    )
  }
}