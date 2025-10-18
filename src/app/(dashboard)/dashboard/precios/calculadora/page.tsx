// src/app/(dashboard)/dashboard/precios/calculadora/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Calendar, DollarSign, Info } from "lucide-react"
import Link from "next/link"

interface RoomType {
  id: string
  name: string
  basePrice: number
}

interface DailyPrice {
  date: string
  dayOfWeek: number
  dayName: string
  basePrice: number
  finalPrice: number
  appliedRule: {
    id: string
    name: string
    multiplier: number
    priority: number
    isRecurring: boolean
    recurringType?: string
  } | null
}

interface PriceResult {
  roomType: {
    id: string
    name: string
    basePrice: number
  }
  period: {
    startDate: string
    endDate: string
    nights: number
  }
  pricing: {
    totalBase: number
    totalFinal: number
    totalDiscount: number
    discountPercentage: number
    averagePricePerNight: number
  }
  dailyPrices: DailyPrice[]
  appliedRules: any[]
}

export default function CalculadoraPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PriceResult | null>(null)

  const [formData, setFormData] = useState({
    roomTypeId: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/room-types")
      const data = await response.json()
      setRoomTypes(data)
    } catch (error) {
      console.error("Error fetching room types:", error)
    }
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al calcular precio")
        return
      }

      setResult(data)
    } catch (error) {
      alert("Error al calcular precio")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr))
  }

  const getDayColor = (appliedRule: any) => {
    if (!appliedRule) return "bg-gray-50"
    const multiplier = appliedRule.multiplier
    if (multiplier > 1.2) return "bg-red-50 border-red-200"
    if (multiplier > 1) return "bg-orange-50 border-orange-200"
    if (multiplier < 1) return "bg-green-50 border-green-200"
    return "bg-blue-50 border-blue-200"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calculadora de Precios</h1>
          <p className="text-slate-500 mt-1">
            Simula precios con reglas dinámicas aplicadas
          </p>
        </div>
        <Link href="/dashboard/precios">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Reglas
          </Button>
        </Link>
      </div>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular Precio
          </CardTitle>
          <CardDescription>
            Selecciona tipo de habitación y rango de fechas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Calculando..." : "Calcular Precio"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Noches</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {result.period.nights}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Precio Base</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(result.pricing.totalBase)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">Precio Final</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.pricing.totalFinal)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-slate-500 mb-1">
                    {result.pricing.totalDiscount >= 0 ? "Incremento" : "Descuento"}
                  </div>
                  <div className={`text-2xl font-bold ${result.pricing.totalDiscount >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {result.pricing.totalDiscount >= 0 ? "+" : ""}
                    {formatCurrency(result.pricing.totalDiscount)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.abs(result.pricing.discountPercentage).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">
                    <strong>{result.roomType.name}</strong> - Del{" "}
                    {formatDate(result.period.startDate)} al{" "}
                    {formatDate(result.period.endDate)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Precio promedio por noche:{" "}
                    <strong>{formatCurrency(result.pricing.averagePricePerNight)}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Desglose Diario
              </CardTitle>
              <CardDescription>
                Precio calculado para cada noche con reglas aplicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {result.dailyPrices.map((day, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getDayColor(day.appliedRule)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">
                          {day.dayName} {formatDate(day.date)}
                        </div>
                      </div>
                      {day.appliedRule && (
                        <Badge variant="outline" className="text-xs">
                          {day.appliedRule.multiplier}x
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Base:</span>
                        <span className="line-through text-slate-500">
                          {formatCurrency(day.basePrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Final:</span>
                        <span className="text-lg font-bold text-green-700">
                          {formatCurrency(day.finalPrice)}
                        </span>
                      </div>
                      {day.appliedRule && (
                        <div className="text-xs text-slate-600 mt-2 pt-2 border-t">
                          {day.appliedRule.name}
                          {day.appliedRule.isRecurring && " 🔄"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applied Rules */}
          {result.appliedRules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas Aplicables</CardTitle>
                <CardDescription>
                  Reglas activas que pueden afectar este período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.appliedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          Prioridad {rule.priority}
                        </Badge>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-slate-500">
                            {rule.isRecurring ? (
                              <span>🔄 Recurrente - {rule.recurringType}</span>
                            ) : (
                              <span>
                                {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {rule.multiplier}x
                        </div>
                        <div className="text-xs text-slate-500">
                          {rule.multiplier > 1 ? "+" : ""}
                          {((rule.multiplier - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}