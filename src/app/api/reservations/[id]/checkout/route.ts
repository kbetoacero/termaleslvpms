// src/app/api/reservations/[id]/checkout/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const forceCheckout = body.force || false

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    if (reservation.status !== "CHECKED_IN") {
      return NextResponse.json(
        { error: "Solo se puede hacer check-out de reservas con check-in" },
        { status: 400 }
      )
    }

    // Verificar saldo pendiente (advertencia, no bloqueo)
    const hasPendingAmount = Number(reservation.pendingAmount) > 0

    if (hasPendingAmount && !forceCheckout) {
      return NextResponse.json(
        {
          error: "pending_amount",
          message: "La reserva tiene un saldo pendiente",
          pendingAmount: Number(reservation.pendingAmount),
        },
        { status: 400 }
      )
    }

    // Actualizar estado de la reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CHECKED_OUT",
      },
    })

    // Actualizar estado de las habitaciones a CLEANING
    await Promise.all(
      reservation.rooms.map((resRoom) =>
        prisma.room.update({
          where: { id: resRoom.roomId },
          data: { status: "CLEANING" },
        })
      )
    )

    return NextResponse.json({
      message: "Check-out realizado exitosamente",
      reservation: updatedReservation,
      warning: hasPendingAmount ? "Reserva con saldo pendiente" : null,
    })
  } catch (error) {
    console.error("Error during check-out:", error)
    return NextResponse.json(
      { error: "Error al realizar check-out" },
      { status: 500 }
    )
  }
}