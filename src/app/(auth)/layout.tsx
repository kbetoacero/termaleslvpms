// src/app/(auth)/layout.tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Si ya está autenticado, redirigir al dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <>{children}</>
}