// src/app/(dashboard)/dashboard/habitaciones/tipos/[id]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RoomTypeForm from "@/components/rooms/RoomTypeForm"

async function getRoomType(id: string) {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
  })

  if (!roomType) {
    notFound()
  }

  return {
    ...roomType,
    basePrice: Number(roomType.basePrice),
  }
}

export default async function EditarTipoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const roomType = await getRoomType(id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Editar Tipo de Habitación
        </h1>
        <p className="text-slate-500 mt-1">
          Modifica las características del tipo de habitación
        </p>
      </div>

      <RoomTypeForm initialData={roomType} />
    </div>
  )
}