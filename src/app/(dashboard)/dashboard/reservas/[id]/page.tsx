// src/app/(dashboard)/dashboard/reservas/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Calendar,
  Bed,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
} from "lucide-react"
import ReservationActions from "@/components/reservations/ReservationActions"

async function getReservation(id: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      rooms: {
        include: {
          room: {
            include: {
              roomType: true,
            },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      services: {
        include: {
          service: true,
        },
      },
    },
  })

  if (!reservation) return null

  return {
    ...reservation,
    totalAmount: Number(reservation.totalAmount),
    paidAmount: Number(reservation.paidAmount),
    pendingAmount: Number(reservation.pendingAmount),
    rooms: reservation.rooms.map((r) => ({
      ...r,
      nightlyRate: Number(r.nightlyRate),
      subtotal: Number(r.subtotal),
      room: {
        ...r.room,
        roomType: {
          ...r.room.roomType,
          basePrice: Number(r.room.roomType.basePrice),
        },
      },
    })),
    payments: reservation.payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
  }
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reservation = await getReservation(id)

  if (!reservation) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date))
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-700 border-blue-200" },
      CHECKED_IN: { label: "Check-in", color: "bg-green-100 text-green-700 border-green-200" },
      CHECKED_OUT: { label: "Check-out", color: "bg-gray-100 text-gray-700 border-gray-200" },
      CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200" },
      NO_SHOW: { label: "No Show", color: "bg-orange-100 text-orange-700 border-orange-200" },
    }
    const statusInfo = config[status as keyof typeof config]
    return (
      <Badge variant="outline" className={`${statusInfo.color} text-lg px-4 py-2`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const nights = Math.ceil(
    (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reservas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Reserva {reservation.reservationNumber}
            </h1>
            <p className="text-slate-500 mt-1">
              Creada el {formatDateTime(reservation.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(reservation.status)}
        </div>
      </div>

      {/* Actions */}
      <ReservationActions 
        reservation={{
          id: reservation.id,
          status: reservation.status,
          pendingAmount: reservation.pendingAmount,
          totalAmount: reservation.totalAmount,
        }} 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Huésped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-slate-600">Nombre completo</div>
                  <div className="font-semibold text-lg">
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </div>
                </div>
                {reservation.guest.email && (
                  <div>
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </div>
                    <div className="font-medium">{reservation.guest.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </div>
                  <div className="font-medium">{reservation.guest.phone}</div>
                </div>
                {reservation.guest.city && (
                  <div>
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Ciudad
                    </div>
                    <div className="font-medium">{reservation.guest.city}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas de Estadía
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-slate-600">Check-in</div>
                  <div className="font-semibold text-green-700">
                    {formatDate(reservation.checkIn)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Check-out</div>
                  <div className="font-semibold text-red-700">
                    {formatDate(reservation.checkOut)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Noches</div>
                  <div className="font-semibold text-slate-900 text-xl">{nights}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Habitaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reservation.rooms.map((resRoom) => (
                  <div
                    key={resRoom.id}
                    className="p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          Habitación {resRoom.room.number}
                        </div>
                        <div className="text-slate-600">
                          {resRoom.room.roomType.name}
                        </div>
                        {resRoom.room.floor && (
                          <div className="text-sm text-slate-500">
                            Piso {resRoom.room.floor}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">
                          {formatCurrency(resRoom.nightlyRate)}/noche
                        </div>
                        <div className="font-bold text-lg">
                          {formatCurrency(resRoom.subtotal)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {resRoom.nights} noches
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(reservation.specialRequests || reservation.notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas y Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reservation.specialRequests && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">
                      Solicitudes Especiales:
                    </div>
                    <div className="text-slate-600">{reservation.specialRequests}</div>
                  </div>
                )}
                {reservation.notes && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">
                      Notas Internas:
                    </div>
                    <div className="text-slate-600">{reservation.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(reservation.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Pagado:</span>
                  <span className="font-semibold">
                    {formatCurrency(reservation.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Pendiente:</span>
                  <span className="font-semibold">
                    {formatCurrency(reservation.pendingAmount)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {formatCurrency(reservation.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Guest Count */}
              <div className="border-t pt-4">
                <div className="text-sm text-slate-600 mb-2">Huéspedes</div>
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="font-semibold">{reservation.adults}</span>
                  <span className="text-sm">
                    {reservation.adults === 1 ? "adulto" : "adultos"}
                  </span>
                  {reservation.children > 0 && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold">{reservation.children}</span>
                      <span className="text-sm">
                        {reservation.children === 1 ? "niño" : "niños"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          {reservation.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reservation.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between text-sm p-2 bg-slate-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{payment.method}</div>
                        <div className="text-xs text-slate-500">
                          {formatDateTime(payment.createdAt)}
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}