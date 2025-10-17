"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Bed,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Wrench,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

interface Room {
  id: string
  number: string
  floor: string | null
  roomType: string
  roomTypeId?: string
  capacity?: number
  basePrice?: number
  status: string
}

interface Reservation {
  id: string
  reservationNumber: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  status: string
}

interface OccupiedRoom extends Room {
  reservation: Reservation | null
}

interface DayDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  availability: {
    total: number
    available: number
    occupied: number
    maintenance: number
    cleaning: number
    availableRooms: Room[]
    occupiedRooms: OccupiedRoom[]
    maintenanceRooms: Room[]
  } | null
}

export default function DayDetailModal({
  open,
  onOpenChange,
  date,
  availability,
}: DayDetailModalProps) {
  if (!date || !availability) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      AVAILABLE: { label: "Disponible", color: "bg-green-100 text-green-700" },
      OCCUPIED: { label: "Ocupada", color: "bg-red-100 text-red-700" },
      CLEANING: { label: "Limpieza", color: "bg-yellow-100 text-yellow-700" },
      MAINTENANCE: { label: "Mantenimiento", color: "bg-orange-100 text-orange-700" },
      BLOCKED: { label: "Bloqueada", color: "bg-gray-100 text-gray-700" },
    }
    const statusInfo = config[status as keyof typeof config] || config.AVAILABLE
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  const occupancyPercentage = Math.round(
    (availability.occupied / availability.total) * 100
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            {formatDate(date)}
          </DialogTitle>
          <DialogDescription>
            Detalle de disponibilidad y reservas del día
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 my-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {availability.total}
                </div>
                <div className="text-sm text-slate-500 mt-1">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {availability.available}
                </div>
                <div className="text-sm text-slate-500 mt-1">Disponibles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {availability.occupied}
                </div>
                <div className="text-sm text-slate-500 mt-1">Ocupadas</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {occupancyPercentage}%
                </div>
                <div className="text-sm text-slate-500 mt-1">Ocupación</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Link href="/dashboard/reservas/nueva">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Reserva
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Available Rooms */}
        {availability.availableRooms.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                Habitaciones Disponibles ({availability.availableRooms.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availability.availableRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          <Bed className="h-4 w-4 text-slate-400" />
                          Hab. {room.number}
                        </div>
                        <div className="text-sm text-slate-600">
                          {room.roomType}
                        </div>
                      </div>
                      {getStatusBadge(room.status)}
                    </div>
                    <div className="space-y-1 text-sm">
                      {room.floor && (
                        <div className="text-slate-500">Piso: {room.floor}</div>
                      )}
                      {room.capacity && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="h-3 w-3" />
                          {room.capacity} personas
                        </div>
                      )}
                      {room.basePrice && (
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(room.basePrice)}/noche
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Occupied Rooms */}
        {availability.occupiedRooms.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Bed className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">
                Habitaciones Ocupadas ({availability.occupiedRooms.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {availability.occupiedRooms.map((room) => (
                <Card key={room.id} className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg flex items-center gap-2 mb-1">
                          <Bed className="h-4 w-4 text-red-600" />
                          Hab. {room.number}
                          <span className="text-sm font-normal text-slate-600">
                            - {room.roomType}
                          </span>
                        </div>
                        {room.reservation && (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {room.reservation.reservationNumber}
                              </Badge>
                              {getStatusBadge(room.reservation.status)}
                            </div>
                            <div className="flex items-center gap-4 text-slate-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Check-in:{" "}
                                {new Date(
                                  room.reservation.checkIn
                                ).toLocaleDateString("es-CO")}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Check-out:{" "}
                                {new Date(
                                  room.reservation.checkOut
                                ).toLocaleDateString("es-CO")}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Users className="h-3 w-3" />
                              {room.reservation.adults} adultos
                              {room.reservation.children > 0 &&
                                `, ${room.reservation.children} niños`}
                            </div>
                          </div>
                        )}
                      </div>
                      <Link href={`/dashboard/reservas/${room.reservation?.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Reserva
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance & Cleaning */}
        {(availability.maintenanceRooms.length > 0 ||
          availability.cleaning > 0) && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">
                Mantenimiento & Limpieza
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availability.maintenanceRooms.map((room) => (
                <Card key={room.id} className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          {room.status === "CLEANING" ? (
                            <Sparkles className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Wrench className="h-4 w-4 text-orange-600" />
                          )}
                          Hab. {room.number}
                        </div>
                        <div className="text-sm text-slate-600">
                          {room.roomType}
                        </div>
                      </div>
                      {getStatusBadge(room.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {availability.availableRooms.length === 0 &&
          availability.occupiedRooms.length === 0 &&
          availability.maintenanceRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">
                No hay información de habitaciones para este día
              </p>
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}