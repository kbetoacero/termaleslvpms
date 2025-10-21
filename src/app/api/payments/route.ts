// src/app/api/payments/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Registrar nuevo pago
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { reservationId, amount, method, reference, notes, userId } = data

    // Validaciones
    if (!reservationId || !amount || !method) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const paymentAmount = parseFloat(amount)

    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" },
        { status: 400 }
      )
    }

    // Obtener la reserva
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que no se pague más del saldo pendiente
    const pendingAmount = Number(reservation.pendingAmount)
    if (paymentAmount > pendingAmount) {
      return NextResponse.json(
        {
          error: "El monto del pago excede el saldo pendiente",
          pendingAmount,
        },
        { status: 400 }
      )
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        reservationId,
        amount: paymentAmount,
        method,
        reference: reference || null,
        notes: notes || null,
        status: "COMPLETED",
        userId: userId || "system", // TODO: Obtener del usuario autenticado
      },
    })

    // Actualizar montos en la reserva
    const newPaidAmount = Number(reservation.paidAmount) + paymentAmount
    const newPendingAmount = Number(reservation.totalAmount) - newPaidAmount

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
      },
    })

    // Convertir Decimal
    const paymentConverted = {
      ...payment,
      amount: Number(payment.amount),
    }

    return NextResponse.json(
      {
        payment: paymentConverted,
        reservation: {
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          isPaidInFull: newPendingAmount === 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Error al registrar pago" },
      { status: 500 }
    )
  }
}

// GET - Obtener pagos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get("reservationId")

    const where: any = {}

    if (reservationId) {
      where.reservationId = reservationId
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        reservation: {
          select: {
            reservationNumber: true,
            guest: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Convertir Decimals
    const paymentsConverted = payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    }))

    return NextResponse.json(paymentsConverted)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    )
  }
}