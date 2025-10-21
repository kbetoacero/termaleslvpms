// src/app/api/guests/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener huésped específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: "Huésped no encontrado" },
        { status: 404 }
      )
    }

    // Convertir Decimals en reservas
    const guestConverted = {
      ...guest,
      reservations: guest.reservations.map((res) => ({
        ...res,
        totalAmount: Number(res.totalAmount),
        paidAmount: Number(res.paidAmount),
        pendingAmount: Number(res.pendingAmount),
      })),
    }

    return NextResponse.json(guestConverted)
  } catch (error) {
    console.error("Error fetching guest:", error)
    return NextResponse.json(
      { error: "Error al obtener huésped" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar huésped
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existingGuest = await prisma.guest.findUnique({
      where: { id },
    })

    if (!existingGuest) {
      return NextResponse.json(
        { error: "Huésped no encontrado" },
        { status: 404 }
      )
    }

    // Si se cambia el email, verificar que no esté en uso
    if (data.email && data.email !== existingGuest.email) {
      const duplicateEmail = await prisma.guest.findUnique({
        where: { email: data.email },
      })

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "Ya existe un huésped con ese email" },
          { status: 400 }
        )
      }
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        identificationType: data.identificationType || null,
        identificationNumber: data.identificationNumber || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        isVIP: data.isVIP || false,
      },
    })

    return NextResponse.json(updatedGuest)
  } catch (error: any) {
    console.error("Error updating guest:", error)
    
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: "Ya existe un huésped con ese email" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Error al actualizar huésped" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar huésped
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: "Huésped no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si tiene reservas
    if (guest.reservations.length > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar un huésped con reservas asociadas",
          reservationsCount: guest.reservations.length,
        },
        { status: 400 }
      )
    }

    await prisma.guest.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Huésped eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting guest:", error)
    return NextResponse.json(
      { error: "Error al eliminar huésped" },
      { status: 500 }
    )
  }
}