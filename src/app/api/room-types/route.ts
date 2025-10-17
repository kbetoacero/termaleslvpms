// src/app/api/room-types/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const roomType = await prisma.roomType.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        capacity: parseInt(data.capacity),
        basePrice: parseFloat(data.basePrice),
        amenities: data.amenities || [],
        images: [],
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(roomType, { status: 201 })
  } catch (error) {
    console.error("Error creating room type:", error)
    return NextResponse.json(
      { error: "Error al crear tipo de habitación" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    //const session = await auth()
    //if (!session) {
      //return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    //}

    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(roomTypes)
  } catch (error) {
    console.error("Error fetching room types:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de habitación" },
      { status: 500 }
    )
  }
}