// src/app/api/price-rules/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener todas las reglas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get("roomTypeId")
    const active = searchParams.get("active")

    const where: any = {}
    
    if (roomTypeId) {
      where.roomTypeId = roomTypeId
    }
    
    if (active === "true") {
      where.isActive = true
    }

    const rules = await prisma.priceRule.findMany({
      where,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { startDate: 'asc' },
      ],
    })

    // Convertir Decimals a números
    const rulesConverted = rules.map((rule) => ({
      ...rule,
      multiplier: Number(rule.multiplier),
      roomType: {
        ...rule.roomType,
        basePrice: Number(rule.roomType.basePrice),
      },
    }))

    return NextResponse.json(rulesConverted)
  } catch (error) {
    console.error("Error fetching price rules:", error)
    return NextResponse.json(
      { error: "Error al obtener reglas de precios" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva regla
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validaciones
    if (!data.name || !data.roomTypeId || !data.startDate || !data.endDate || !data.multiplier) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      )
    }

    if (data.multiplier <= 0) {
      return NextResponse.json(
        { error: "El multiplicador debe ser mayor a 0" },
        { status: 400 }
      )
    }

    // Verificar si el tipo de habitación existe
    const roomType = await prisma.roomType.findUnique({
      where: { id: data.roomTypeId },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Tipo de habitación no encontrado" },
        { status: 404 }
      )
    }

    const rule = await prisma.priceRule.create({
      data: {
        name: data.name,
        roomTypeId: data.roomTypeId,
        startDate,
        endDate,
        multiplier: parseFloat(data.multiplier),
        priority: parseInt(data.priority || 0),
        isActive: data.isActive ?? true,
      },
      include: {
        roomType: true,
      },
    })

    // Convertir Decimals
    const ruleConverted = {
      ...rule,
      multiplier: Number(rule.multiplier),
      roomType: {
        ...rule.roomType,
        basePrice: Number(rule.roomType.basePrice),
      },
    }

    return NextResponse.json(ruleConverted, { status: 201 })
  } catch (error) {
    console.error("Error creating price rule:", error)
    return NextResponse.json(
      { error: "Error al crear regla de precio" },
      { status: 500 }
    )
  }
}