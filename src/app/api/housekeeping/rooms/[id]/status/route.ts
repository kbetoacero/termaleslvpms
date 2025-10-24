// src/app/api/housekeeping/rooms/[id]/status/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // ✅ AWAIT params en Next.js 15
    const { id } = await params

    const data = await request.json()
    const { status, notes } = data

    if (!status) {
      return NextResponse.json(
        { error: "El estado es requerido" },
        { status: 400 }
      )
    }

    // Obtener estado actual
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Habitación no encontrada" },
        { status: 404 }
      )
    }

    const previousStatus = room.cleaningStatus

    // Actualizar habitación
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        cleaningStatus: status,
        lastCleaned: status === "CLEAN" || status === "INSPECTED" ? new Date() : room.lastCleaned,
        assignedTo: status === "CLEAN" || status === "INSPECTED" ? null : room.assignedTo,
      },
      include: {
        roomType: true,
        housekeepingTasks: {
          where: {
            status: {
              in: ["PENDING", "IN_PROGRESS"],
            },
          },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Crear log de cambio
    await prisma.cleaningLog.create({
      data: {
        roomId: id,
        previousStatus,
        newStatus: status,
        changedById: session.user.id,
        notes: notes || null,
      },
    })

    // Si se marca como CLEAN o INSPECTED, completar tareas pendientes
    if (status === "CLEAN" || status === "INSPECTED") {
      await prisma.housekeepingTask.updateMany({
        where: {
          roomId: id,
          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error("Error updating room status:", error)
    return NextResponse.json(
      { error: "Error al actualizar estado de habitación" },
      { status: 500 }
    )
  }
}