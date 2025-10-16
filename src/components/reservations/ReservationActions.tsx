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
import { CheckCircle2, LogOut, XCircle, Edit, Trash2 } from "lucide-react"

interface Reservation {
  id: string
  status: string
  reservationNumber: string
}

export default function ReservationActions({
  reservation,
}: {
  reservation: Reservation
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/checkin`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al hacer check-in")

      router.refresh()
    } catch (error) {
      alert("Error al realizar el check-in")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/checkout`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al hacer check-out")

      router.refresh()
    } catch (error) {
      alert("Error al realizar el check-out")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/cancel`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al cancelar")

      router.refresh()
    } catch (error) {
      alert("Error al cancelar la reserva")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
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
              <AlertDialogTitle>Confirmar Check-in</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas realizar el check-in para la reserva{" "}
                {reservation.reservationNumber}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCheckIn}>
                Confirmar Check-in
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {reservation.status === "CHECKED_IN" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="gap-2" disabled={loading}>
              <LogOut className="h-4 w-4" />
              Hacer Check-out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Check-out</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas realizar el check-out para la reserva{" "}
                {reservation.reservationNumber}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCheckOut}>
                Confirmar Check-out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2" disabled={loading}>
              <XCircle className="h-4 w-4" />
              Cancelar Reserva
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas cancelar la reserva{" "}
                {reservation.reservationNumber}? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, mantener</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Sí, cancelar reserva
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}