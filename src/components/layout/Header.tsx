"use client"

import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react"
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

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function Header({ user }: HeaderProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <div className="rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">Nueva reserva</p>
                  <span className="text-xs text-slate-500">Hace 5 min</span>
                </div>
                <p className="text-xs text-slate-600">
                  Juan Pérez - Habitación 205
                </p>
              </div>
              <div className="rounded-lg border p-3 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium">Check-in pendiente</p>
                  <span className="text-xs text-slate-500">Hace 15 min</span>
                </div>
                <p className="text-xs text-slate-600">
                  María García - Suite 301
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-blue-600">
              Ver todas las notificaciones
            </DropdownMenuItem>
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
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