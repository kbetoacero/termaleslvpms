// src/app/api/reservations/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Obtener reserva específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    // Convertir Decimals
    const reservationConverted = {
      ...reservation,
      totalAmount: Number(reservation.totalAmount),
      paidAmount: Number(reservation.paidAmount),
      pendingAmount: Number(reservation.pendingAmount),
      rooms: reservation.rooms.map((resRoom) => ({
        ...resRoom,
        nightlyRate: Number(resRoom.nightlyRate),
        subtotal: Number(resRoom.subtotal),
        room: {
          ...resRoom.room,
          roomType: {
            ...resRoom.room.roomType,
            basePrice: Number(resRoom.room.roomType.basePrice),
          },
        },
      })),
      payments: reservation.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
      services: reservation.services.map((service) => ({
        ...service,
        unitPrice: Number(service.unitPrice),
        subtotal: Number(service.subtotal),
      })),
    }

    return NextResponse.json(reservationConverted)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json(
      { error: "Error al obtener reserva" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar reserva
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: data.status,
        adults: data.adults,
        children: data.children,
        specialRequests: data.specialRequests,
        notes: data.notes,
      },
      include: {
        guest: true,
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json(
      { error: "Error al actualizar reserva" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar reserva
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      )
    }

    // No eliminar físicamente, solo cambiar estado
    const cancelledReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    })

    return NextResponse.json({
      message: "Reserva cancelada exitosamente",
      reservation: cancelledReservation,
    })
  } catch (error) {
    console.error("Error cancelling reservation:", error)
    return NextResponse.json(
      { error: "Error al cancelar reserva" },
      { status: 500 }
    )
  }
}