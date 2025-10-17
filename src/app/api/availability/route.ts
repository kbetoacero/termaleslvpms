// src/app/api/availability/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")
    const roomTypeId = searchParams.get("roomTypeId")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Se requieren fechas de inicio y fin" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Obtener todas las habitaciones (filtradas por tipo si se especifica)
    const rooms = await prisma.room.findMany({
      where: roomTypeId ? { roomTypeId } : {},
      include: {
        roomType: true,
        reservations: {
          include: {
            reservation: true,
          },
          where: {
            reservation: {
              OR: [
                {
                  checkIn: { lte: end },
                  checkOut: { gte: start },
                },
              ],
              status: {
                notIn: ["CANCELLED", "NO_SHOW"],
              },
            },
          },
        },
      },
      orderBy: { number: "asc" },
    })

    // Convertir Decimals a números
    const roomsConverted = rooms.map((room) => ({
      ...room,
      roomType: {
        ...room.roomType,
        basePrice: Number(room.roomType.basePrice),
      },
    }))

    // Calcular disponibilidad por día
    const availability = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const availableRooms = roomsConverted.filter((room) => {
        // Verificar si está disponible (no ocupada, no en mantenimiento, etc.)
        if (room.status !== "AVAILABLE" && room.status !== "CLEANING") {
          return false
        }

        // Verificar si no tiene reservas en este día
        const hasReservation = room.reservations.some((res) => {
          const checkIn = new Date(res.reservation.checkIn)
          const checkOut = new Date(res.reservation.checkOut)
          return checkIn <= dayEnd && checkOut >= dayStart
        })

        return !hasReservation
      })

      const occupiedRooms = roomsConverted.filter((room) => {
        return room.reservations.some((res) => {
          const checkIn = new Date(res.reservation.checkIn)
          const checkOut = new Date(res.reservation.checkOut)
          return checkIn <= dayEnd && checkOut >= dayStart
        })
      })

      const maintenanceRooms = roomsConverted.filter(
        (room) => room.status === "MAINTENANCE" || room.status === "BLOCKED"
      )

      availability.push({
        date: dayStart.toISOString(),
        total: roomsConverted.length,
        available: availableRooms.length,
        occupied: occupiedRooms.length,
        maintenance: maintenanceRooms.length,
        cleaning: roomsConverted.filter((r) => r.status === "CLEANING").length,
        availableRooms: availableRooms.map((r) => ({
          id: r.id,
          number: r.number,
          floor: r.floor,
          roomType: r.roomType.name,
          roomTypeId: r.roomType.id,
          capacity: r.roomType.capacity,
          basePrice: r.roomType.basePrice,
          status: r.status,
        })),
        occupiedRooms: occupiedRooms.map((r) => {
          const reservation = r.reservations[0]?.reservation
          return {
            id: r.id,
            number: r.number,
            floor: r.floor,
            roomType: r.roomType.name,
            capacity: r.roomType.capacity,
            reservation: reservation ? {
              id: reservation.id,
              reservationNumber: reservation.reservationNumber,
              checkIn: reservation.checkIn,
              checkOut: reservation.checkOut,
              adults: reservation.adults,
              children: reservation.children,
              status: reservation.status,
            } : null,
          }
        }),
        maintenanceRooms: maintenanceRooms.map((r) => ({
          id: r.id,
          number: r.number,
          floor: r.floor,
          roomType: r.roomType.name,
          status: r.status,
        })),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      rooms: roomsConverted,
      availability,
      summary: {
        totalRooms: roomsConverted.length,
        avgOccupancy:
          availability.reduce((acc, day) => acc + day.occupied, 0) /
          availability.length,
      },
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Error al obtener disponibilidad" },
      { status: 500 }
    )
  }
}