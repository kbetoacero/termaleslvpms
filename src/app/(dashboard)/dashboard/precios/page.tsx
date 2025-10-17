// src/app/(dashboard)/dashboard/precios/page.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Calendar, Percent, Edit, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DeletePriceRuleButton from "@/components/prices/DeletePriceRuleButton"

async function getPriceRules() {
  const rules = await prisma.priceRule.findMany({
    include: {
      roomType: true,
    },
    orderBy: [
      { priority: 'desc' },
      { startDate: 'asc' },
    ],
  })

  // Convertir Decimals
  return rules.map((rule) => ({
    ...rule,
    multiplier: Number(rule.multiplier),
    roomType: {
      ...rule.roomType,
      basePrice: Number(rule.roomType.basePrice),
    },
  }))
}

async function getStats() {
  const [totalRules, activeRules, roomTypes] = await Promise.all([
    prisma.priceRule.count(),
    prisma.priceRule.count({ where: { isActive: true } }),
    prisma.roomType.count(),
  ])

  return { totalRules, activeRules, roomTypes }
}

export default async function PreciosPage() {
  const rules = await getPriceRules()
  const stats = await getStats()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date))
  }

  const getMultiplierBadge = (multiplier: number) => {
    if (multiplier > 1) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          +{((multiplier - 1) * 100).toFixed(0)}%
        </Badge>
      )
    } else if (multiplier < 1) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          -{((1 - multiplier) * 100).toFixed(0)}%
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        Base
      </Badge>
    )
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 10) return "bg-red-100 text-red-700"
    if (priority >= 5) return "bg-orange-100 text-orange-700"
    return "bg-blue-100 text-blue-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Precios Dinámicos</h1>
          <p className="text-slate-500 mt-1">
            Gestiona reglas de precios por temporada y fecha
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/precios/calculadora">
            <Button variant="outline" className="gap-2">
              <Percent className="h-4 w-4" />
              Calculadora
            </Button>
          </Link>
          <Link href="/dashboard/precios/nueva">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Regla
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Reglas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRules}</div>
            <p className="text-xs text-slate-500 mt-1">
              Configuradas en el sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Reglas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeRules}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aplicándose actualmente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tipos de Habitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.roomTypes}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Con precios configurables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                ¿Cómo funcionan los precios dinámicos?
              </h3>
              <p className="text-sm text-blue-700">
                Las reglas se aplican según la prioridad (mayor número = mayor prioridad).
                El multiplicador ajusta el precio base: 1.50 = +50%, 0.80 = -20%.
                Puedes tener múltiples reglas activas, pero solo se aplicará la de mayor prioridad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Precios</CardTitle>
          <CardDescription>
            {rules.length} reglas configuradas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo Habitación</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Multiplicador</TableHead>
                <TableHead className="text-center">Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.roomType.name}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">
                          {rule.multiplier.toFixed(2)}x
                        </span>
                        {getMultiplierBadge(rule.multiplier)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={getPriorityBadge(rule.priority)}
                      >
                        {rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/precios/${rule.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeletePriceRuleButton
                          ruleId={rule.id}
                          ruleName={rule.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No hay reglas de precios configuradas</p>
                    <Link href="/dashboard/precios/nueva">
                      <Button className="mt-4" variant="outline">
                        Crear Primera Regla
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