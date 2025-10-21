// src/app/(dashboard)/dashboard/huespedes/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  Edit,
  Bed,
} from "lucide-react"
import DeleteGuestButton from "@/components/guests/DeleteGuestButton"

async function getGuest(id: string) {
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          rooms: {
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!guest) return null

  return {
    ...guest,
    reservations: guest.reservations.map((res) => ({
      ...res,
      totalAmount: Number(res.totalAmount),
      paidAmount: Number(res.paidAmount),
      pendingAmount: Number(res.pendingAmount),
    })),
  }
}

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guest = await getGuest(id)

  if (!guest) {
    notFound()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date))
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
      PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-700" },
      CHECKED_IN: { label: "Check-in", color: "bg-green-100 text-green-700" },
      CHECKED_OUT: { label: "Check-out", color: "bg-gray-100 text-gray-700" },
      CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
    }
    const statusInfo = config[status as keyof typeof config] || config.PENDING
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/huespedes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {guest.firstName} {guest.lastName}
              {guest.isVIP && <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
            </h1>
            <p className="text-slate-500 mt-1">
              Cliente desde {formatDate(guest.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/huespedes/${guest.id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <DeleteGuestButton
            guestId={guest.id}
            guestName={`${guest.firstName} ${guest.lastName}`}
            hasReservations={guest.reservations.length > 0}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {guest.email && (
                  <div>
                    <div className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </div>
                    <div className="font-medium">{guest.email}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </div>
                  <div className="font-medium">{guest.phone}</div>
                </div>
                {guest.identificationNumber && (
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Documento</div>
                    <div className="font-medium">
                      {guest.identificationType}: {guest.identificationNumber}
                    </div>
                  </div>
                )}
                {guest.birthDate && (
                  <div>
                    <div className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      Fecha de Nacimiento
                    </div>
                    <div className="font-medium">{formatDate(guest.birthDate)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {(guest.country || guest.city || guest.address) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guest.country && (
                  <div>
                    <span className="text-sm text-slate-600">País: </span>
                    <span className="font-medium">{guest.country}</span>
                  </div>
                )}
                {guest.city && (
                  <div>
                    <span className="text-sm text-slate-600">Ciudad: </span>
                    <span className="font-medium">{guest.city}</span>
                  </div>
                )}
                {guest.address && (
                  <div>
                    <span className="text-sm text-slate-600">Dirección: </span>
                    <span className="font-medium">{guest.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {guest.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{guest.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Reservations History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              {guest.reservations.length > 0 ? (
                <div className="space-y-3">
                  {guest.reservations.map((reservation) => (
                    <Link
                      key={reservation.id}
                      href={`/dashboard/reservas/${reservation.id}`}
                    >
                      <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-mono text-sm font-semibold text-blue-600">
                              {reservation.reservationNumber}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Bed className="h-4 w-4" />
                            {reservation.rooms.length} habitación
                            {reservation.rooms.length !== 1 && "es"}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(reservation.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay reservas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Reservas</div>
                <div className="text-3xl font-bold text-slate-900">
                  {guest.reservations.length}
                </div>
              </div>
              {guest.reservations.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <div className="text-sm text-slate-600 mb-1">Última Reserva</div>
                    <div className="font-medium">
                      {formatDate(guest.reservations[0].createdAt)}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-slate-600 mb-1">Total Gastado</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        guest.reservations.reduce((sum, res) => sum + res.totalAmount, 0)
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/reservas/nueva?guestId=${guest.id}`}>
                <Button className="w-full" variant="outline">
                  Nueva Reserva
                </Button>
              </Link>
              <Link href={`/dashboard/huespedes/${guest.id}/editar`}>
                <Button className="w-full" variant="outline">
                  Editar Información
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}