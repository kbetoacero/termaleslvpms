// src/app/(dashboard)/dashboard/reservas/nueva/confirmar/page.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, User, Phone, Mail, FileText } from "lucide-react"
import Link from "next/link"

function ConfirmReservationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [reservationData, setReservationData] = useState<any>(null)

  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    identificationType: "CC",
    identificationNumber: "",
    country: "Colombia",
    city: "",
    specialRequests: "",
    notes: "",
  })

  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam))
        setReservationData(decoded)
      } catch (error) {
        console.error("Error parsing reservation data:", error)
        router.push("/dashboard/reservas/nueva")
      }
    } else {
      router.push("/dashboard/reservas/nueva")
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Crear o buscar huésped
      let guestId = null

      // Buscar si ya existe el huésped por email o teléfono
      const searchGuestResponse = await fetch(
        `/api/guests?email=${guestData.email}&phone=${guestData.phone}`
      )
      const existingGuests = await searchGuestResponse.json()

      if (existingGuests.length > 0) {
        guestId = existingGuests[0].id
      } else {
        // Crear nuevo huésped
        const createGuestResponse = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guestData),
        })

        if (!createGuestResponse.ok) {
          throw new Error("Error al crear huésped")
        }

        const newGuest = await createGuestResponse.json()
        guestId = newGuest.id
      }

      // 2. Calcular precios con reglas dinámicas para cada habitación
      const roomsWithPricing = await Promise.all(
        reservationData.selectedRooms.map(async ([roomTypeId, roomId]: [string, string]) => {
          const option = reservationData.searchResult.availableOptions.find(
            (opt: any) => opt.roomType.id === roomTypeId
          )

          // Calcular precio con reglas dinámicas
          const priceResponse = await fetch("/api/calculate-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomTypeId,
              startDate: reservationData.searchData.checkIn,
              endDate: reservationData.searchData.checkOut,
            }),
          })

          const priceData = await priceResponse.json()
          const nightlyRate = priceData.pricing.averagePricePerNight

          return {
            roomId,
            nightlyRate,
          }
        })
      )

      // 3. Crear reserva
      const createReservationResponse = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          checkIn: reservationData.searchData.checkIn,
          checkOut: reservationData.searchData.checkOut,
          adults: reservationData.searchData.adults,
          children: reservationData.searchData.children,
          rooms: roomsWithPricing,
          specialRequests: guestData.specialRequests,
          notes: guestData.notes,
          userId: "current-user", // TODO: Get from session
        }),
      })

      if (!createReservationResponse.ok) {
        const error = await createReservationResponse.json()
        throw new Error(error.error || "Error al crear reserva")
      }

      const newReservation = await createReservationResponse.json()

      // 4. Redirigir al detalle de la reserva
      router.push(`/dashboard/reservas/${newReservation.id}`)
    } catch (error: any) {
      alert(error.message || "Error al crear la reserva")
    } finally {
      setLoading(false)
    }
  }

  if (!reservationData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Cargando...</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateTotal = () => {
    let total = 0
    reservationData.selectedRooms.forEach(([roomTypeId]: [string, string]) => {
      const option = reservationData.searchResult.availableOptions.find(
        (opt: any) => opt.roomType.id === roomTypeId
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
          <h1 className="text-3xl font-bold text-slate-900">Confirmar Reserva</h1>
          <p className="text-slate-500 mt-1">
            Completa los datos del huésped
          </p>
        </div>
        <Link href="/dashboard/reservas/nueva">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos del Huésped
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={guestData.firstName}
                      onChange={(e) =>
                        setGuestData({ ...guestData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={guestData.lastName}
                      onChange={(e) =>
                        setGuestData({ ...guestData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestData.email}
                      onChange={(e) =>
                        setGuestData({ ...guestData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={guestData.phone}
                      onChange={(e) =>
                        setGuestData({ ...guestData, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identificationNumber">Documento de Identidad</Label>
                    <Input
                      id="identificationNumber"
                      value={guestData.identificationNumber}
                      onChange={(e) =>
                        setGuestData({
                          ...guestData,
                          identificationNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={guestData.city}
                      onChange={(e) =>
                        setGuestData({ ...guestData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
                    <Textarea
                      id="specialRequests"
                      value={guestData.specialRequests}
                      onChange={(e) =>
                        setGuestData({ ...guestData, specialRequests: e.target.value })
                      }
                      placeholder="Ej: Cama adicional, vista al jardín, etc."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notas Internas</Label>
                    <Textarea
                      id="notes"
                      value={guestData.notes}
                      onChange={(e) =>
                        setGuestData({ ...guestData, notes: e.target.value })
                      }
                      placeholder="Notas para el personal del hotel"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Creando Reserva..." : "Confirmar y Crear Reserva"}
            </Button>
          </form>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-in:</span>
                  <span className="font-medium">
                    {new Date(reservationData.searchData.checkIn).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-out:</span>
                  <span className="font-medium">
                    {new Date(reservationData.searchData.checkOut).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Noches:</span>
                  <span className="font-medium">{reservationData.searchResult.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Huéspedes:</span>
                  <span className="font-medium">
                    {reservationData.searchData.adults} adultos
                    {reservationData.searchData.children > 0 &&
                      ` + ${reservationData.searchData.children} niños`}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm">Habitaciones:</h4>
                {reservationData.selectedRooms.map(([roomTypeId, roomId]: [string, string]) => {
                  const option = reservationData.searchResult.availableOptions.find(
                    (opt: any) => opt.roomType.id === roomTypeId
                  )
                  const room = option?.availableRoomsList.find((r: any) => r.id === roomId)
                  return (
                    <div key={roomId} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          Hab. {room?.number} - {option?.roomType.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{formatCurrency(option?.pricing.basePrice)}/noche</span>
                        <span>{formatCurrency(option?.pricing.totalBasePrice)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmReservationPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmReservationContent />
    </Suspense>
  )
}