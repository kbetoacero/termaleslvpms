// src/app/api/reservations/[id]/checkin/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar que la reserva existe y está confirmada
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { rooms: true },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Solo se puede hacer check-in a reservas confirmadas" },
        { status: 400 }
      )
    }

    // Actualizar estado de reserva y habitación
    await prisma.$transaction(async (tx) => {
      // Actualizar reserva
      await tx.reservation.update({
        where: { id },
        data: { status: "CHECKED_IN" },
      })

      // Actualizar habitaciones a ocupadas
      for (const reservationRoom of reservation.rooms) {
        await tx.room.update({
          where: { id: reservationRoom.roomId },
          data: { status: "OCCUPIED" },
        })
      }

      // Registrar actividad
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          action: "CHECK_IN",
          entity: "Reservation",
          entityId: id,
          details: {
            reservationNumber: reservation.reservationNumber,
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Check-in realizado exitosamente",
    })
  } catch (error) {
    console.error("Error en check-in:", error)
    return NextResponse.json(
      { error: "Error al realizar check-in" },
      { status: 500 }
    )
  }
}