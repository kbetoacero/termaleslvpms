// src/app/(dashboard)/dashboard/habitaciones/[id]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RoomForm from "@/components/rooms/RoomTypeForm"

async function getRoomData(id: string) {
  const [room, roomTypes] = await Promise.all([
    prisma.room.findUnique({
      where: { id },
    }),
    prisma.roomType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!room) {
    notFound()
  }

  const roomTypesConverted = roomTypes.map(rt => ({
    ...rt,
    basePrice: Number(rt.basePrice),
  }))

  return { room, roomTypes: roomTypesConverted }
}

export default async function EditarHabitacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { room, roomTypes } = await getRoomData(id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Editar Habitación {room.number}
        </h1>
        <p className="text-slate-500 mt-1">
          Modifica la información de la habitación
        </p>
      </div>

      <RoomForm roomTypes={roomTypes} initialData={room} />
    </div>
  )
}