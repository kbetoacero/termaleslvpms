// src/app/(dashboard)/dashboard/habitaciones/tipos/nueva/page.tsx
import RoomTypeForm from "@/components/rooms/RoomTypeForm"

export default function NuevoTipoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nuevo Tipo de Habitación</h1>
        <p className="text-slate-500 mt-1">
          Crea un nuevo tipo de habitación con sus características
        </p>
      </div>

      <RoomTypeForm />
    </div>
  )
}