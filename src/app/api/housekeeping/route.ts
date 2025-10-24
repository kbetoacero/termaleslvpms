// src/app/api/housekeeping/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Obtener estado de todas las habitaciones para housekeeping
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const floor = searchParams.get("floor")
    const assignedTo = searchParams.get("assignedTo")

    const where: any = {}

    if (status) {
      where.cleaningStatus = status
    }

    if (floor) {
      where.floor = floor
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    const rooms = await prisma.room.findMany({
      where,
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
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        reservations: {
          where: {
            reservation: {
              status: {
                in: ["CHECKED_IN", "CONFIRMED"],
              },
            },
          },
          include: {
            reservation: {
              include: {
                guest: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { 
            reservation: {
              checkIn: "desc"
            }
          },
          take: 1,
        },
      },
      orderBy: [
        { floor: "asc" },
        { number: "asc" },
      ],
    })

    // Estadísticas
    const stats = {
      dirty: await prisma.room.count({ where: { cleaningStatus: "DIRTY" } }),
      cleaning: await prisma.room.count({ where: { cleaningStatus: "CLEANING" } }),
      clean: await prisma.room.count({ where: { cleaningStatus: "CLEAN" } }),
      inspected: await prisma.room.count({ where: { cleaningStatus: "INSPECTED" } }),
      outOfOrder: await prisma.room.count({ where: { cleaningStatus: "OUT_OF_ORDER" } }),
      total: await prisma.room.count(),
    }

    // Tareas pendientes
    const pendingTasks = await prisma.housekeepingTask.count({
      where: {
        status: "PENDING",
      },
    })

    const inProgressTasks = await prisma.housekeepingTask.count({
      where: {
        status: "IN_PROGRESS",
      },
    })

    return NextResponse.json({
      rooms,
      stats,
      tasks: {
        pending: pendingTasks,
        inProgress: inProgressTasks,
      },
    })
  } catch (error) {
    console.error("Error fetching housekeeping data:", error)
    return NextResponse.json(
      { error: "Error al obtener datos de limpieza" },
      { status: 500 }
    )
  }
}

// POST - Crear tarea de limpieza manual
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { 
      roomId, 
      type, 
      priority, 
      assignedToId, 
      notes, 
      guestRequest,
      estimatedMinutes 
    } = data

    // Validaciones
    if (!roomId || !type) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Crear la tarea
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId,
        type,
        priority: priority || "NORMAL",
        assignedToId: assignedToId || null,
        assignedAt: assignedToId ? new Date() : null,
        createdById: session.user.id,
        notes: notes || null,
        guestRequest: guestRequest || null,
        estimatedMinutes: estimatedMinutes || 30,
      },
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
      },
    })

    // Actualizar estado de la habitación si está asignada
    if (assignedToId) {
      await prisma.room.update({
        where: { id: roomId },
        data: {
          cleaningStatus: "CLEANING",
          assignedTo: assignedToId,
        },
      })
    }

    // Crear log
    await prisma.cleaningLog.create({
      data: {
        roomId,
        previousStatus: "DIRTY",
        newStatus: "CLEANING",
        changedById: session.user.id,
        notes: `Tarea creada: ${type}`,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating housekeeping task:", error)
    return NextResponse.json(
      { error: "Error al crear tarea de limpieza" },
      { status: 500 }
    )
  }
}