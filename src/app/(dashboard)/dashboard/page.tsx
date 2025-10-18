// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Estadísticas de reservas
  const totalReservations = await prisma.reservation.count()
  const todayCheckIns = await prisma.reservation.count({
    where: {
      checkIn: {
        gte: today,
        lt: tomorrow,
      },
      status: 'CONFIRMED',
    },
  })

  const todayCheckOuts = await prisma.reservation.count({
    where: {
      checkOut: {
        gte: today,
        lt: tomorrow,
      },
      status: 'CHECKED_IN',
    },
  })

  const activeReservations = await prisma.reservation.count({
    where: {
      status: 'CHECKED_IN',
    },
  })

  // Estadísticas de habitaciones
  const totalRooms = await prisma.room.count()
  const occupiedRooms = await prisma.room.count({
    where: {
      status: 'OCCUPIED',
    },
  })

  // Huéspedes
  const totalGuests = await prisma.guest.count()

  // Últimas reservas
  const recentReservations = await prisma.reservation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      guest: true,
    },
  })

  // Próximos check-ins
  const upcomingCheckIns = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: today,
      },
      status: 'CONFIRMED',
    },
    take: 5,
    orderBy: { checkIn: 'asc' },
    include: {
      guest: true,
    },
  })

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  return {
    totalReservations,
    todayCheckIns,
    todayCheckOuts,
    activeReservations,
    totalRooms,
    occupiedRooms,
    occupancyRate,
    totalGuests,
    recentReservations,
    upcomingCheckIns,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const data = await getDashboardData()

  const stats = [
    {
      title: "Ocupación",
      value: `${data.occupancyRate.toFixed(0)}%`,
      description: `${data.occupiedRooms} de ${data.totalRooms} habitaciones`,
      icon: Bed,
      trend: "+12%",
      trendUp: true,
      color: "blue",
    },
    {
      title: "Check-ins Hoy",
      value: data.todayCheckIns.toString(),
      description: "Llegadas programadas",
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Check-outs Hoy",
      value: data.todayCheckOuts.toString(),
      description: "Salidas programadas",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Huéspedes Activos",
      value: data.activeReservations.toString(),
      description: "Actualmente en el hotel",
      icon: Users,
      trend: "+8%",
      trendUp: true,
      color: "purple",
    },
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
      CHECKED_IN: "bg-green-100 text-green-700 border-green-200",
      CHECKED_OUT: "bg-gray-100 text-gray-700 border-gray-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    }
    const labels = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmada",
      CHECKED_IN: "Check-in",
      CHECKED_OUT: "Check-out",
      CANCELLED: "Cancelada",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          ¡Bienvenido, {session.user?.name}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Aquí está el resumen de hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-500">{stat.description}</p>
                  {stat.trend && (
                    <span className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Últimas Reservas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Últimas Reservas</CardTitle>
                <CardDescription>Reservas más recientes del sistema</CardDescription>
              </div>
              <Link href="/dashboard/reservas">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReservations.length > 0 ? (
                data.recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay reservas recientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Check-ins */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Check-ins</CardTitle>
                <CardDescription>Llegadas programadas próximamente</CardDescription>
              </div>
              <Link href="/dashboard/calendario">
                <Button variant="outline" size="sm">
                  Ver calendario
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.upcomingCheckIns.length > 0 ? (
                data.upcomingCheckIns.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold">
                        {reservation.guest.firstName.charAt(0)}{reservation.guest.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(reservation.checkIn)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">
                        {reservation.adults} {reservation.adults === 1 ? 'huésped' : 'huéspedes'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay check-ins programados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/reservas/nueva">
              <Button className="h-20 flex flex-col gap-2 w-full" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Nueva Reserva</span>
              </Button>
            </Link>
            <Link href="/dashboard/reservas?filter=checkin">
              <Button className="h-20 flex flex-col gap-2 w-full" variant="outline">
                <CheckCircle2 className="h-6 w-6" />
                <span>Check-in</span>
              </Button>
            </Link>
            <Link href="/dashboard/reservas?filter=checkout">
              <Button className="h-20 flex flex-col gap-2 w-full" variant="outline">
                <Clock className="h-6 w-6" />
                <span>Check-out</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}