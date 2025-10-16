// src/app/(dashboard)/dashboard/reservas/[id]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Calendar,
  Bed,
  DollarSign,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import ReservationActions from "@/components/reservations/ReservationActions"

async function getReservation(id: string) {
  const reservationRaw = await prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      user: true,
      rooms: {
        include: {
          room: {
            include: {
              roomType: true,
            },
          },
        },
      },
      services: {
        include: {
          service: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!reservationRaw) {
    notFound()
  }

  // Convertir todos los Decimals a números
  const reservation = {
    ...reservationRaw,
    totalAmount: Number(reservationRaw.totalAmount),
    paidAmount: Number(reservationRaw.paidAmount),
    pendingAmount: Number(reservationRaw.pendingAmount),
    rooms: reservationRaw.rooms.map(r => ({
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
    services: reservationRaw.services.map(s => ({
      ...s,
      unitPrice: Number(s.unitPrice),
      subtotal: Number(s.subtotal),
      service: {
        ...s.service,
        price: Number(s.service.price),
      },
    })),
    payments: reservationRaw.payments.map(p => ({
      ...p,
      amount: Number(p.amount),
    })),
  }

  return reservation
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmada',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
  CHECKED_IN: {
    label: 'Check-in Realizado',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
  },
  CHECKED_OUT: {
    label: 'Check-out Realizado',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'No Show',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
  },
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reservation = await getReservation(id)

  const StatusIcon = statusConfig[reservation.status as keyof typeof statusConfig].icon

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateNights = () => {
    const start = new Date(reservation.checkIn)
    const end = new Date(reservation.checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
              Creada el {new Date(reservation.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${statusConfig[reservation.status as keyof typeof statusConfig].color} text-sm px-3 py-1`}
          >
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusConfig[reservation.status as keyof typeof statusConfig].label}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <ReservationActions reservation={reservation} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Guest Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Huésped
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-500">Nombre Completo</label>
                <p className="text-lg font-semibold">
                  {reservation.guest.firstName} {reservation.guest.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Teléfono</label>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {reservation.guest.phone}
                </p>
              </div>
              {reservation.guest.email && (
                <div>
                  <label className="text-sm text-slate-500">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {reservation.guest.email}
                  </p>
                </div>
              )}
              {reservation.guest.identificationNumber && (
                <div>
                  <label className="text-sm text-slate-500">Documento</label>
                  <p>
                    {reservation.guest.identificationType}{" "}
                    {reservation.guest.identificationNumber}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stay Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen de Estadía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Check-in</label>
              <p className="font-medium">{formatDate(reservation.checkIn)}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Check-out</label>
              <p className="font-medium">{formatDate(reservation.checkOut)}</p>
            </div>
            <div className="pt-2 border-t">
              <label className="text-sm text-slate-500">Duración</label>
              <p className="font-semibold text-lg">
                {calculateNights()} noche{calculateNights() !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Huéspedes</label>
              <p>
                {reservation.adults} adulto{reservation.adults !== 1 ? 's' : ''}
                {reservation.children > 0 &&
                  `, ${reservation.children} niño${reservation.children !== 1 ? 's' : ''}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Habitación Asignada
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservation.rooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {reservation.rooms.map((reservationRoom) => (
                <div
                  key={reservationRoom.id}
                  className="p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {reservationRoom.room.number}
                    </span>
                    <Badge variant="outline">
                      {reservationRoom.room.roomType.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {reservationRoom.room.roomType.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tarifa por noche</span>
                    <span className="font-semibold">
                      {formatCurrency(reservationRoom.nightlyRate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">
                      {formatCurrency(reservationRoom.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No hay habitación asignada</p>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-slate-600">Subtotal Habitación</span>
              <span className="font-semibold">
                {formatCurrency(reservation.totalAmount)}
              </span>
            </div>
            {reservation.services.length > 0 && (
              <>
                <div className="border-t pt-3">
                  <p className="text-sm text-slate-500 mb-2">Servicios Adicionales</p>
                  {reservation.services.map((rs) => (
                    <div key={rs.id} className="flex justify-between text-sm mb-1">
                      <span>
                        {rs.service.name} × {rs.quantity}
                      </span>
                      <span>{formatCurrency(rs.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  {formatCurrency(reservation.totalAmount)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Pagado</span>
              <span className="font-semibold">
                {formatCurrency(reservation.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>Pendiente</span>
              <span className="font-semibold">
                {formatCurrency(reservation.pendingAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments History */}
      {reservation.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reservation.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-slate-500">
                      {payment.method} -{" "}
                      {new Date(payment.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      payment.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}