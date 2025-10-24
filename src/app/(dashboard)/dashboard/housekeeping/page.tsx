// src/app/(dashboard)/housekeeping/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Ban,
  Users,
  ClipboardList,
  TrendingUp,
  Filter,
} from "lucide-react"
import { useHousekeeping } from "@/hooks/useHousekeeping"
import RoomCard from "@/components/housekeeping/RoomCard"
import RoomDetailModal from "@/components/housekeeping/RoomDetailModal"

export default function HousekeepingPage() {
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [floorFilter, setFloorFilter] = useState<string>("")

  const { data, isLoading, updateRoomStatus, createTask } = useHousekeeping({
    status: statusFilter || undefined,
    floor: floorFilter || undefined,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const stats = data?.stats || {
    dirty: 0,
    cleaning: 0,
    clean: 0,
    inspected: 0,
    outOfOrder: 0,
    total: 0,
  }

  const rooms = data?.rooms || []

  // Agrupar habitaciones por piso
  const roomsByFloor = rooms.reduce((acc: any, room: any) => {
    const floor = room.floor || "Sin piso"
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(room)
    return acc
  }, {})

  const floors = Object.keys(roomsByFloor).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            🧹 Housekeeping
          </h1>
          <p className="text-slate-500 mt-1">
            Gestión de limpieza y mantenimiento de habitaciones
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Sucias
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{stats.dirty}</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              En Limpieza
            </CardTitle>
            <Loader2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.cleaning}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Limpias
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.clean}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Inspeccionadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.inspected}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Fuera de Servicio
            </CardTitle>
            <Ban className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.outOfOrder}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              <CardTitle>Filtros</CardTitle>
            </div>
            {(statusFilter || floorFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("")
                  setFloorFilter("")
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de limpieza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="DIRTY">Sucias</SelectItem>
                  <SelectItem value="CLEANING">En Limpieza</SelectItem>
                  <SelectItem value="CLEAN">Limpias</SelectItem>
                  <SelectItem value="INSPECTED">Inspeccionadas</SelectItem>
                  <SelectItem value="OUT_OF_ORDER">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por piso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pisos</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habitaciones por piso */}
      <div className="space-y-6">
        {floors.map((floor) => (
          <Card key={floor}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Piso {floor}</span>
                <Badge variant="secondary">
                  {roomsByFloor[floor].length} habitaciones
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {roomsByFloor[floor].map((room: any) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => setSelectedRoom(room)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onUpdateStatus={updateRoomStatus}
          onCreateTask={createTask}
        />
      )}
    </div>
  )
}