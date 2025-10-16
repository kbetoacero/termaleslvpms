// src/app/api/guests/route.ts
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
    const { firstName, lastName, email, phone } = body

    // Validar datos requeridos
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Crear huésped
    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
      },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error("Error creating guest:", error)
    return NextResponse.json(
      { error: "Error al crear el huésped" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const guests = await prisma.guest.findMany({
      orderBy: { firstName: 'asc' },
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json(
      { error: "Error al obtener huéspedes" },
      { status: 500 }
    )
  }
}