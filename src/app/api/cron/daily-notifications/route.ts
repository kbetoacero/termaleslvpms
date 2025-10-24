// src/app/api/cron/daily-notifications/route.ts
import { NextResponse } from "next/server"
import { generateDailyNotifications } from "@/lib/notifications"

/**
 * Endpoint para generar notificaciones diarias
 * 
 * Llamar esto desde un cron job externo o configurar en Vercel Cron
 * 
 * Ejemplo con curl:
 * curl -X POST http://localhost:3000/api/cron/daily-notifications \
 *   -H "Authorization: Bearer TU_CRON_SECRET"
 */
export async function POST(request: Request) {
  try {
    // 🔒 Seguridad: Verificar un token secret para el cron
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.CRON_SECRET || "your-secret-key"
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const result = await generateDailyNotifications()

    if (!result) {
      return NextResponse.json(
        { error: "Error generando notificaciones" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notificaciones diarias generadas",
      stats: result,
    })
  } catch (error) {
    console.error("Error en cron de notificaciones:", error)
    return NextResponse.json(
      { error: "Error ejecutando cron job" },
      { status: 500 }
    )
  }
}

// GET para testing (solo en desarrollo)
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Solo disponible en desarrollo" },
      { status: 403 }
    )
  }

  const result = await generateDailyNotifications()

  return NextResponse.json({
    success: true,
    message: "Notificaciones generadas (modo dev)",
    stats: result,
  })
}