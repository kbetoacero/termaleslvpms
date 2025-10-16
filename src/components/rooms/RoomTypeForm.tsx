"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import Link from "next/link"

interface RoomTypeFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    category: string
    capacity: number
    basePrice: number
    amenities: string[]
    isActive: boolean
  }
}

export default function RoomTypeForm({ initialData }: RoomTypeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "HABITACION",
    capacity: initialData?.capacity || 2,
    basePrice: initialData?.basePrice || 0,
    amenities: initialData?.amenities || [],
    isActive: initialData?.isActive ?? true,
  })

  const [newAmenity, setNewAmenity] = useState("")

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      })
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/room-types/${initialData.id}`
        : "/api/room-types"

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      router.push("/dashboard/habitaciones")
      router.refresh()
    } catch (error) {
      alert("Error al guardar el tipo de habitación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Tipo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Suite Presidential"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HABITACION">Habitación</SelectItem>
                  <SelectItem value="CAMPING">Camping</SelectItem>
                  <SelectItem value="GLAMPING">Glamping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción breve del tipo de habitación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad (personas) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice">Precio Base por Noche *</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="1000"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: parseFloat(e.target.value) })
                }
                placeholder="Ej: 150000"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Ej: WiFi, TV, Aire acondicionado..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddAmenity()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAmenity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="hover:bg-blue-100 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isActive">Tipo de habitación activo</Label>
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
          {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Tipo"}
        </Button>
      </div>
    </form>
  )
}