import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatabase } from "@/lib/mongodb"
import Link from "next/link"
import { Plus, Building2, Users, Calendar } from "lucide-react"

async function getProjects() {
  const db = await getDatabase()
  const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).toArray()

  return projects.map((project) => ({
    ...project,
    _id: project._id.toString(),
  }))
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "in-progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "on-hold":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "planning":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage all construction projects</p>
          </div>
          <Link href="/admin/projects/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>{project.status.replace("-", " ")}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4" />
                    {project.timeline?.length || 0} phases
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {(project.engineerIds?.length || 0) + (project.managerIds?.length || 0)} team members
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/projects/${project._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/admin/projects/${project._id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first construction project
              </p>
              <Link href="/admin/projects/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
