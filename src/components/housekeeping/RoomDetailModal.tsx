// src/components/housekeeping/RoomDetailModal.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Bed, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

interface RoomDetailModalProps {
  room: any
  onClose: () => void
  onUpdateStatus: any
  onCreateTask: any
}

export default function RoomDetailModal({
  room,
  onClose,
  onUpdateStatus,
  onCreateTask,
}: RoomDetailModalProps) {
  const [newStatus, setNewStatus] = useState(room.cleaningStatus)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const statusOptions = [
    { value: "DIRTY", label: "Sucia", color: "red" },
    { value: "CLEANING", label: "En Limpieza", color: "yellow" },
    { value: "CLEAN", label: "Limpia", color: "green" },
    { value: "INSPECTED", label: "Inspeccionada", color: "blue" },
    { value: "OUT_OF_ORDER", label: "Fuera de Servicio", color: "slate" },
  ]

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    try {
      await onUpdateStatus.mutateAsync({
        roomId: room.id,
        status: newStatus,
        notes: notes || undefined,
      })
      toast.success("Estado actualizado correctamente")
      setNotes("")
      onClose()
    } catch (error) {
      toast.error("Error al actualizar estado")
    } finally {
      setIsUpdating(false)
    }
  }

  const currentTask = room.housekeepingTasks?.[0]
  const currentReservationRoom = room.reservations?.[0]
  const currentGuest = currentReservationRoom?.reservation

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Habitación {room.number}
            <Badge variant="outline">{room.roomType?.name}</Badge>
          </DialogTitle>
          <DialogDescription>
            Gestión de limpieza y mantenimiento
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Estado</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* Tab: Estado */}
          <TabsContent value="status" className="space-y-4">
            {/* Estado actual */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Estado Actual
              </div>
              <Badge className="text-base px-3 py-1">
                {statusOptions.find(s => s.value === room.cleaningStatus)?.label}
              </Badge>
            </div>

            {/* Cambiar estado */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Nuevo Estado
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Notas (opcional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar observaciones..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === room.cleaningStatus}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Estado"
                )}
              </Button>
            </div>

            {/* Acciones rápidas */}
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Acciones Rápidas
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setNewStatus("CLEANING")
                    setIsUpdating(true)
                    try {
                      await onUpdateStatus.mutateAsync({
                        roomId: room.id,
                        status: "CLEANING",
                      })
                      toast.success("Limpieza iniciada")
                      onClose()
                    } catch (error) {
                      toast.error("Error al actualizar")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={room.cleaningStatus === "CLEANING" || isUpdating}
                >
                  Iniciar Limpieza
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setNewStatus("CLEAN")
                    setIsUpdating(true)
                    try {
                      await onUpdateStatus.mutateAsync({
                        roomId: room.id,
                        status: "CLEAN",
                      })
                      toast.success("Habitación marcada como limpia")
                      onClose()
                    } catch (error) {
                      toast.error("Error al actualizar")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={room.cleaningStatus === "CLEAN" || isUpdating}
                >
                  Marcar Limpia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setNewStatus("INSPECTED")
                    setIsUpdating(true)
                    try {
                      await onUpdateStatus.mutateAsync({
                        roomId: room.id,
                        status: "INSPECTED",
                      })
                      toast.success("Habitación inspeccionada")
                      onClose()
                    } catch (error) {
                      toast.error("Error al actualizar")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={room.cleaningStatus === "INSPECTED" || isUpdating}
                >
                  Inspeccionar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setNewStatus("OUT_OF_ORDER")
                    setIsUpdating(true)
                    try {
                      await onUpdateStatus.mutateAsync({
                        roomId: room.id,
                        status: "OUT_OF_ORDER",
                      })
                      toast.success("Habitación fuera de servicio")
                      onClose()
                    } catch (error) {
                      toast.error("Error al actualizar")
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={room.cleaningStatus === "OUT_OF_ORDER" || isUpdating}
                >
                  Fuera de Servicio
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Información */}
          <TabsContent value="info" className="space-y-4">
            {/* Huésped actual */}
            {currentGuest && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Huésped Actual
                  </span>
                </div>
                <div className="text-sm text-blue-800">
                  {currentGuest.guest.firstName} {currentGuest.guest.lastName}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Check-in: {new Date(currentGuest.checkIn).toLocaleDateString("es-ES")}
                  {" - "}
                  Check-out: {new Date(currentGuest.checkOut).toLocaleDateString("es-ES")}
                </div>
              </div>
            )}

            {/* Tarea actual */}
            {currentTask && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    Tarea Activa
                  </span>
                </div>
                {currentTask.assignedTo && (
                  <div className="text-sm text-yellow-800">
                    Asignado a: {currentTask.assignedTo.name}
                  </div>
                )}
                {currentTask.notes && (
                  <div className="text-xs text-yellow-600 mt-1">
                    {currentTask.notes}
                  </div>
                )}
              </div>
            )}

            {/* Detalles de la habitación */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Tipo:</span>
                <span className="font-medium">{room.roomType?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Piso:</span>
                <span className="font-medium">{room.floor || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Capacidad:</span>
                <span className="font-medium">{room.roomType?.capacity} personas</span>
              </div>
              {room.lastCleaned && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Última limpieza:</span>
                  <span className="font-medium">
                    {new Date(room.lastCleaned).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Historial */}
          <TabsContent value="history" className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <Clock className="h-12 w-12 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600">
                Historial de limpieza próximamente...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}