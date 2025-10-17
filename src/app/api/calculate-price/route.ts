// src/app/api/calculate-price/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { roomTypeId, startDate, endDate } = await request.json()

    if (!roomTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Se requiere roomTypeId, startDate y endDate" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la de inicio" },
        { status: 400 }
      )
    }

    // Obtener el tipo de habitación
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Tipo de habitación no encontrado" },
        { status: 404 }
      )
    }

    const basePrice = Number(roomType.basePrice)

    // Obtener reglas activas que apliquen
    const rules = await prisma.priceRule.findMany({
      where: {
        roomTypeId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
        ],
      },
      orderBy: { priority: 'desc' },
    })

    // Calcular precio por día
    const dailyPrices = []
    const currentDate = new Date(start)

    while (currentDate < end) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      // Encontrar reglas que apliquen a este día
      const applicableRules = rules.filter((rule) => {
        const ruleStart = new Date(rule.startDate)
        const ruleEnd = new Date(rule.endDate)
        return ruleStart <= dayEnd && ruleEnd >= dayStart
      })

      // Aplicar la regla con mayor prioridad
      let finalPrice = basePrice
      let appliedRule = null

      if (applicableRules.length > 0) {
        const topRule = applicableRules[0] // Ya está ordenado por prioridad
        const multiplier = Number(topRule.multiplier)
        finalPrice = basePrice * multiplier
        appliedRule = {
          id: topRule.id,
          name: topRule.name,
          multiplier,
          priority: topRule.priority,
        }
      }

      dailyPrices.push({
        date: dayStart.toISOString(),
        basePrice,
        finalPrice: Math.round(finalPrice),
        appliedRule,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calcular totales
    const totalNights = dailyPrices.length
    const totalBase = basePrice * totalNights
    const totalFinal = dailyPrices.reduce((sum, day) => sum + day.finalPrice, 0)
    const totalDiscount = totalBase - totalFinal
    const discountPercentage = totalBase > 0 ? ((totalDiscount / totalBase) * 100) : 0

    return NextResponse.json({
      roomType: {
        id: roomType.id,
        name: roomType.name,
        basePrice,
      },
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        nights: totalNights,
      },
      pricing: {
        totalBase: Math.round(totalBase),
        totalFinal: Math.round(totalFinal),
        totalDiscount: Math.round(totalDiscount),
        discountPercentage: Math.round(discountPercentage * 100) / 100,
        averagePricePerNight: Math.round(totalFinal / totalNights),
      },
      dailyPrices,
      appliedRules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        startDate: r.startDate,
        endDate: r.endDate,
        multiplier: Number(r.multiplier),
        priority: r.priority,
      })),
    })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json(
      { error: "Error al calcular precio" },
      { status: 500 }
    )
  }
}