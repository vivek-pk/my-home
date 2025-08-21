import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDatabase } from "@/lib/mongodb"
import { BarChart3, TrendingUp, Users, Building2, Clock } from "lucide-react"

async function getAnalyticsData() {
  const db = await getDatabase()

  const [totalProjects, totalUsers, activeProjects, completedProjects, projectsByStatus, usersByRole, recentActivity] =
    await Promise.all([
      db.collection("projects").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("projects").countDocuments({ status: "in-progress" }),
      db.collection("projects").countDocuments({ status: "completed" }),
      db
        .collection("projects")
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("users")
        .aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])
        .toArray(),
      db.collection("projects").find({}).sort({ updatedAt: -1 }).limit(5).toArray(),
    ])

  return {
    totalProjects,
    totalUsers,
    activeProjects,
    completedProjects,
    projectsByStatus,
    usersByRole,
    recentActivity: recentActivity.map((project) => ({
      ...project,
      _id: project._id.toString(),
    })),
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const completionRate = data.totalProjects > 0 ? (data.completedProjects / data.totalProjects) * 100 : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">System overview and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalProjects}</div>
              <p className="text-xs text-muted-foreground">All construction projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeProjects}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <p className="text-xs text-muted-foreground">{data.completedProjects} completed projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered system users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>Distribution of project statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.projectsByStatus.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="capitalize">{status._id.replace("-", " ")}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(status.count / data.totalProjects) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{status.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
              <CardDescription>Distribution of user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.usersByRole.map((role) => (
                  <div key={role._id} className="flex items-center justify-between">
                    <span className="capitalize">{role._id}s</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full"
                          style={{
                            width: `${(role.count / data.totalUsers) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{role.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Project Activity</CardTitle>
            <CardDescription>Latest project updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {data.recentActivity.map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last updated {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">{project.status.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">{project.timeline?.length || 0} phases</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
