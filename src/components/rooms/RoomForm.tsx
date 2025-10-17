"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface RoomFormProps {
  initialData?: {
    id: string
    number: string
    floor: string | null
    roomTypeId: string
    status: string
    notes: string | null
  }
  roomTypes: Array<{
    id: string
    name: string
  }>
}

export default function RoomForm({ initialData, roomTypes }: RoomFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    number: initialData?.number || "",
    floor: initialData?.floor || "",
    roomTypeId: initialData?.roomTypeId || "",
    status: initialData?.status || "AVAILABLE",
    notes: initialData?.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/rooms/${initialData.id}`
        : "/api/rooms"

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al guardar")
        return
      }

      router.push("/dashboard/habitaciones")
      router.refresh()
    } catch (error) {
      alert("Error al guardar la habitación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Habitación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">Número de Habitación *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                placeholder="Ej: 101, A-1, Cabaña 5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Piso / Ubicación</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                placeholder="Ej: 1, 2, Planta Baja"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomTypeId">Tipo de Habitación *</Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomTypeId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                  <SelectItem value="CLEANING">Limpieza</SelectItem>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  <SelectItem value="BLOCKED">Bloqueada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas / Observaciones</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Información adicional sobre la habitación..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/dashboard/habitaciones">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading
            ? "Guardando..."
            : initialData
            ? "Actualizar Habitación"
            : "Crear Habitación"}
        </Button>
      </div>
    </form>
  )
}