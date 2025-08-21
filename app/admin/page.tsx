import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDatabase } from "@/lib/mongodb"
import { Building2, Users, Clock, CheckCircle, FolderPlus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

async function getDashboardStats() {
  const db = await getDatabase()

  const [totalProjects, totalUsers, activeProjects, completedProjects] = await Promise.all([
    db.collection("projects").countDocuments(),
    db.collection("users").countDocuments(),
    db.collection("projects").countDocuments({ status: "in-progress" }),
    db.collection("projects").countDocuments({ status: "completed" }),
  ])

  return {
    totalProjects,
    totalUsers,
    activeProjects,
    completedProjects,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      description: "All construction projects",
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users in system",
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      description: "Currently in progress",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      description: "Successfully finished",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your construction projects and team members</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New project created</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 bg-secondary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Timeline updated</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Project completed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/admin/projects/create"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <span className="font-medium">Create New Project</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
