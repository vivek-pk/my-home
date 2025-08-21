import { AdminLayout } from "@/components/admin/admin-layout"
import { CreateUserForm } from "@/components/admin/create-user-form"

export default function CreateUserPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New User</h1>
          <p className="text-muted-foreground">Create a new user account with appropriate role permissions</p>
        </div>

        <CreateUserForm />
      </div>
    </AdminLayout>
  )
}
