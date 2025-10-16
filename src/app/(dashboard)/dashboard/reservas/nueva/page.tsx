// src/app/(dashboard)/dashboard/reservas/nueva/page.tsx
import { prisma } from "@/lib/prisma"
import NuevaReservaForm from "@/components/reservations/NuevaReservaForm"

async function getData() {
  const [roomTypesRaw, guests] = await Promise.all([
    prisma.roomType.findMany({
      where: { isActive: true },
      include: {
        rooms: {
          where: { status: 'AVAILABLE' },
        },
      },
    }),
    prisma.guest.findMany({
      orderBy: { firstName: 'asc' },
      take: 100,
    }),
  ])

  // Convertir Decimals a números
  const roomTypes = roomTypesRaw.map(rt => ({
    ...rt,
    basePrice: Number(rt.basePrice),
  }))

  return { roomTypes, guests }
}

export default async function NuevaReservaPage() {
  const { roomTypes, guests } = await getData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Reserva</h1>
        <p className="text-slate-500 mt-1">
          Crea una nueva reserva para un huésped
        </p>
      </div>

      <NuevaReservaForm roomTypes={roomTypes} guests={guests} />
    </div>
  )
}