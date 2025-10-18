// src/app/(dashboard)/dashboard/reservas/nueva/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, Users, Bed, DollarSign, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AvailabilityOption {
  roomType: {
    id: string
    name: string
    description: string | null
    category: string
    capacity: number
    basePrice: number
    amenities: string[]
  }
  availability: {
    totalRooms: number
    availableRooms: number
    isAvailable: boolean
  }
  pricing: {
    basePrice: number
    nights: number
    totalBasePrice: number
  }
  availableRoomsList: Array<{
    id: string
    number: string
    floor: string | null
    status: string
  }>
}

interface SearchResult {
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  availableOptions: AvailabilityOption[]
  totalOptionsFound: number
}

export default function NuevaReservaPage() {
  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Map<string, string>>(new Map())

  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearchResult(null)
    setSelectedRooms(new Map())

    try {
      const response = await fetch("/api/search-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al buscar disponibilidad")
        return
      }

      setSearchResult(data)
    } catch (error) {
      alert("Error al buscar disponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const handleRoomSelection = (roomTypeId: string, roomId: string) => {
    const newSelection = new Map(selectedRooms)
    if (newSelection.get(roomTypeId) === roomId) {
      newSelection.delete(roomTypeId)
    } else {
      newSelection.set(roomTypeId, roomId)
    }
    setSelectedRooms(newSelection)
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

  const calculateTotal = () => {
    if (!searchResult) return 0
    let total = 0
    selectedRooms.forEach((roomId, roomTypeId) => {
      const option = searchResult.availableOptions.find(
        (opt) => opt.roomType.id === roomTypeId
      )
      if (option) {
        total += option.pricing.totalBasePrice
      }
    })
    return total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nueva Reserva</h1>
          <p className="text-slate-500 mt-1">
            Busca disponibilidad y crea una nueva reserva
          </p>
        </div>
        <Link href="/dashboard/reservas">
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Disponibilidad
          </CardTitle>
          <CardDescription>
            Ingresa las fechas y número de huéspedes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) =>
                    setSearchData({ ...searchData, checkIn: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) =>
                    setSearchData({ ...searchData, checkOut: e.target.value })
                  }
                  min={searchData.checkIn || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adultos *</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="10"
                  value={searchData.adults}
                  onChange={(e) =>
                    setSearchData({ ...searchData, adults: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Niños</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="10"
                  value={searchData.children}
                  onChange={(e) =>
                    setSearchData({ ...searchData, children: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Buscando..." : "Buscar Habitaciones Disponibles"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <>
          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      {formatDate(searchResult.checkIn)} - {formatDate(searchResult.checkOut)}
                    </p>
                    <p className="text-sm text-blue-700">
                      {searchResult.nights} {searchResult.nights === 1 ? "noche" : "noches"} •{" "}
                      {searchResult.adults} {searchResult.adults === 1 ? "adulto" : "adultos"}
                      {searchResult.children > 0 && ` • ${searchResult.children} niños`}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {searchResult.totalOptionsFound} opciones disponibles
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Available Options */}
          {searchResult.availableOptions.length > 0 ? (
            <div className="space-y-4">
              {searchResult.availableOptions.map((option) => (
                <Card key={option.roomType.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {option.roomType.name}
                            </h3>
                            {option.roomType.description && (
                              <p className="text-sm text-slate-600 mt-1">
                                {option.roomType.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {option.availability.availableRooms} disponible
                            {option.availability.availableRooms !== 1 && "s"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Hasta {option.roomType.capacity} personas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            <span>{option.roomType.category}</span>
                          </div>
                        </div>

                        {option.roomType.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {option.roomType.amenities.slice(0, 5).map((amenity, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {option.roomType.amenities.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{option.roomType.amenities.length - 5} más
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Room Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-600">Selecciona habitación:</Label>
                          <div className="flex flex-wrap gap-2">
                            {option.availableRoomsList.map((room) => (
                              <button
                                key={room.id}
                                type="button"
                                onClick={() =>
                                  handleRoomSelection(option.roomType.id, room.id)
                                }
                                className={`px-4 py-2 rounded-md border-2 transition-colors ${
                                  selectedRooms.get(option.roomType.id) === room.id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                                }`}
                              >
                                Hab. {room.number}
                                {room.floor && ` (Piso ${room.floor})`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-600 mb-1">
                          {formatCurrency(option.pricing.basePrice)}/noche
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatCurrency(option.pricing.totalBasePrice)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Total {searchResult.nights} noches
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bed className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay habitaciones disponibles
                </h3>
                <p className="text-slate-500">
                  Intenta con otras fechas o reduce el número de huéspedes
                </p>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          {selectedRooms.size > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">
                      {selectedRooms.size} habitación{selectedRooms.size !== 1 && "es"} seleccionada
                      {selectedRooms.size !== 1 && "s"}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      Total: {formatCurrency(calculateTotal())}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/reservas/nueva/confirmar?data=${encodeURIComponent(
                      JSON.stringify({
                        searchData,
                        searchResult,
                        selectedRooms: Array.from(selectedRooms.entries()),
                      })
                    )}`}
                  >
                    <Button size="lg" className="gap-2">
                      <Plus className="h-5 w-5" />
                      Continuar con la Reserva
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}