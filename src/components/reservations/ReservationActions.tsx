// src/components/reservations/ReservationActions.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, Clock, XCircle, Edit, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Import dinámico del PaymentModal para evitar problemas de SSR
const PaymentModal = dynamic(() => import("@/components/payments/PaymentModal"), {
  ssr: false,
  loading: () => <Button disabled className="gap-2"><DollarSign className="h-4 w-4" />Cargando...</Button>
})

interface ReservationActionsProps {
  reservation: {
    id: string
    status: string
    pendingAmount: number
    totalAmount: number
  }
}

export default function ReservationActions({ reservation }: ReservationActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleCheckIn = async () => {
    setLoading(true)
    setAction("checkin")
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/checkin`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al hacer check-in")
        return
      }

      alert("Check-in realizado exitosamente")
      router.refresh()
    } catch (error) {
      alert("Error al hacer check-in")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleCheckOut = async (force = false) => {
    setLoading(true)
    setAction("checkout")
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "pending_amount") {
          // Mostrar confirmación especial para saldo pendiente
          const confirmForce = confirm(
            `⚠️ ADVERTENCIA: Esta reserva tiene un saldo pendiente de ${new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(data.pendingAmount)}.\n\n¿Deseas hacer check-out de todas formas?`
          )
          
          if (confirmForce) {
            // Reintentar con force=true
            handleCheckOut(true)
          }
          return
        }
        alert(data.error || "Error al hacer check-out")
        return
      }

      if (data.warning) {
        alert(`✅ Check-out realizado.\n⚠️ ${data.warning}`)
      } else {
        alert("Check-out realizado exitosamente")
      }
      router.refresh()
    } catch (error) {
      alert("Error al hacer check-out")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    setAction("cancel")
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al cancelar")
        return
      }

      alert("Reserva cancelada exitosamente")
      router.refresh()
    } catch (error) {
      alert("Error al cancelar la reserva")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    setAction("confirm")
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al confirmar")
        return
      }

      alert("Reserva confirmada exitosamente")
      router.refresh()
    } catch (error) {
      alert("Error al confirmar la reserva")
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Registrar Pago - Para reservas con saldo pendiente */}
          {reservation.pendingAmount > 0 && !["CANCELLED", "NO_SHOW"].includes(reservation.status) && (
            <PaymentModal
              reservationId={reservation.id}
              pendingAmount={reservation.pendingAmount}
              totalAmount={reservation.totalAmount}
            />
          )}

          {/* Confirmar - Solo para PENDING */}
          {reservation.status === "PENDING" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={loading}>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Reserva
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Confirmar reserva?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La reserva cambiará de estado pendiente a confirmada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={loading && action === "confirm"}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading && action === "confirm" ? "Confirmando..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Check-in - Solo para CONFIRMED */}
          {reservation.status === "CONFIRMED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="gap-2" disabled={loading}>
                  <CheckCircle2 className="h-4 w-4" />
                  Hacer Check-in
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Realizar check-in?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se registrará la llegada del huésped y las habitaciones se marcarán como ocupadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCheckIn}
                    disabled={loading && action === "checkin"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading && action === "checkin" ? "Procesando..." : "Hacer Check-in"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Check-out - Solo para CHECKED_IN */}
          {reservation.status === "CHECKED_IN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={loading}>
                  <Clock className="h-4 w-4" />
                  Hacer Check-out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Realizar check-out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se registrará la salida del huésped y las habitaciones se marcarán para limpieza.
                    {reservation.pendingAmount > 0 && (
                      <span className="block mt-2 text-orange-600 font-semibold">
                        ⚠️ Nota: Esta reserva tiene un saldo pendiente. Se te pedirá confirmación adicional.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCheckOut(false)}
                    disabled={loading && action === "checkout"}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {loading && action === "checkout" ? "Procesando..." : "Hacer Check-out"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Cancelar - No para CHECKED_OUT o CANCELLED */}
          {!["CHECKED_OUT", "CANCELLED", "NO_SHOW"].includes(reservation.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={loading}>
                  <XCircle className="h-4 w-4" />
                  Cancelar Reserva
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción cambiará el estado de la reserva a cancelada. Las habitaciones quedarán disponibles nuevamente.
                    {reservation.status === "CHECKED_IN" && (
                      <span className="block mt-2 text-orange-600 font-semibold">
                        Advertencia: El huésped ya hizo check-in. ¿Estás seguro de cancelar?
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, mantener</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={loading && action === "cancel"}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading && action === "cancel" ? "Cancelando..." : "Sí, cancelar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Editar - Para estados editables */}
          {["PENDING", "CONFIRMED"].includes(reservation.status) && (
            <Button variant="outline" className="gap-2" disabled={loading}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}