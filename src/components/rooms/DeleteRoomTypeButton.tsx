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

interface DeleteRoomTypeButtonProps {
  roomTypeId: string
  roomTypeName: string
  hasRooms: boolean
}

export default function DeleteRoomTypeButton({
  roomTypeId,
  roomTypeName,
  hasRooms,
}: DeleteRoomTypeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/room-types/${roomTypeId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Error al eliminar")
        return
      }

      router.push("/dashboard/habitaciones")
      router.refresh()
    } catch (error) {
      alert("Error al eliminar el tipo de habitación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={hasRooms}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar Tipo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar tipo de habitación?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar el tipo "{roomTypeName}"?{" "}
            {hasRooms && (
              <strong className="text-red-600">
                Este tipo tiene habitaciones asociadas y no puede ser eliminado.
              </strong>
            )}
            {!hasRooms && "Esta acción no se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {!hasRooms && (
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