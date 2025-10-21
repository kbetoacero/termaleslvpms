// src/components/guests/DeleteGuestButton.tsx
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
import { Trash2 } from "lucide-react"

interface DeleteGuestButtonProps {
  guestId: string
  guestName: string
  hasReservations: boolean
}

export default function DeleteGuestButton({
  guestId,
  guestName,
  hasReservations,
}: DeleteGuestButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al eliminar")
        return
      }

      router.push("/dashboard/huespedes")
      router.refresh()
    } catch (error) {
      alert("Error al eliminar el huésped")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="gap-2"
          disabled={hasReservations}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar huésped?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar a <strong>{guestName}</strong>?
            {hasReservations ? (
              <span className="block mt-2 text-red-600 font-semibold">
                Este huésped tiene reservas asociadas y no puede ser eliminado.
              </span>
            ) : (
              " Esta acción no se puede deshacer."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {!hasReservations && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}