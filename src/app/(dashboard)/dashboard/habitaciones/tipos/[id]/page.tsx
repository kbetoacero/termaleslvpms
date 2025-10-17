// src/app/(dashboard)/dashboard/habitaciones/tipos/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RoomTypeForm from "@/components/rooms/RoomTypeForm"

async function getRoomType(id: string) {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
    include: {
      rooms: true,
    },
  })

  if (!roomType) {
    return null
  }

  // Convertir Decimal a número
  return {
    ...roomType,
    basePrice: Number(roomType.basePrice),
  }
}

export default async function EditRoomTypePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const roomType = await getRoomType(id)

  if (!roomType) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Tipo de Habitación</h1>
        <p className="text-slate-500 mt-1">
          Actualiza la información del tipo: {roomType.name}
        </p>
      </div>

      <RoomTypeForm initialData={roomType} />
    </div>
  )
}