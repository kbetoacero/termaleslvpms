// src/lib/housekeeping-automation.ts
import { prisma } from "./prisma"

/**
 * Crear tarea de limpieza automáticamente después de un check-out
 */
export async function createCheckoutCleaningTask(
  roomId: string,
  reservationId: string,
  userId: string
) {
  try {
    // Verificar si ya existe una tarea pendiente para esta habitación
    const existingTask = await prisma.housekeepingTask.findFirst({
      where: {
        roomId,
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
    })

    if (existingTask) {
      console.log(`Ya existe tarea pendiente para habitación ${roomId}`)
      return existingTask
    }

    // Crear tarea de limpieza
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId,
        type: "CHECKOUT_CLEANING",
        priority: "HIGH", // Alta prioridad después de check-out
        status: "PENDING",
        createdById: userId,
        estimatedMinutes: 45, // Limpieza completa
        notes: `Limpieza después de check-out - Reserva #${reservationId.slice(-6)}`,
      },
    })

    // Actualizar estado de la habitación
    await prisma.room.update({
      where: { id: roomId },
      data: {
        cleaningStatus: "DIRTY",
        cleaningPriority: "HIGH",
      },
    })

    // Crear log
    await prisma.cleaningLog.create({
      data: {
        roomId,
        previousStatus: "CLEAN",
        newStatus: "DIRTY",
        changedById: userId,
        notes: "Check-out completado - limpieza requerida",
      },
    })

    console.log(`✅ Tarea de limpieza creada para habitación ${roomId}`)
    return task
  } catch (error) {
    console.error("Error creando tarea de limpieza automática:", error)
    return null
  }
}

/**
 * Marcar habitación como disponible después de limpieza e inspección
 */
export async function markRoomAvailableAfterCleaning(roomId: string) {
  try {
    await prisma.room.update({
      where: { id: roomId },
      data: {
        status: "AVAILABLE",
        cleaningStatus: "INSPECTED",
        lastCleaned: new Date(),
      },
    })

    console.log(`✅ Habitación ${roomId} marcada como disponible`)
  } catch (error) {
    console.error("Error marcando habitación como disponible:", error)
  }
}

/**
 * Crear tarea de limpieza diaria para huéspedes con estadía larga
 */
export async function createDailyCleaningTask(
  roomId: string,
  userId: string
) {
  try {
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId,
        type: "DAILY_CLEANING",
        priority: "NORMAL",
        status: "PENDING",
        createdById: userId,
        estimatedMinutes: 20, // Limpieza diaria es más rápida
        notes: "Limpieza diaria - huésped en estadía",
      },
    })

    console.log(`✅ Tarea de limpieza diaria creada para habitación ${roomId}`)
    return task
  } catch (error) {
    console.error("Error creando tarea de limpieza diaria:", error)
    return null
  }
}

/**
 * Procesar solicitud de limpieza del huésped
 */
export async function createGuestRequestTask(
  roomId: string,
  guestRequest: string,
  userId: string
) {
  try {
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId,
        type: "GUEST_REQUEST",
        priority: "HIGH",
        status: "PENDING",
        createdById: userId,
        guestRequest,
        estimatedMinutes: 15,
        notes: `Solicitud del huésped: ${guestRequest}`,
      },
    })

    // Actualizar prioridad de la habitación
    await prisma.room.update({
      where: { id: roomId },
      data: {
        cleaningPriority: "HIGH",
      },
    })

    console.log(`✅ Tarea por solicitud de huésped creada para habitación ${roomId}`)
    return task
  } catch (error) {
    console.error("Error creando tarea por solicitud:", error)
    return null
  }
}

/**
 * Integración con Maintenance: Crear ticket de mantenimiento desde housekeeping
 */
export async function createMaintenanceFromHousekeeping(
  roomId: string,
  description: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  taskId?: string
) {
  try {
    // Crear ticket de mantenimiento
    const maintenance = await prisma.maintenance.create({
      data: {
        roomId,
        description,
        priority,
        status: "PENDING",
        notes: taskId ? `Reportado desde housekeeping - Tarea #${taskId.slice(-6)}` : undefined,
      },
    })

    // Actualizar estado de la habitación
    await prisma.room.update({
      where: { id: roomId },
      data: {
        status: "MAINTENANCE",
        cleaningStatus: "OUT_OF_ORDER",
      },
    })

    // Si hay tarea de housekeeping, marcar que requiere mantenimiento
    if (taskId) {
      await prisma.housekeepingTask.update({
        where: { id: taskId },
        data: {
          requiresMaintenance: true,
          issues: description,
        },
      })
    }

    console.log(`✅ Ticket de mantenimiento creado para habitación ${roomId}`)
    return maintenance
  } catch (error) {
    console.error("Error creando ticket de mantenimiento:", error)
    return null
  }
}

/**
 * Job diario: Crear tareas automáticas para el día
 */
export async function generateDailyHousekeepingTasks() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    // Buscar reservas con check-out hoy que aún no tienen tarea
    const checkoutsToday = await prisma.reservation.findMany({
      where: {
        checkOut: {
          gte: today,
          lt: tomorrow,
        },
        status: "CHECKED_IN",
      },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                housekeepingTasks: {
                  where: {
                    status: {
                      in: ["PENDING", "IN_PROGRESS"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    let tasksCreated = 0

    for (const reservation of checkoutsToday) {
      for (const resRoom of reservation.rooms) {
        // Solo crear tarea si no hay ninguna pendiente
        if (resRoom.room.housekeepingTasks.length === 0) {
          await createCheckoutCleaningTask(
            resRoom.room.id,
            reservation.id,
            reservation.userId
          )
          tasksCreated++
        }
      }
    }

    console.log(`✅ ${tasksCreated} tareas de limpieza creadas automáticamente`)
    return { tasksCreated }
  } catch (error) {
    console.error("Error generando tareas diarias:", error)
    return null
  }
}