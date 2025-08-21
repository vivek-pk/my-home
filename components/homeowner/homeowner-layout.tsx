import { ProtectedRoute } from "@/components/auth/protected-route"
import { HomeownerHeader } from "./homeowner-header"
import type { ReactNode } from "react"

interface HomeownerLayoutProps {
  children: ReactNode
}

export function HomeownerLayout({ children }: HomeownerLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["homeowner"]}>
      <div className="min-h-screen bg-background">
        <HomeownerHeader />
        <main className="container mx-auto px-4 py-6 max-w-4xl">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
