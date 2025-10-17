// src/app/(dashboard)/dashboard/habitaciones/nueva/page.tsx
import { prisma } from "@/lib/prisma"
import RoomForm from "@/components/rooms/RoomForm"

async function getRoomTypes() {
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  return roomTypes
}

export default async function NewRoomPage() {
  const roomTypes = await getRoomTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Habitación</h1>
        <p className="text-slate-500 mt-1">
          Registra una nueva habitación en el inventario
        </p>
      </div>

      <RoomForm roomTypes={roomTypes} />
    </div>
  )
}