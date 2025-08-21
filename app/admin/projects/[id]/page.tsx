import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, FileText, Edit, ArrowLeft } from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"
import TimelineView from "@/components/timeline/timeline-view"
import { getProjectById } from "@/lib/db/projects"
import { getAllUsers } from "@/lib/db/users"

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const allUsers = await getAllUsers()
  const teamMembers = allUsers.filter(
    (user) => project.engineerIds.includes(user._id) || project.managerIds.includes(user._id),
  )
  const engineers = allUsers.filter((user) => project.engineerIds.includes(user._id))
  const managers = allUsers.filter((user) => project.managerIds.includes(user._id))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "On Hold":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">{project.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <Link href={`/admin/projects/${project._id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Value</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${project.budget?.toLocaleString() || "N/A"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.startDate && project.endDate
                  ? Math.ceil(
                      (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : "N/A"}{" "}
                days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.engineerIds.length + project.managerIds.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">End Date:</span>
                    <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Budget:</span>
                    <span>${project.budget?.toLocaleString() || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Homeowner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{project.homeownerName || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{project.homeownerPhone || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{project.homeownerEmail || "Not provided"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineView project={project} canEdit={false} />
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-4">
              {engineers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Engineers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {engineers.map((engineer) => (
                        <div key={engineer._id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{engineer.name}</span>
                            <p className="text-sm text-gray-500">{engineer.mobile}</p>
                          </div>
                          <Badge variant="outline">Engineer</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {managers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Managers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {managers.map((manager) => (
                        <div key={manager._id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{manager.name}</span>
                            <p className="text-sm text-gray-500">{manager.mobile}</p>
                          </div>
                          <Badge variant="outline">Manager</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {teamMembers.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">No team members assigned yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.floorPlan && (
                    <div>
                      <h4 className="font-medium mb-2">Floor Plan</h4>
                      <a
                        href={project.floorPlan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Floor Plan
                      </a>
                    </div>
                  )}

                  {project.images && project.images.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Project Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {project.images.map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Project image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!project.floorPlan && (!project.images || project.images.length === 0) && (
                    <p className="text-gray-500">No files uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
