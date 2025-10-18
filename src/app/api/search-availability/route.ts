// src/app/api/search-availability/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { checkIn, checkOut, adults, children, roomTypeId } = await request.json()

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Se requieren fechas de check-in y check-out" },
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

    // Obtener tipos de habitación
    const roomTypesQuery: any = {
      isActive: true,
    }

    if (roomTypeId) {
      roomTypesQuery.id = roomTypeId
    }

    // Filtrar por capacidad si se especifica
    if (adults) {
      roomTypesQuery.capacity = {
        gte: parseInt(adults) + (children ? parseInt(children) : 0),
      }
    }

    const roomTypes = await prisma.roomType.findMany({
      where: roomTypesQuery,
      include: {
        rooms: {
          where: {
            status: {
              in: ["AVAILABLE", "CLEANING"],
            },
          },
          include: {
            reservations: {
              where: {
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
              include: {
                reservation: true,
              },
            },
          },
        },
      },
      orderBy: { basePrice: "asc" },
    })

    // Procesar disponibilidad
    const availability = roomTypes.map((roomType) => {
      // Filtrar habitaciones disponibles (sin reservas en el período)
      const availableRooms = roomType.rooms.filter((room) => {
        return room.reservations.length === 0
      })

      // Calcular precio con reglas dinámicas
      const basePrice = Number(roomType.basePrice)
      const totalBasePrice = basePrice * nights

      return {
        roomType: {
          id: roomType.id,
          name: roomType.name,
          description: roomType.description,
          category: roomType.category,
          capacity: roomType.capacity,
          basePrice,
          amenities: roomType.amenities,
          images: roomType.images,
        },
        availability: {
          totalRooms: roomType.rooms.length,
          availableRooms: availableRooms.length,
          isAvailable: availableRooms.length > 0,
        },
        pricing: {
          basePrice,
          nights,
          totalBasePrice,
          // El precio final se calculará con la API de calculate-price
        },
        availableRoomsList: availableRooms.map((room) => ({
          id: room.id,
          number: room.number,
          floor: room.floor,
          status: room.status,
        })),
      }
    })

    // Filtrar solo los que tienen disponibilidad
    const availableOptions = availability.filter((opt) => opt.availability.isAvailable)

    return NextResponse.json({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      nights,
      adults: parseInt(adults) || 1,
      children: parseInt(children) || 0,
      availableOptions,
      totalOptionsFound: availableOptions.length,
    })
  } catch (error) {
    console.error("Error searching availability:", error)
    return NextResponse.json(
      { error: "Error al buscar disponibilidad" },
      { status: 500 }
    )
  }
}