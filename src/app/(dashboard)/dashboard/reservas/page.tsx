// src/app/(dashboard)/dashboard/reservas/page.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Users, Bed, DollarSign, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getReservationsData() {
  const [reservations, stats] = await Promise.all([
    prisma.reservation.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
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
      },
    }),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  // Convertir Decimals
  const reservationsConverted = reservations.map((res) => ({
    ...res,
    totalAmount: Number(res.totalAmount),
    paidAmount: Number(res.paidAmount),
    pendingAmount: Number(res.pendingAmount),
  }))

  const statsMap = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count
    return acc
  }, {} as Record<string, number>)

  return { reservations: reservationsConverted, stats: statsMap }
}

export default async function ReservasPage() {
  const { reservations, stats } = await getReservationsData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reservas</h1>
          <p className="text-slate-500 mt-1">
            Gestiona todas las reservas del hotel
          </p>
        </div>
        <Link href="/dashboard/reservas/nueva">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {reservations.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.PENDING || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.CONFIRMED || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Confirmadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.CHECKED_IN || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Check-in</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.CHECKED_OUT || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Check-out</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.CANCELLED || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Canceladas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
          <CardDescription>
            {reservations.length} reservas registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Huésped</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Habitaciones</TableHead>
                <TableHead>Huéspedes</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="font-mono text-sm font-semibold text-blue-600">
                        {reservation.reservationNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reservation.guest.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(reservation.checkIn)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(reservation.checkOut)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Bed className="h-3 w-3 text-slate-400" />
                        {reservation.rooms.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-slate-400" />
                        {reservation.adults}
                        {reservation.children > 0 && ` +${reservation.children}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(reservation.totalAmount)}
                      </div>
                      {reservation.pendingAmount > 0 && (
                        <div className="text-xs text-red-600">
                          Pendiente: {formatCurrency(reservation.pendingAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/reservas/${reservation.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No hay reservas registradas</p>
                    <Link href="/dashboard/reservas/nueva">
                      <Button className="mt-4" variant="outline">
                        Crear Primera Reserva
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}