"use client"

import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNotifications } from "@/hooks/useNotifications"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getNotificationIcon = (type: string) => {
    // Puedes agregar diferentes iconos según el tipo
    return "📌"
  }

  const handleNotificationClick = async (notification: any) => {
    // Marcar como leída
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id)
    }
    
    // Navegar si tiene link
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: es 
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-6">
      {/* Search */}
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar reservas, huéspedes, habitaciones..."
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <span className="text-green-600 font-semibold">85%</span>
          </div>
          <div>
            <div className="text-xs text-slate-500">Ocupación</div>
            <div className="font-semibold text-slate-700">Hoy</div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <span className="text-blue-600 font-semibold">12</span>
          </div>
          <div>
            <div className="text-xs text-slate-500">Check-ins</div>
            <div className="font-semibold text-slate-700">Hoy</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2">
              <DropdownMenuLabel className="p-0">
                Notificaciones
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => markAllAsRead.mutate()}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="p-2 space-y-2">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        notification.isRead 
                          ? "hover:bg-slate-50" 
                          : "bg-blue-50 hover:bg-blue-100 border-blue-200"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? "text-blue-900" : "text-slate-900"
                        }`}>
                          {getNotificationIcon(notification.type)} {notification.title}
                        </p>
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center text-blue-600 cursor-pointer"
                  onClick={() => router.push("/dashboard/notificaciones")}
                >
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 pl-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-slate-500">{user?.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}