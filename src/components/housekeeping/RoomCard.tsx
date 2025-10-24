// src/components/housekeeping/RoomCard.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bed, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Ban
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomCardProps {
  room: any
  onClick: () => void
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      DIRTY: {
        color: "bg-red-100 border-red-300 text-red-700",
        icon: AlertCircle,
        label: "Sucia",
        badgeColor: "bg-red-500",
      },
      CLEANING: {
        color: "bg-yellow-100 border-yellow-300 text-yellow-700",
        icon: Loader2,
        label: "En Limpieza",
        badgeColor: "bg-yellow-500",
      },
      CLEAN: {
        color: "bg-green-100 border-green-300 text-green-700",
        icon: CheckCircle2,
        label: "Limpia",
        badgeColor: "bg-green-500",
      },
      INSPECTED: {
        color: "bg-blue-100 border-blue-300 text-blue-700",
        icon: CheckCircle2,
        label: "Inspeccionada",
        badgeColor: "bg-blue-500",
      },
      OUT_OF_ORDER: {
        color: "bg-slate-200 border-slate-400 text-slate-700",
        icon: Ban,
        label: "Fuera de Servicio",
        badgeColor: "bg-slate-500",
      },
    }
    return configs[status as keyof typeof configs] || configs.DIRTY
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: "bg-slate-100 text-slate-600",
      NORMAL: "bg-blue-100 text-blue-600",
      HIGH: "bg-orange-100 text-orange-600",
      URGENT: "bg-red-100 text-red-600",
    }
    const labels = {
      LOW: "Baja",
      NORMAL: "Normal",
      HIGH: "Alta",
      URGENT: "Urgente",
    }
    return { 
      className: badges[priority as keyof typeof badges],
      label: labels[priority as keyof typeof labels]
    }
  }

  const statusConfig = getStatusConfig(room.cleaningStatus)
  const StatusIcon = statusConfig.icon
  const currentTask = room.housekeepingTasks?.[0]
  const currentReservationRoom = room.reservations?.[0]
  const currentGuest = currentReservationRoom?.reservation?.guest

  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
        "border-2",
        statusConfig.color
      )}
      onClick={onClick}
    >
      {/* Badge de estado en la esquina */}
      <div className="absolute -top-2 -right-2">
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          statusConfig.badgeColor
        )}>
          <StatusIcon className="h-3 w-3 text-white" />
        </div>
      </div>

      <div className="p-3">
        {/* Número de habitación */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span className="text-xl font-bold">{room.number}</span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {room.roomType?.name?.slice(0, 3)}
          </Badge>
        </div>

        {/* Estado */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-medium">{statusConfig.label}</span>
        </div>

        {/* Información adicional */}
        <div className="space-y-1 text-[10px] text-slate-600">
          {/* Huésped actual */}
          {currentGuest && (
            <div className="flex items-center gap-1 truncate">
              <User className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">
                {currentGuest.firstName} {currentGuest.lastName}
              </span>
            </div>
          )}

          {/* Asignado a */}
          {currentTask?.assignedTo && (
            <div className="flex items-center gap-1 truncate">
              <User className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{currentTask.assignedTo.name}</span>
            </div>
          )}

          {/* Prioridad */}
          {currentTask && currentTask.priority !== "NORMAL" && (
            <Badge 
              className={cn("text-[9px] px-1 py-0", getPriorityBadge(currentTask.priority).className)}
              variant="outline"
            >
              {getPriorityBadge(currentTask.priority).label}
            </Badge>
          )}

          {/* Última limpieza */}
          {room.lastCleaned && (
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              <span>
                {new Date(room.lastCleaned).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}