// src/hooks/useHousekeeping.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface HousekeepingData {
  rooms: any[]
  stats: {
    dirty: number
    cleaning: number
    clean: number
    inspected: number
    outOfOrder: number
    total: number
  }
  tasks: {
    pending: number
    inProgress: number
  }
}

export function useHousekeeping(filters?: {
  status?: string
  floor?: string
  assignedTo?: string
}) {
  const queryClient = useQueryClient()

  // Obtener datos de housekeeping
  const { data, isLoading, error, refetch } = useQuery<HousekeepingData>({
    queryKey: ["housekeeping", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.floor) params.append("floor", filters.floor)
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo)

      const response = await fetch(`/api/housekeeping?${params}`)
      if (!response.ok) throw new Error("Error al cargar datos")
      return response.json()
    },
    refetchInterval: 30000, // Refetch cada 30 segundos
  })

  // Actualizar estado de habitación
  const updateRoomStatus = useMutation({
    mutationFn: async ({ roomId, status, notes }: { roomId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/housekeeping/rooms/${roomId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      })
      if (!response.ok) throw new Error("Error al actualizar estado")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] })
    },
  })

  // Crear tarea de limpieza
  const createTask = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch("/api/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })
      if (!response.ok) throw new Error("Error al crear tarea")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] })
    },
  })

  // Actualizar tarea
  const updateTask = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
      const response = await fetch(`/api/housekeeping/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Error al actualizar tarea")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] })
    },
  })

  return {
    data,
    isLoading,
    error,
    refetch,
    updateRoomStatus,
    createTask,
    updateTask,
  }
}