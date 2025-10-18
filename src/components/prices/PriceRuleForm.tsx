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
import { ArrowLeft, Save, Info } from "lucide-react"
import Link from "next/link"

interface PriceRuleFormProps {
  initialData?: {
    id: string
    name: string
    roomTypeId: string
    startDate: Date
    endDate: Date
    multiplier: number
    priority: number
    isActive: boolean
  }
  roomTypes: Array<{
    id: string
    name: string
    basePrice: number
  }>
}

export default function PriceRuleForm({ initialData, roomTypes }: PriceRuleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    roomTypeId: initialData?.roomTypeId || "",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : "",
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
      : "",
    multiplier: initialData?.multiplier || 1.0,
    priority: initialData?.priority || 0,
    isActive: initialData?.isActive ?? true,
    isRecurring: false,
    recurringType: "CUSTOM",
    daysOfWeek: [] as number[],
    recurringEndDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData
        ? `/api/price-rules/${initialData.id}`
        : "/api/price-rules"

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

      router.push("/dashboard/precios")
      router.refresh()
    } catch (error) {
      alert("Error al guardar la regla de precio")
    } finally {
      setLoading(false)
    }
  }

  const selectedRoomType = roomTypes.find((rt) => rt.id === formData.roomTypeId)
  const estimatedPrice = selectedRoomType
    ? Math.round(selectedRoomType.basePrice * formData.multiplier)
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Regla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre de la Regla *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Temporada Alta Diciembre, Fin de Semana"
                required
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
                      {type.name} - {formatCurrency(type.basePrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Prioridad (0-100)
                <span className="text-xs text-slate-500 ml-2">Mayor = más importante</span>
              </Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="multiplier">
                Multiplicador de Precio *
                <span className="text-xs text-slate-500 ml-2">
                  1.0 = precio base, 1.5 = +50%, 0.8 = -20%
                </span>
              </Label>
              <Input
                id="multiplier"
                type="number"
                min="0.01"
                max="10"
                step="0.01"
                value={formData.multiplier}
                onChange={(e) =>
                  setFormData({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurrencia Card */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <span>🔄</span>
            Recurrencia (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) =>
                setFormData({ ...formData, isRecurring: e.target.checked })
              }
              className="w-4 h-4 text-purple-600"
            />
            <Label htmlFor="isRecurring" className="font-semibold">
              Esta regla se repite
            </Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Tipo de Recurrencia</Label>
                <Select
                  value={formData.recurringType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recurringType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Semanal (todos los días)</SelectItem>
                    <SelectItem value="CUSTOM">Días específicos de la semana</SelectItem>
                    <SelectItem value="MONTHLY">Mensual (mismo día)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.recurringType === "WEEKLY" || formData.recurringType === "CUSTOM") && (
                <div className="space-y-2">
                  <Label>Días de la semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 0, label: "Dom" },
                      { value: 1, label: "Lun" },
                      { value: 2, label: "Mar" },
                      { value: 3, label: "Mié" },
                      { value: 4, label: "Jue" },
                      { value: 5, label: "Vie" },
                      { value: 6, label: "Sáb" },
                    ].map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const days = formData.daysOfWeek.includes(day.value)
                            ? formData.daysOfWeek.filter((d) => d !== day.value)
                            : [...formData.daysOfWeek, day.value]
                          setFormData({ ...formData, daysOfWeek: days.sort() })
                        }}
                        className={`px-4 py-2 rounded-md border-2 transition-colors font-semibold ${
                          formData.daysOfWeek.includes(day.value)
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-slate-700 border-slate-300 hover:border-purple-400"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Selecciona los días en los que se aplicará la regla
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="recurringEndDate">
                  Fecha fin de recurrencia (opcional)
                </Label>
                <Input
                  id="recurringEndDate"
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, recurringEndDate: e.target.value })
                  }
                />
                <p className="text-xs text-slate-500">
                  Deja vacío para que se repita indefinidamente
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <p className="text-sm text-purple-900 font-semibold mb-2">
                  💡 Ejemplos de uso:
                </p>
                <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Fines de semana:</strong> Marca Vie y Sáb para precio especial todos los fines de semana
                  </li>
                  <li>
                    <strong>Temporada alta:</strong> Deja sin marcar "se repite" para un período único
                  </li>
                  <li>
                    <strong>Miércoles de descuento:</strong> Marca solo Mié con multiplicador 0.8
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      {selectedRoomType && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Vista Previa del Precio
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-blue-600">Precio Base</div>
                    <div className="text-lg font-bold text-blue-900">
                      {formatCurrency(selectedRoomType.basePrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-600">Multiplicador</div>
                    <div className="text-lg font-bold text-blue-900">
                      {formData.multiplier}x
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-600">Precio Final</div>
                    <div className="text-lg font-bold text-green-700">
                      {formatCurrency(estimatedPrice)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {formData.multiplier > 1 && (
                    <span>
                      Incremento de {formatCurrency(estimatedPrice - selectedRoomType.basePrice)} (
                      {((formData.multiplier - 1) * 100).toFixed(0)}%)
                    </span>
                  )}
                  {formData.multiplier < 1 && (
                    <span>
                      Descuento de {formatCurrency(selectedRoomType.basePrice - estimatedPrice)} (
                      {((1 - formData.multiplier) * 100).toFixed(0)}%)
                    </span>
                  )}
                  {formData.multiplier === 1 && <span>Sin cambio en el precio</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado */}
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
            <Label htmlFor="isActive">Regla activa</Label>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Las reglas inactivas no se aplicarán en el cálculo de precios
          </p>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex justify-between">
        <Link href="/dashboard/precios">
          <Button type="button" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Regla"}
        </Button>
      </div>
    </form>
  )
}