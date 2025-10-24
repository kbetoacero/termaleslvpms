// src/app/dashboard/(dashboard)/habitaciones/page.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bed, DollarSign, Users, Edit, Home, Sparkles } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DeleteRoomButton from "@/components/rooms/DeleteRoomButton"
import DeleteRoomTypeButton from "@/components/rooms/DeleteRoomTypeButton"

async function getRoomsData() {
  const [roomTypes, rooms] = await Promise.all([
    prisma.roomType.findMany({
      include: {
        rooms: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.room.findMany({
      include: {
        roomType: true,
        housekeepingTasks: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"],
            },
          },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { number: 'asc' },
    }),
  ])

  // Convertir Decimals a números
  const roomTypesConverted = roomTypes.map(rt => ({
    ...rt,
    basePrice: Number(rt.basePrice),
  }))

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE' && r.cleaningStatus === 'CLEAN').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    cleaning: rooms.filter(r => r.cleaningStatus === 'CLEANING' || r.cleaningStatus === 'DIRTY').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  }

  return { roomTypes: roomTypesConverted, rooms, stats }
}

const statusConfig = {
  AVAILABLE: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
  OCCUPIED: { label: 'Ocupada', color: 'bg-red-100 text-red-700' },
  CLEANING: { label: 'Limpieza', color: 'bg-yellow-100 text-yellow-700' },
  MAINTENANCE: { label: 'Mantenimiento', color: 'bg-orange-100 text-orange-700' },
  BLOCKED: { label: 'Bloqueada', color: 'bg-gray-100 text-gray-700' },
}

const cleaningStatusConfig = {
  DIRTY: { label: 'Sucia', color: 'bg-red-50 text-red-700 border-red-200' },
  CLEANING: { label: 'En Limpieza', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CLEAN: { label: 'Limpia', color: 'bg-green-50 text-green-700 border-green-200' },
  INSPECTED: { label: 'Inspeccionada', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  OUT_OF_ORDER: { label: 'Fuera de Servicio', color: 'bg-slate-50 text-slate-700 border-slate-200' },
}

export default async function HabitacionesPage() {
  const { roomTypes, rooms, stats } = await getRoomsData()

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
          <h1 className="text-3xl font-bold text-slate-900">Habitaciones</h1>
          <p className="text-slate-500 mt-1">
            Gestiona tipos de habitaciones e inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/housekeeping">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Housekeeping
            </Button>
          </Link>
          <Link href="/dashboard/habitaciones/tipos/nueva">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Tipo
            </Button>
          </Link>
          <Link href="/dashboard/habitaciones/nueva">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Habitación
            </Button>
          </Link>
        </div>
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
            <CardTitle className="text-sm font-medium text-slate-600">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-slate-500 mt-1">Limpias y listas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Limpieza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.cleaning}</div>
            <p className="text-xs text-slate-500 mt-1">Sucias o en proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Habitación</CardTitle>
          <CardDescription>
            {roomTypes.length} tipos configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((type) => (
              <div
                key={type.id}
                className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </div>
                  <Badge variant={type.isActive ? "default" : "secondary"}>
                    {type.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Capacidad: {type.capacity} personas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(type.basePrice)}/noche
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-slate-400" />
                    <span>{type.rooms.length} habitaciones</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/dashboard/habitaciones/tipos/${type.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <DeleteRoomTypeButton
                    roomTypeId={type.id}
                    roomTypeName={type.name}
                    hasRooms={type.rooms.length > 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Habitaciones</CardTitle>
          <CardDescription>
            {rooms.length} habitaciones registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Piso</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Precio/Noche</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Limpieza</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-bold text-lg">
                      {room.number}
                    </TableCell>
                    <TableCell>{room.roomType.name}</TableCell>
                    <TableCell>{room.floor || '-'}</TableCell>
                    <TableCell>{room.roomType.capacity} personas</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(room.roomType.basePrice))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[room.status as keyof typeof statusConfig].color}
                      >
                        {statusConfig[room.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={cleaningStatusConfig[room.cleaningStatus as keyof typeof cleaningStatusConfig].color}
                        >
                          {cleaningStatusConfig[room.cleaningStatus as keyof typeof cleaningStatusConfig].label}
                        </Badge>
                        {room.housekeepingTasks.length > 0 && (
                          <span className="text-xs text-slate-500">
                            Tarea pendiente
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/habitaciones/${room.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteRoomButton
                          roomId={room.id}
                          roomNumber={room.number}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Bed className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No hay habitaciones registradas</p>
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