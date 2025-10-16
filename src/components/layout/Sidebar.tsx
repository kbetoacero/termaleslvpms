"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarRange,
  Bed,
  Users,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  Settings,
  Tent,
  Waves,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Reservas",
    href: "/dashboard/reservas",
    icon: CalendarRange,
    badge: "12",
  },
  {
    title: "Habitaciones",
    href: "/dashboard/habitaciones",
    icon: Bed,
  },
  {
    title: "Pasadías",
    href: "/dashboard/pasadias",
    icon: Waves,
  },
  {
    title: "Camping",
    href: "/dashboard/camping",
    icon: Tent,
  },
  {
    title: "Huéspedes",
    href: "/dashboard/huespedes",
    icon: Users,
  },
  {
    title: "Restaurante",
    href: "/dashboard/restaurante",
    icon: UtensilsCrossed,
  },
  {
    title: "Pagos",
    href: "/dashboard/pagos",
    icon: CreditCard,
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-gradient-to-b from-slate-50 to-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
              <Waves className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">Termales</span>
              <span className="text-xs text-slate-500">Paradise PMS</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg mx-auto">
            <Waves className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border bg-white shadow-md hover:bg-slate-100"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="space-y-1 p-3 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-slate-100",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-600")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div>
              <div className="font-medium text-slate-700">Sistema activo</div>
              <div>v1.0.0</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}