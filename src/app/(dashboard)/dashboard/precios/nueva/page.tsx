// src/app/(dashboard)/dashboard/precios/nueva/page.tsx
import { prisma } from "@/lib/prisma"
import PriceRuleForm from "@/components/prices/PriceRuleForm"

async function getRoomTypes() {
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      basePrice: true,
    },
    orderBy: { name: 'asc' },
  })

  return roomTypes.map((rt) => ({
    ...rt,
    basePrice: Number(rt.basePrice),
  }))
}

export default async function NewPriceRulePage() {
  const roomTypes = await getRoomTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nueva Regla de Precio</h1>
        <p className="text-slate-500 mt-1">
          Crea una regla para ajustar precios por temporada o fecha
        </p>
      </div>

      <PriceRuleForm roomTypes={roomTypes} />
    </div>
  )
}