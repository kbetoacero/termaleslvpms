// src/app/api/reservations/[id]/checkin/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Solo se puede hacer check-in de reservas confirmadas" },
        { status: 400 }
      )
    }

    // Actualizar estado de la reserva
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CHECKED_IN",
      },
    })

    // Actualizar estado de las habitaciones a OCCUPIED
    await Promise.all(
      reservation.rooms.map((resRoom) =>
        prisma.room.update({
          where: { id: resRoom.roomId },
          data: { status: "OCCUPIED" },
        })
      )
    )

    return NextResponse.json({
      message: "Check-in realizado exitosamente",
      reservation: updatedReservation,
    })
  } catch (error) {
    console.error("Error during check-in:", error)
    return NextResponse.json(
      { error: "Error al realizar check-in" },
      { status: 500 }
    )
  }
}