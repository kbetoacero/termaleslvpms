// src/app/api/notifications/mark-read/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// PATCH - Marcar notificación(es) como leída(s)
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { notificationId, markAll } = data

    if (markAll) {
      // Marcar todas como leídas
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({ 
        message: "Todas las notificaciones marcadas como leídas" 
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Se requiere notificationId o markAll" },
        { status: 400 }
      )
    }

    // Marcar una notificación específica como leída
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // Seguridad: solo el dueño puede marcarla
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: "Error al marcar notificación como leída" },
      { status: 500 }
    )
  }
}