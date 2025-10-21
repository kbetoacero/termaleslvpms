// src/components/payments/PaymentModal.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, CreditCard } from "lucide-react"

interface PaymentModalProps {
  reservationId: string
  pendingAmount: number
  totalAmount: number
}

export default function PaymentModal({
  reservationId,
  pendingAmount,
  totalAmount,
}: PaymentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    amount: pendingAmount,
    method: "CASH",
    reference: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones manuales
    if (!formData.amount || formData.amount <= 0) {
      alert("El monto debe ser mayor a 0")
      return
    }
    
    if (formData.amount > pendingAmount) {
      alert(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(pendingAmount)})`)
      return
    }
    
    if (!formData.method) {
      alert("Debes seleccionar un método de pago")
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reservationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al registrar pago")
        return
      }

      alert(
        `✅ Pago registrado exitosamente\n\n` +
        `Monto: ${formatCurrency(data.payment.amount)}\n` +
        `Saldo pendiente: ${formatCurrency(data.reservation.pendingAmount)}`
      )

      setOpen(false)
      setFormData({
        amount: data.reservation.pendingAmount,
        method: "CASH",
        reference: "",
        notes: "",
      })
      router.refresh()
    } catch (error) {
      alert("Error al registrar el pago")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const quickAmounts = [
    { label: "25%", value: Math.round(totalAmount * 0.25) },
    { label: "50%", value: Math.round(totalAmount * 0.5) },
    { label: "Total", value: pendingAmount },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <DollarSign className="h-4 w-4" />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Saldo pendiente: <strong>{formatCurrency(pendingAmount)}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a pagar *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              max={pendingAmount}
              value={formData.amount}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                if (value <= pendingAmount) {
                  setFormData({ ...formData, amount: value })
                }
              }}
              onKeyDown={(e) => {
                // Permitir teclas de navegación
                if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                  return
                }
                // Permitir números y un punto decimal
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault()
                }
              }}
              required
            />
            {/* Quick amounts */}
            <div className="flex gap-2">
              {quickAmounts.map((quick) => (
                <Button
                  key={quick.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, amount: quick.value })}
                  disabled={quick.value > pendingAmount}
                >
                  {quick.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="method">Método de Pago *</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="ONLINE">Pago en línea</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referencia */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referencia / Número de Transacción</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="Ej: Comp. 12345, Aprob. 678910"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional del pago"
              rows={2}
            />
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Monto a pagar:</span>
              <span className="font-semibold">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Nuevo saldo pendiente:</span>
              <span
                className={`font-semibold ${
                  pendingAmount - formData.amount === 0 ? "text-green-600" : "text-orange-600"
                }`}
              >
                {formatCurrency(pendingAmount - formData.amount)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Procesando..." : "Registrar Pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}