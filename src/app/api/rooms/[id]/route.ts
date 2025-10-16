// src/app/api/rooms/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Verificar si el nuevo número ya existe en otra habitación
    if (data.number) {
      const existing = await prisma.room.findFirst({
        where: {
          number: data.number,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: "Ya existe otra habitación con ese número" },
          { status: 400 }
        )
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        number: data.number,
        floor: data.floor || null,
        roomTypeId: data.roomTypeId,
        status: data.status,
        notes: data.notes || null,
      },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error updating room:", error)
    return NextResponse.json(
      { error: "Error al actualizar habitación" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar si hay reservas activas
    const activeReservations = await prisma.reservationRoom.count({
      where: {
        roomId: id,
        reservation: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
        },
      },
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar. La habitación tiene reservas activas" },
        { status: 400 }
      )
    }

    await prisma.room.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Habitación eliminada" })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json(
      { error: "Error al eliminar habitación" },
      { status: 500 }
    )
  }
}