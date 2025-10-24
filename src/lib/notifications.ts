// src/lib/notifications.ts
import { prisma } from "./prisma"

export type NotificationType = 
  | "CHECKIN"
  | "CHECKOUT"
  | "NEW_RESERVATION"
  | "PAYMENT_PENDING"
  | "PAYMENT_RECEIVED"
  | "MAINTENANCE"
  | "LOW_INVENTORY"
  | "SYSTEM"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: any
}

/**
 * Crear una notificación para un usuario específico
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        metadata: params.metadata || null,
      },
    })
    
    console.log(`✅ Notificación creada: ${params.title} para usuario ${params.userId}`)
    return notification
  } catch (error) {
    console.error("Error creando notificación:", error)
    return null
  }
}

/**
 * Crear notificaciones para múltiples usuarios (broadcast)
 */
export async function createNotificationForAllUsers(
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    // Obtener todos los usuarios activos (puedes filtrar por roles si quieres)
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    })

    const notifications = await Promise.all(
      users.map((user) =>
        createNotification({
          ...params,
          userId: user.id,
        })
      )
    )

    console.log(`✅ Notificación broadcast enviada a ${users.length} usuarios`)
    return notifications
  } catch (error) {
    console.error("Error en broadcast de notificaciones:", error)
    return []
  }
}

/**
 * Crear notificaciones para usuarios con roles específicos
 */
export async function createNotificationForRoles(
  roles: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: roles },
      },
      select: { id: true },
    })

    const notifications = await Promise.all(
      users.map((user) =>
        createNotification({
          ...params,
          userId: user.id,
        })
      )
    )

    console.log(`✅ Notificación enviada a ${users.length} usuarios con roles: ${roles.join(", ")}`)
    return notifications
  } catch (error) {
    console.error("Error enviando notificaciones por rol:", error)
    return []
  }
}

// ============================================
// FUNCIONES ESPECÍFICAS POR EVENTO
// ============================================

/**
 * Notificación: Nueva reserva creada
 */
export async function notifyNewReservation(
  reservationId: string,
  guestName: string,
  createdByUserId: string
) {
  return createNotificationForRoles(
    ["ADMIN", "MANAGER", "RECEPTIONIST"],
    {
      type: "NEW_RESERVATION",
      title: "Nueva reserva registrada",
      message: `${guestName} - Reserva confirmada`,
      link: `/dashboard/reservas/${reservationId}`,
      metadata: { reservationId },
    }
  )
}

/**
 * Notificación: Check-in pendiente para hoy
 */
export async function notifyCheckInToday(
  reservationId: string,
  guestName: string,
  roomNumber?: string
) {
  return createNotificationForRoles(
    ["ADMIN", "MANAGER", "RECEPTIONIST"],
    {
      type: "CHECKIN",
      title: "Check-in programado para hoy",
      message: `${guestName}${roomNumber ? ` - Habitación ${roomNumber}` : ""}`,
      link: `/dashboard/reservas/${reservationId}`,
      metadata: { reservationId },
    }
  )
}

/**
 * Notificación: Check-out pendiente para hoy
 */
export async function notifyCheckOutToday(
  reservationId: string,
  guestName: string,
  roomNumber?: string
) {
  return createNotificationForRoles(
    ["ADMIN", "MANAGER", "RECEPTIONIST"],
    {
      type: "CHECKOUT",
      title: "Check-out programado para hoy",
      message: `${guestName}${roomNumber ? ` - Habitación ${roomNumber}` : ""}`,
      link: `/dashboard/reservas/${reservationId}`,
      metadata: { reservationId },
    }
  )
}

/**
 * Notificación: Pago recibido
 */
export async function notifyPaymentReceived(
  reservationId: string,
  guestName: string,
  amount: number,
  paymentUserId: string
) {
  return createNotificationForRoles(
    ["ADMIN", "MANAGER"],
    {
      type: "PAYMENT_RECEIVED",
      title: "Pago recibido",
      message: `${guestName} - $${amount.toLocaleString("es-CO")}`,
      link: `/dashboard/reservas/${reservationId}`,
      metadata: { reservationId, amount },
    }
  )
}

/**
 * Notificación: Pago pendiente
 */
export async function notifyPaymentPending(
  reservationId: string,
  guestName: string,
  pendingAmount: number
) {
  return createNotificationForRoles(
    ["ADMIN", "MANAGER", "RECEPTIONIST"],
    {
      type: "PAYMENT_PENDING",
      title: "Pago pendiente",
      message: `${guestName} - Saldo: $${pendingAmount.toLocaleString("es-CO")}`,
      link: `/dashboard/reservas/${reservationId}`,
      metadata: { reservationId, pendingAmount },
    }
  )
}

/**
 * Job/Cron: Generar notificaciones diarias automáticas
 * (Llamar esto en un cron job o al inicio del día)
 */
export async function generateDailyNotifications() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    // Check-ins de hoy
    const todayCheckIns = await prisma.reservation.findMany({
      where: {
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        status: "CONFIRMED",
      },
      include: {
        guest: true,
        rooms: {
          include: {
            room: true,
          },
        },
      },
    })

    for (const reservation of todayCheckIns) {
      const roomNumber = reservation.rooms[0]?.room.number
      await notifyCheckInToday(
        reservation.id,
        `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        roomNumber
      )
    }

    // Check-outs de hoy
    const todayCheckOuts = await prisma.reservation.findMany({
      where: {
        checkOut: {
          gte: today,
          lt: tomorrow,
        },
        status: "CHECKED_IN",
      },
      include: {
        guest: true,
        rooms: {
          include: {
            room: true,
          },
        },
      },
    })

    for (const reservation of todayCheckOuts) {
      const roomNumber = reservation.rooms[0]?.room.number
      await notifyCheckOutToday(
        reservation.id,
        `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        roomNumber
      )
    }

    // Pagos pendientes (reservas con check-out hoy o pasado con saldo pendiente)
    const paymentsPending = await prisma.reservation.findMany({
      where: {
        checkOut: {
          lte: today,
        },
        pendingAmount: {
          gt: 0,
        },
        status: {
          in: ["CHECKED_IN", "CHECKED_OUT"],
        },
      },
      include: {
        guest: true,
      },
    })

    for (const reservation of paymentsPending) {
      await notifyPaymentPending(
        reservation.id,
        `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        Number(reservation.pendingAmount)
      )
    }

    console.log("✅ Notificaciones diarias generadas")
    return {
      checkIns: todayCheckIns.length,
      checkOuts: todayCheckOuts.length,
      paymentsPending: paymentsPending.length,
    }
  } catch (error) {
    console.error("Error generando notificaciones diarias:", error)
    return null
  }
}