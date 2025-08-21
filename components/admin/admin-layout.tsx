import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminSidebar } from "./admin-sidebar"
import type { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default AdminLayout
