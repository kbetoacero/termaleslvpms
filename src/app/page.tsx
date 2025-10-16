// src/app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  // Redirigir directamente al login
  redirect("/login")
}