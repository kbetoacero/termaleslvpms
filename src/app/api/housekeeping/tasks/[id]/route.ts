// src/app/api/housekeeping/tasks/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Obtener detalles de una tarea
export async function GET(
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

    const { id } = await params

    const task = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        checklistItems: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Error al obtener tarea" },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar tarea (asignar, iniciar, completar)
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

    const { id } = await params

    const data = await request.json()
    const { 
      status, 
      assignedToId, 
      notes, 
      issues, 
      requiresMaintenance,
      actualMinutes 
    } = data

    const updateData: any = {}

    if (status) {
      updateData.status = status
      
      if (status === "IN_PROGRESS" && !updateData.startedAt) {
        updateData.startedAt = new Date()
      }
      
      if (status === "COMPLETED") {
        updateData.completedAt = new Date()
        
        // Calcular duración si se inició
        const task = await prisma.housekeepingTask.findUnique({
          where: { id },
          select: { startedAt: true },
        })
        
        if (task?.startedAt) {
          const duration = Math.floor(
            (new Date().getTime() - new Date(task.startedAt).getTime()) / 60000
          )
          updateData.actualMinutes = actualMinutes || duration
        }
      }
    }

    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId
      updateData.assignedAt = assignedToId ? new Date() : null
    }

    if (notes !== undefined) updateData.notes = notes
    if (issues !== undefined) updateData.issues = issues
    if (requiresMaintenance !== undefined) updateData.requiresMaintenance = requiresMaintenance

    const task = await prisma.housekeepingTask.update({
      where: { id },
      data: updateData,
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checklistItems: {
          orderBy: { order: "asc" },
        },
      },
    })

    // Actualizar estado de la habitación
    if (status) {
      let roomStatus = task.room.cleaningStatus

      if (status === "IN_PROGRESS") {
        roomStatus = "CLEANING"
      } else if (status === "COMPLETED") {
        roomStatus = "CLEAN"
      }

      await prisma.room.update({
        where: { id: task.roomId },
        data: {
          cleaningStatus: roomStatus,
          lastCleaned: status === "COMPLETED" ? new Date() : undefined,
          assignedTo: status === "COMPLETED" ? null : task.assignedToId,
        },
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Error al actualizar tarea" },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar tarea
export async function DELETE(
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

    const { id } = await params

    await prisma.housekeepingTask.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling task:", error)
    return NextResponse.json(
      { error: "Error al cancelar tarea" },
      { status: 500 }
    )
  }
}