// src/app/api/calculate-price/route.ts (REEMPLAZAR el existente)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Función helper para verificar si una regla recurrente aplica a una fecha
function doesRecurringRuleApply(
  rule: any,
  date: Date
): boolean {
  if (!rule.isRecurring) return false

  // Verificar que esté dentro del rango de recurrencia
  if (rule.recurringEndDate && date > new Date(rule.recurringEndDate)) {
    return false
  }

  const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado

  switch (rule.recurringType) {
    case "WEEKLY":
      // Se repite cada semana en los mismos días
      return rule.daysOfWeek.includes(dayOfWeek)

    case "CUSTOM":
      // Días específicos de la semana
      return rule.daysOfWeek.includes(dayOfWeek)

    case "MONTHLY":
      // Mismo día del mes
      const ruleDate = new Date(rule.startDate)
      return date.getDate() === ruleDate.getDate()

    default:
      return false
  }
}

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

    // Obtener TODAS las reglas activas para este tipo de habitación
    const allRules = await prisma.priceRule.findMany({
      where: {
        roomTypeId,
        isActive: true,
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

      // Filtrar reglas que apliquen a este día específico
      const applicableRules = allRules.filter((rule) => {
        // Reglas normales (por rango de fechas)
        if (!rule.isRecurring) {
          const ruleStart = new Date(rule.startDate)
          const ruleEnd = new Date(rule.endDate)
          return ruleStart <= dayEnd && ruleEnd >= dayStart
        }

        // Reglas recurrentes
        return doesRecurringRuleApply(rule, dayStart)
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
          isRecurring: topRule.isRecurring,
          recurringType: topRule.recurringType,
        }
      }

      dailyPrices.push({
        date: dayStart.toISOString(),
        dayOfWeek: dayStart.getDay(),
        dayName: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][dayStart.getDay()],
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
      appliedRules: allRules
        .filter(r => r.isActive)
        .map((r) => ({
          id: r.id,
          name: r.name,
          startDate: r.startDate,
          endDate: r.endDate,
          multiplier: Number(r.multiplier),
          priority: r.priority,
          isRecurring: r.isRecurring,
          recurringType: r.recurringType,
          daysOfWeek: r.daysOfWeek,
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