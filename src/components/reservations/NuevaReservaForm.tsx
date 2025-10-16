"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, User, Bed, DollarSign, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface RoomType {
  id: string
  name: string
  category: string
  capacity: number
  basePrice: number
  rooms: { id: string; number: string; status: string }[]
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface Props {
  roomTypes: RoomType[]
  guests: Guest[]
}

export default function NuevaReservaForm({ roomTypes, guests }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Form state
  const [selectedGuest, setSelectedGuest] = useState("")
  const [newGuest, setNewGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [selectedRoomType, setSelectedRoomType] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")

  const selectedRoomTypeData = roomTypes.find((rt) => rt.id === selectedRoomType)
  const availableRooms = selectedRoomTypeData?.rooms || []

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = () => {
    if (!selectedRoomTypeData) return 0
    const nights = calculateNights()
    return Number(selectedRoomTypeData.basePrice) * nights
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear huésped si es nuevo
      let guestId = selectedGuest

      if (!guestId && newGuest.firstName && newGuest.lastName) {
        const guestResponse = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGuest),
        })

        if (!guestResponse.ok) throw new Error("Error al crear huésped")
        const guestData = await guestResponse.json()
        guestId = guestData.id
      }

      // Crear reserva
      const reservationData = {
        guestId,
        roomId: selectedRoom,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        adults: parseInt(adults),
        children: parseInt(children),
        totalAmount: calculateTotal(),
      }

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) throw new Error("Error al crear reserva")

      const data = await response.json()
      router.push(`/dashboard/reservas/${data.id}`)
    } catch (error) {
      console.error("Error:", error)
      alert("Hubo un error al crear la reserva. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step >= s
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-24 ${
                      step > s ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className={step >= 1 ? "text-blue-600 font-medium" : "text-slate-500"}>
              Huésped
            </span>
            <span className={step >= 2 ? "text-blue-600 font-medium" : "text-slate-500"}>
              Habitación & Fechas
            </span>
            <span className={step >= 3 ? "text-blue-600 font-medium" : "text-slate-500"}>
              Confirmación
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Guest Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Huésped
            </CardTitle>
            <CardDescription>
              Selecciona un huésped existente o crea uno nuevo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Huésped Existente</Label>
              <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar huésped..." />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName} - {guest.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">O crear nuevo</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={newGuest.firstName}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, firstName: e.target.value })
                  }
                  disabled={!!selectedGuest}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={newGuest.lastName}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, lastName: e.target.value })
                  }
                  disabled={!!selectedGuest}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, email: e.target.value })
                  }
                  disabled={!!selectedGuest}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={newGuest.phone}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, phone: e.target.value })
                  }
                  disabled={!!selectedGuest}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedGuest && (!newGuest.firstName || !newGuest.lastName || !newGuest.phone)}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Room & Dates */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Habitación y Fechas
            </CardTitle>
            <CardDescription>
              Selecciona la habitación y las fechas de estadía
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Habitación *</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - ${type.basePrice.toLocaleString()}/noche
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Habitación *</Label>
                <Select
                  value={selectedRoom}
                  onValueChange={setSelectedRoom}
                  disabled={!selectedRoomType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar habitación..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Habitación {room.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out *</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adultos *</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="6"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Niños</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="4"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedRoomType || !selectedRoom || !checkIn || !checkOut}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumen de la Reserva
            </CardTitle>
            <CardDescription>
              Revisa los detalles antes de confirmar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Huésped</h3>
                <div className="text-sm text-slate-600">
                  {selectedGuest
                    ? guests.find((g) => g.id === selectedGuest)?.firstName +
                      " " +
                      guests.find((g) => g.id === selectedGuest)?.lastName
                    : `${newGuest.firstName} ${newGuest.lastName}`}
                </div>
                <div className="text-sm text-slate-500">
                  {selectedGuest
                    ? guests.find((g) => g.id === selectedGuest)?.phone
                    : newGuest.phone}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Habitación</h3>
                <div className="text-sm text-slate-600">
                  {selectedRoomTypeData?.name}
                </div>
                <div className="text-sm text-slate-500">
                  Habitación{" "}
                  {availableRooms.find((r) => r.id === selectedRoom)?.number}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Fechas</h3>
                <div className="text-sm text-slate-600">
                  Check-in: {new Date(checkIn).toLocaleDateString("es-ES")}
                </div>
                <div className="text-sm text-slate-600">
                  Check-out: {new Date(checkOut).toLocaleDateString("es-ES")}
                </div>
                <div className="text-sm text-slate-500">
                  {calculateNights()} noche{calculateNights() !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Huéspedes</h3>
                <div className="text-sm text-slate-600">
                  {adults} adulto{parseInt(adults) !== 1 ? "s" : ""}
                </div>
                {parseInt(children) > 0 && (
                  <div className="text-sm text-slate-600">
                    {children} niño{parseInt(children) !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${calculateTotal().toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {selectedRoomTypeData?.basePrice.toLocaleString()}/noche × {calculateNights()}{" "}
                noche{calculateNights() !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  "Creando..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back to list */}
      <div className="flex justify-start">
        <Link href="/dashboard/reservas">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </Button>
        </Link>
      </div>
    </form>
  )
}