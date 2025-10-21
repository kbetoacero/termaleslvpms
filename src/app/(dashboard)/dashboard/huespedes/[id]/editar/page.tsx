// src/app/(dashboard)/dashboard/huespedes/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import GuestForm from "@/components/guests/GuestForm"

async function getGuest(id: string) {
  return await prisma.guest.findUnique({
    where: { id },
  })
}

export default async function EditGuestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guest = await getGuest(id)

  if (!guest) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Huésped</h1>
        <p className="text-slate-500 mt-1">
          Actualiza la información de {guest.firstName} {guest.lastName}
        </p>
      </div>

      <GuestForm initialData={guest} />
    </div>
  )
}