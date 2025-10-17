// src/app/(dashboard)/dashboard/habitaciones/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RoomForm from "@/components/rooms/RoomForm"

async function getRoomData(id: string) {
  const [room, roomTypes] = await Promise.all([
    prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
      },
    }),
    prisma.roomType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  // Convertir Decimal a número si room existe
  if (room) {
    return {
      room: {
        ...room,
        roomType: {
          ...room.roomType,
          basePrice: Number(room.roomType.basePrice),
        },
      },
      roomTypes,
    }
  }

  return { room: null, roomTypes }
}

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { room, roomTypes } = await getRoomData(id)

  if (!room) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Habitación</h1>
        <p className="text-slate-500 mt-1">
          Actualiza la información de la habitación {room.number}
        </p>
      </div>

      <RoomForm initialData={room} roomTypes={roomTypes} />
    </div>
  )
}