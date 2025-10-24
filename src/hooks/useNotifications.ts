// src/hooks/useNotifications.ts
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
  metadata?: any
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient()

  // Obtener notificaciones
  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (unreadOnly) params.append("unreadOnly", "true")
      
      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) throw new Error("Error al cargar notificaciones")
      return response.json()
    },
    refetchInterval: 30000, // Refetch cada 30 segundos
  })

  // Marcar como leída
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
      if (!response.ok) throw new Error("Error al marcar como leída")
      return response.json()
    },
    onSuccess: () => {
      // Invalidar queries para refrescar
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  // Marcar todas como leídas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
      if (!response.ok) throw new Error("Error al marcar todas como leídas")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  }
}