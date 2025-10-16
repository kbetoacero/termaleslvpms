// src/app/api/room-types/[id]/route.ts
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

    const roomType = await prisma.roomType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        capacity: parseInt(data.capacity),
        basePrice: parseFloat(data.basePrice),
        amenities: data.amenities || [],
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(roomType)
  } catch (error) {
    console.error("Error updating room type:", error)
    return NextResponse.json(
      { error: "Error al actualizar tipo de habitación" },
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

    // Verificar si hay habitaciones asociadas
    const roomsCount = await prisma.room.count({
      where: { roomTypeId: id },
    })

    if (roomsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${roomsCount} habitación(es) asociadas a este tipo` },
        { status: 400 }
      )
    }

    await prisma.roomType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Tipo eliminado" })
  } catch (error) {
    console.error("Error deleting room type:", error)
    return NextResponse.json(
      { error: "Error al eliminar tipo de habitación" },
      { status: 500 }
    )
  }
}