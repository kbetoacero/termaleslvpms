// src/app/api/rooms/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener una habitación específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORALMENTE SIN AUTH PARA DESARROLLO
    // const session = await auth()
    // if (!session) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    const { id } = await params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Habitación no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json(
      { error: "Error al obtener habitación" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una habitación
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORALMENTE SIN AUTH PARA DESARROLLO
    // const session = await auth()
    // if (!session) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    const data = await request.json()

    // Verificar si la habitación existe
    const existingRoom = await prisma.room.findUnique({
      where: { id: params.id },
    })

    if (!existingRoom) {
      return NextResponse.json(
        { error: "Habitación no encontrada" },
        { status: 404 }
      )
    }

    // Si se cambia el número, verificar que no esté en uso
    if (data.number !== existingRoom.number) {
      const duplicateNumber = await prisma.room.findUnique({
        where: { number: data.number },
      })

      if (duplicateNumber) {
        return NextResponse.json(
          { error: "Ya existe una habitación con ese número" },
          { status: 400 }
        )
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        number: data.number,
        floor: data.floor || null,
        roomTypeId: data.roomTypeId,
        status: data.status,
        notes: data.notes || null,
      },
      include: {
        roomType: true,
      },
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error("Error updating room:", error)
    return NextResponse.json(
      { error: "Error al actualizar habitación" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una habitación
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // TEMPORALMENTE SIN AUTH PARA DESARROLLO
    // const session = await auth()
    // if (!session) {
    //   return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    // }

    // Verificar si la habitación existe
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        reservations: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Habitación no encontrada" },
        { status: 404 }
      )
    }

    // Verificar si tiene reservas activas
    if (room.reservations.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar la habitación porque tiene reservas asociadas",
        },
        { status: 400 }
      )
    }

    await prisma.room.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Habitación eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json(
      { error: "Error al eliminar habitación" },
      { status: 500 }
    )
  }
}