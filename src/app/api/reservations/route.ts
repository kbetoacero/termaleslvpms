// src/app/api/reservations/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { guestId, roomId, checkIn, checkOut, adults, children, totalAmount } = body

    // Generar número de reserva único
    const reservationNumber = `RES${Date.now()}`

    // Calcular noches
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Obtener información de la habitación
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true },
    })

    if (!room) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 })
    }

    // Crear reserva con transacción
    const reservation = await prisma.$transaction(async (tx) => {
      // Crear reserva
      const newReservation = await tx.reservation.create({
        data: {
          reservationNumber,
          type: "HABITACION",
          status: "CONFIRMED",
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guestId,
          adults,
          children: children || 0,
          totalAmount,
          paidAmount: 0,
          pendingAmount: totalAmount,
          userId: session.user.id,
        },
      })

      // Crear relación con habitación
      await tx.reservationRoom.create({
        data: {
          reservationId: newReservation.id,
          roomId,
          nightlyRate: room.roomType.basePrice,
          nights,
          subtotal: totalAmount,
        },
      })

      // Actualizar estado de habitación
      await tx.room.update({
        where: { id: roomId },
        data: { status: "OCCUPIED" },
      })

      return newReservation
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    )
  }
}