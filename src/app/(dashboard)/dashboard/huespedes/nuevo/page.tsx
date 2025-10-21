// src/app/(dashboard)/dashboard/huespedes/nuevo/page.tsx
import GuestForm from "@/components/guests/GuestForm"

export default function NewGuestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nuevo Huésped</h1>
        <p className="text-slate-500 mt-1">
          Registra un nuevo cliente en el sistema
        </p>
      </div>

      <GuestForm />
    </div>
  )
}