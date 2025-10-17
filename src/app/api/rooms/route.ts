// src/app/api/rooms/route.ts
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

    // Verificar si el número ya existe
    const existing = await prisma.room.findUnique({
      where: { number: data.number },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una habitación con ese número" },
        { status: 400 }
      )
    }

    const room = await prisma.room.create({
      data: {
        number: data.number,
        floor: data.floor || null,
        roomTypeId: data.roomTypeId,
        status: data.status || "AVAILABLE",
        notes: data.notes || null,
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json(
      { error: "Error al crear habitación" },
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

    const rooms = await prisma.room.findMany({
      include: {
        roomType: true,
      },
      orderBy: { number: 'asc' },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      { error: "Error al obtener habitaciones" },
      { status: 500 }
    )
  }
}