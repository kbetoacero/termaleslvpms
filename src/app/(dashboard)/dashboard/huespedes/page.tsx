// src/app/(dashboard)/dashboard/huespedes/page.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Star, Mail, Phone, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getGuestsData() {
  const [guests, stats] = await Promise.all([
    prisma.guest.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        reservations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
    prisma.guest.aggregate({
      _count: true,
    }),
  ])

  const vipCount = guests.filter((g) => g.isVIP).length

  return { guests, totalGuests: stats._count, vipCount }
}

export default async function HuespedesPage() {
  const { guests, totalGuests, vipCount } = await getGuestsData()

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Huéspedes</h1>
          <p className="text-slate-500 mt-1">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Link href="/dashboard/huespedes/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Huésped
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Total Huéspedes</div>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {totalGuests}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Clientes VIP</div>
                <div className="text-3xl font-bold text-yellow-600 mt-1">
                  {vipCount}
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Huéspedes Recientes</div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {guests.slice(0, 10).length}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Huéspedes</CardTitle>
          <CardDescription>
            {totalGuests} huéspedes registrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Reservas</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.length > 0 ? (
                guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                          {guest.identificationNumber && (
                            <div className="text-xs text-slate-500">
                              {guest.identificationType}: {guest.identificationNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.email ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {guest.email}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {guest.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {guest.city || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {guest.reservations.length} reservas
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(guest.createdAt)}
                    </TableCell>
                    <TableCell>
                      {guest.isVIP && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/huespedes/${guest.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No hay huéspedes registrados</p>
                    <Link href="/dashboard/huespedes/nuevo">
                      <Button className="mt-4" variant="outline">
                        Registrar Primer Huésped
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}