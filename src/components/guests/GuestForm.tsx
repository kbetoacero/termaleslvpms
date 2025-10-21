// src/components/guests/GuestForm.tsx
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
import { ArrowLeft, Save, Star } from "lucide-react"
import Link from "next/link"

interface GuestFormProps {
  initialData?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string
    identificationType: string | null
    identificationNumber: string | null
    country: string | null
    city: string | null
    address: string | null
    birthDate: Date | null
    notes: string | null
    isVIP: boolean
  }
}

export default function GuestForm({ initialData }: GuestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    identificationType: initialData?.identificationType || "CC",
    identificationNumber: initialData?.identificationNumber || "",
    country: initialData?.country || "Colombia",
    city: initialData?.city || "",
    address: initialData?.address || "",
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate).toISOString().split("T")[0]
      : "",
    notes: initialData?.notes || "",
    isVIP: initialData?.isVIP || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/guests/${initialData.id}`
        : "/api/guests"

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

      router.push("/dashboard/huespedes")
      router.refresh()
    } catch (error) {
      alert("Error al guardar el huésped")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationType">Tipo de Documento</Label>
              <Select
                value={formData.identificationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, identificationType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="PA">Pasaporte</SelectItem>
                  <SelectItem value="NIT">NIT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber">Número de Documento</Label>
              <Input
                id="identificationNumber"
                value={formData.identificationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identificationNumber: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Preferencias, alergias, comentarios especiales..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVIP"
              checked={formData.isVIP}
              onChange={(e) =>
                setFormData({ ...formData, isVIP: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isVIP" className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Marcar como cliente VIP
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/dashboard/huespedes">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Huésped"}
        </Button>
      </div>
    </form>
  )
}