// src/app/api/room-types/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener un tipo de habitación específico
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

    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Tipo de habitación no encontrado" },
        { status: 404 }
      )
    }

    // Convertir Decimal a número
    const roomTypeConverted = {
      ...roomType,
      basePrice: Number(roomType.basePrice),
    }

    return NextResponse.json(roomTypeConverted)
  } catch (error) {
    console.error("Error fetching room type:", error)
    return NextResponse.json(
      { error: "Error al obtener tipo de habitación" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un tipo de habitación
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

    // Verificar si el tipo existe
    const existingRoomType = await prisma.roomType.findUnique({
      where: { id: params.id },
    })

    if (!existingRoomType) {
      return NextResponse.json(
        { error: "Tipo de habitación no encontrado" },
        { status: 404 }
      )
    }

    const updatedRoomType = await prisma.roomType.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        capacity: parseInt(data.capacity),
        basePrice: parseFloat(data.basePrice),
        amenities: data.amenities || [],
        isActive: data.isActive ?? true,
      },
      include: {
        rooms: true,
      },
    })

    // Convertir Decimal a número
    const roomTypeConverted = {
      ...updatedRoomType,
      basePrice: Number(updatedRoomType.basePrice),
    }

    return NextResponse.json(roomTypeConverted)
  } catch (error) {
    console.error("Error updating room type:", error)
    return NextResponse.json(
      { error: "Error al actualizar tipo de habitación" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un tipo de habitación
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

    // Verificar si el tipo existe
    const roomType = await prisma.roomType.findUnique({
      where: { id: params.id },
      include: {
        rooms: true,
      },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: "Tipo de habitación no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si tiene habitaciones asociadas
    if (roomType.rooms.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el tipo porque tiene habitaciones asociadas. Elimina primero las habitaciones.",
        },
        { status: 400 }
      )
    }

    await prisma.roomType.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Tipo de habitación eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting room type:", error)
    return NextResponse.json(
      { error: "Error al eliminar tipo de habitación" },
      { status: 500 }
    )
  }
}