// src/app/(dashboard)/dashboard/calendario/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import DayDetailModal from "@/components/calendar/DayDetailModal"

interface RoomType {
  id: string
  name: string
}

interface DayAvailability {
  date: string
  total: number
  available: number
  occupied: number
  maintenance: number
  cleaning: number
  availableRooms: any[]
  occupiedRooms: any[]
  maintenanceRooms: any[]
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  useEffect(() => {
    fetchAvailability()
  }, [currentDate, selectedRoomType])

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("/api/room-types")
      const data = await response.json()
      setRoomTypes(data)
    } catch (error) {
      console.error("Error fetching room types:", error)
    }
  }

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const params = new URLSearchParams({
        start: firstDay.toISOString().split("T")[0],
        end: lastDay.toISOString().split("T")[0],
      })

      if (selectedRoomType !== "all") {
        params.append("roomTypeId", selectedRoomType)
      }

      const response = await fetch(`/api/availability?${params}`)
      const data = await response.json()
      setAvailability(data.availability || [])
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAvailabilityForDate = (date: Date | null) => {
    if (!date) return null
    const dateStr = date.toISOString().split("T")[0]
    return availability.find((a) => a.date.startsWith(dateStr))
  }

  const handleDayClick = (date: Date | null) => {
    console.log("Day clicked:", date)
    if (!date) return
    const dayAvailability = getAvailabilityForDate(date)
    console.log("Day availability:", dayAvailability)
    if (dayAvailability) {
      setSelectedDay(date)
      setModalOpen(true)
      console.log("Modal should open now")
    } else {
      console.log("No availability data for this day")
    }
  }

  const getOccupancyColor = (occupied: number, total: number) => {
    if (total === 0) return "bg-gray-100"
    const percentage = (occupied / total) * 100
    if (percentage === 0) return "bg-green-100 border-green-300"
    if (percentage < 50) return "bg-yellow-100 border-yellow-300"
    if (percentage < 100) return "bg-orange-100 border-orange-300"
    return "bg-red-100 border-red-300"
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendario de Disponibilidad</h1>
          <p className="text-slate-500 mt-1">
            Visualiza la ocupación de habitaciones
          </p>
        </div>
        <Button onClick={goToToday} variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Hoy
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[200px] text-center font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300" />
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-100 border-2 border-yellow-300" />
              <span className="text-sm">Ocupación baja (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-100 border-2 border-orange-300" />
              <span className="text-sm">Ocupación alta (50-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-300" />
              <span className="text-sm">Completo (100%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Cargando disponibilidad...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-slate-600 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((date, index) => {
                const dayAvailability = getAvailabilityForDate(date)
                const today = isToday(date)

                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(date)}
                    className={`
                      aspect-square border-2 rounded-lg p-2 hover:shadow-md transition-all cursor-pointer
                      ${today ? "ring-2 ring-blue-500" : ""}
                      ${
                        dayAvailability
                          ? getOccupancyColor(
                              dayAvailability.occupied,
                              dayAvailability.total
                            )
                          : "bg-gray-50 border-gray-200"
                      }
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-semibold ${today ? "text-blue-600" : ""}`}>
                        {date.getDate()}
                      </div>
                      {dayAvailability && (
                        <div className="flex-1 flex flex-col justify-end text-xs space-y-1">
                          <div className="font-semibold text-green-700">
                            {dayAvailability.available} disp
                          </div>
                          {dayAvailability.occupied > 0 && (
                            <div className="text-red-700">
                              {dayAvailability.occupied} ocup
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Detail Modal */}
      <DayDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDay}
        availability={getAvailabilityForDate(selectedDay)}
      />
    </div>
  )
}