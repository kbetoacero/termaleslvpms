// src/app/api/guests/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Buscar/listar huéspedes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const phone = searchParams.get("phone")
    const search = searchParams.get("search")

    const where: any = {}

    if (email) {
      where.email = email
    }

    if (phone) {
      where.phone = phone
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ]
    }

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
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

// POST - Crear nuevo huésped
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      identificationType,
      identificationNumber,
      country,
      city,
      address,
      birthDate,
      notes,
    } = data

    // Validaciones
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Nombre, apellido y teléfono son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si ya existe un huésped con el mismo email o teléfono
    if (email) {
      const existingByEmail = await prisma.guest.findUnique({
        where: { email },
      })
      if (existingByEmail) {
        return NextResponse.json(
          { error: "Ya existe un huésped con ese email" },
          { status: 400 }
        )
      }
    }

    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
        identificationType: identificationType || null,
        identificationNumber: identificationNumber || null,
        country: country || null,
        city: city || null,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error: any) {
    console.error("Error creating guest:", error)
    
    // Error de email único
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: "Ya existe un huésped con ese email" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Error al crear huésped" },
      { status: 500 }
    )
  }
}