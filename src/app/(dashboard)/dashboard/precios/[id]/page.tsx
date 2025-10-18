// src/app/(dashboard)/dashboard/precios/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PriceRuleForm from "@/components/prices/PriceRuleForm"

async function getPriceRule(id: string) {
  const rule = await prisma.priceRule.findUnique({
    where: { id },
    include: {
      roomType: true,
    },
  })

  if (!rule) return null

  // Convertir TODOS los Decimals a números
  return {
    ...rule,
    multiplier: Number(rule.multiplier),
    roomType: {
      ...rule.roomType,
      basePrice: Number(rule.roomType.basePrice),
    },
  }
}

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

export default async function EditPriceRulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [rule, roomTypes] = await Promise.all([
    getPriceRule(id),
    getRoomTypes(),
  ])

  if (!rule) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Regla de Precio</h1>
        <p className="text-slate-500 mt-1">
          Actualiza la información de la regla: {rule.name}
        </p>
      </div>

      <PriceRuleForm initialData={rule} roomTypes={roomTypes} />
    </div>
  )
}