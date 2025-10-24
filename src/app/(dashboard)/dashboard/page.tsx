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
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { startOfMonth, endOfMonth, subMonths, subDays, eachDayOfInterval, format } from "date-fns"
import DashboardCharts from "@/components/dashboard/DashboardCharts"

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const currentMonthStart = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)
  const lastMonthStart = startOfMonth(subMonths(today, 1))
  const lastMonthEnd = endOfMonth(subMonths(today, 1))

  // Estadísticas básicas
  const totalRooms = await prisma.room.count()
  const occupiedRooms = await prisma.room.count({
    where: { status: 'OCCUPIED' }
  })

  const todayCheckIns = await prisma.reservation.count({
    where: {
      checkIn: { gte: today, lt: tomorrow },
      status: 'CONFIRMED',
    },
  })

  const todayCheckOuts = await prisma.reservation.count({
    where: {
      checkOut: { gte: today, lt: tomorrow },
      status: 'CHECKED_IN',
    },
  })

  // Ingresos
  const currentMonthRevenue = await prisma.payment.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    _sum: { amount: true },
  })

  const lastMonthRevenue = await prisma.payment.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
    },
    _sum: { amount: true },
  })

  const currentRevenue = Number(currentMonthRevenue._sum.amount || 0)
  const lastRevenue = Number(lastMonthRevenue._sum.amount || 0)
  const revenueTrend = lastRevenue > 0 
    ? ((currentRevenue - lastRevenue) / lastRevenue * 100)
    : 0

  // Pagos pendientes
  const pendingPayments = await prisma.reservation.aggregate({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
      pendingAmount: { gt: 0 },
    },
    _sum: { pendingAmount: true },
    _count: true,
  })

  // Últimas reservas
  const recentReservations = await prisma.reservation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { guest: true },
  })

  // Próximos check-ins
  const upcomingCheckIns = await prisma.reservation.findMany({
    where: {
      checkIn: { gte: today },
      status: 'CONFIRMED',
    },
    take: 5,
    orderBy: { checkIn: 'asc' },
    include: { guest: true },
  })

  // Datos para gráficas (últimos 30 días)
  const startDate = subDays(today, 30)
  const dateRange = eachDayOfInterval({ start: startDate, end: today })

  // Ingresos diarios
  const dailyPayments = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: startDate },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  })

  const revenueChartData = dateRange.map(date => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayTotal = dailyPayments
      .filter(p => format(new Date(p.createdAt), "yyyy-MM-dd") === dateStr)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    
    return {
      date: format(date, "dd/MM"),
      amount: dayTotal,
    }
  })

  // Top clientes
  const topGuests = await prisma.guest.findMany({
    take: 5,
    include: {
      reservations: {
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
        },
        select: {
          paidAmount: true,
        },
      },
    },
  })

  const guestsWithRevenue = topGuests
    .map(guest => ({
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      isVIP: guest.isVIP,
      totalSpent: guest.reservations.reduce((sum, res) => sum + Number(res.paidAmount || 0), 0),
      reservationCount: guest.reservations.length,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  return {
    totalRooms,
    occupiedRooms,
    occupancyRate,
    todayCheckIns,
    todayCheckOuts,
    currentRevenue,
    revenueTrend,
    pendingPaymentsAmount: Number(pendingPayments._sum.pendingAmount || 0),
    pendingPaymentsCount: pendingPayments._count,
    recentReservations,
    upcomingCheckIns,
    revenueChartData,
    topGuests: guestsWithRevenue,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const data = await getDashboardData()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value)
  }

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
          Dashboard financiero - {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos del Mes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ingresos del Mes
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.currentRevenue)}
            </div>
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-xs font-medium ${
                data.revenueTrend >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {data.revenueTrend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.revenueTrend).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 ml-2">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Pagos Pendientes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pagos Pendientes
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.pendingPaymentsAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {data.pendingPaymentsCount} reservas con saldo
            </p>
          </CardContent>
        </Card>

        {/* Ocupación */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ocupación
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Bed className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data.occupancyRate.toFixed(0)}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {data.occupiedRooms} de {data.totalRooms} habitaciones
            </p>
          </CardContent>
        </Card>

        {/* Check-ins Hoy */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Check-ins Hoy
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data.todayCheckIns}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Llegadas programadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Client Component */}
      <DashboardCharts data={data.revenueChartData} />

      {/* Grid with Recent Reservations and Top Guests */}
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

        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Clientes 🌟</CardTitle>
                <CardDescription>Clientes con mayor gasto total</CardDescription>
              </div>
              <Link href="/dashboard/huespedes">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.topGuests.length > 0 ? (
              <div className="space-y-4">
                {data.topGuests.map((guest, index) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{guest.name}</p>
                          {guest.isVIP && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {guest.reservationCount} {guest.reservationCount === 1 ? "reserva" : "reservas"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(guest.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay clientes registrados</p>
              </div>
            )}
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
          <div className="grid gap-4 md:grid-cols-4">
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
            <Link href="/dashboard/pagos">
              <Button className="h-20 flex flex-col gap-2 w-full" variant="outline">
                <DollarSign className="h-6 w-6" />
                <span>Registrar Pago</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}