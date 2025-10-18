// src/app/api/reservations/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Función helper para generar número de reserva
function generateReservationNumber() {
  const prefix = "RES"
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}-${random}`
}

// GET - Obtener todas las reservas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const guestId = searchParams.get("guestId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (guestId) {
      where.guestId = guestId
    }

    if (from && to) {
      where.checkIn = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
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
        payments: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Convertir Decimals a números
    const reservationsConverted = reservations.map((reservation) => ({
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
    }))

    return NextResponse.json(reservationsConverted)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva reserva
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      guestId,
      checkIn,
      checkOut,
      adults,
      children,
      rooms, // Array de { roomId, nightlyRate }
      specialRequests,
      notes,
      userId,
    } = data

    // Validaciones
    if (!guestId || !checkIn || !checkOut || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "La fecha de check-out debe ser posterior al check-in" },
        { status: 400 }
      )
    }

    // Calcular noches
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Verificar disponibilidad de las habitaciones
    for (const roomData of rooms) {
      const existingReservations = await prisma.reservationRoom.findMany({
        where: {
          roomId: roomData.roomId,
          reservation: {
            OR: [
              {
                checkIn: { lt: checkOutDate },
                checkOut: { gt: checkInDate },
              },
            ],
            status: {
              notIn: ["CANCELLED", "NO_SHOW"],
            },
          },
        },
      })

      if (existingReservations.length > 0) {
        const room = await prisma.room.findUnique({
          where: { id: roomData.roomId },
        })
        return NextResponse.json(
          {
            error: `La habitación ${room?.number} no está disponible en las fechas seleccionadas`,
          },
          { status: 400 }
        )
      }
    }

    // Calcular totales
    let totalAmount = 0
    const roomsWithSubtotal = rooms.map((room: any) => {
      const subtotal = parseFloat(room.nightlyRate) * nights
      totalAmount += subtotal
      return {
        ...room,
        nights,
        subtotal,
      }
    })

    // Crear reserva
    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber: generateReservationNumber(),
        type: "HABITACION",
        status: "PENDING",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: parseInt(adults),
        children: parseInt(children) || 0,
        guestId,
        userId: userId || "system", // TODO: Obtener del usuario autenticado
        totalAmount,
        paidAmount: 0,
        pendingAmount: totalAmount,
        specialRequests,
        notes,
        rooms: {
          create: roomsWithSubtotal.map((room: any) => ({
            roomId: room.roomId,
            nightlyRate: parseFloat(room.nightlyRate),
            nights,
            subtotal: room.subtotal,
          })),
        },
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
    }

    return NextResponse.json(reservationConverted, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      { error: "Error al crear reserva" },
      { status: 500 }
    )
  }
}