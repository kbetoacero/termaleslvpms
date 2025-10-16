// src/app/(dashboard)/dashboard/reservas/page.tsx
import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Calendar, Eye, Edit, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

async function getReservations(params: { search?: string; status?: string; type?: string }) {
  try {
    const { search, status, type } = params

    const where: any = {}

    if (search) {
      where.OR = [
        { reservationNumber: { contains: search } },
        { guest: { firstName: { contains: search } } },
        { guest: { lastName: { contains: search } } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (type && type !== 'all') {
      where.type = type
    }

    const reservations = await prisma.reservation.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const stats = {
      total: await prisma.reservation.count(),
      pending: await prisma.reservation.count({ where: { status: 'PENDING' } }),
      confirmed: await prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      checkedIn: await prisma.reservation.count({ where: { status: 'CHECKED_IN' } }),
      checkedOut: await prisma.reservation.count({ where: { status: 'CHECKED_OUT' } }),
    }

    return { reservations, stats }
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return {
      reservations: [],
      stats: { total: 0, pending: 0, confirmed: 0, checkedIn: 0, checkedOut: 0 }
    }
  }
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  CHECKED_IN: { label: 'Check-in', color: 'bg-green-100 text-green-700 border-green-200' },
  CHECKED_OUT: { label: 'Check-out', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700 border-red-200' },
  NO_SHOW: { label: 'No Show', color: 'bg-red-100 text-red-700 border-red-200' },
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; type?: string }>
}) {
  const params = await searchParams
  const { reservations, stats } = await getReservations(params)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.checkedOut}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                placeholder="Buscar por número, nombre del huésped..."
                className="pl-10"
                defaultValue={params.search}
              />
            </div>
            <Select name="status" defaultValue={params.status || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                <SelectItem value="CHECKED_IN">Check-in</SelectItem>
                <SelectItem value="CHECKED_OUT">Check-out</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select name="type" defaultValue={params.type || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="HABITACION">Habitación</SelectItem>
                <SelectItem value="PASADIA">Pasadía</SelectItem>
                <SelectItem value="CAMPING">Camping</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Huésped</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Habitación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.reservationNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {reservation.guest.email || reservation.guest.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                    <TableCell>{formatDate(reservation.checkOut)}</TableCell>
                    <TableCell>
                      {reservation.rooms.length > 0
                        ? reservation.rooms[0].room.number
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[reservation.status as keyof typeof statusConfig].color}
                      >
                        {statusConfig[reservation.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(reservation.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/reservas/${reservation.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No se encontraron reservas</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Intenta ajustar los filtros o crear una nueva reserva
                    </p>
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