import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export async function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/login" }: ProtectedRouteProps) {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    // Redirect to appropriate dashboard based on role
    switch (session.role) {
      case "admin":
        redirect("/admin")
      case "engineer":
      case "manager":
        redirect("/dashboard")
      case "homeowner":
        redirect("/homeowner")
      default:
        redirect("/login")
    }
  }

  return <>{children}</>
}
