import { HomeownerLayout } from "@/components/homeowner/homeowner-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getSession } from "@/lib/session"
import { getProjectsByUserId } from "@/lib/db/projects"
import { getUserById } from "@/lib/db/users"
import { Building2, Calendar, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import Link from "next/link"

async function getHomeownerData() {
  const session = await getSession()
  if (!session) return null

  const [user, projects] = await Promise.all([getUserById(session.id), getProjectsByUserId(session.id, session.role)])

  return { user, projects }
}

function getProjectStatus(project: any) {
  const completedPhases = project.timeline.filter((phase: any) => phase.status === "completed").length
  const totalPhases = project.timeline.length
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0

  if (project.status === "completed") return { status: "Completed", color: "bg-green-100 text-green-800", progress }
  if (project.status === "on-hold") return { status: "On Hold", color: "bg-yellow-100 text-yellow-800", progress }
  if (progress === 0) return { status: "Starting Soon", color: "bg-blue-100 text-blue-800", progress }
  if (progress < 100) return { status: "In Progress", color: "bg-orange-100 text-orange-800", progress }
  return { status: "Completed", color: "bg-green-100 text-green-800", progress }
}

function getNextMilestone(project: any) {
  const nextPhase = project.timeline.find((phase: any) => phase.status === "pending" || phase.status === "in-progress")
  return nextPhase
}

export default async function HomeownerDashboard() {
  const data = await getHomeownerData()

  if (!data || !data.projects.length) {
    return (
      <HomeownerLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
          <p className="text-muted-foreground text-center">
            You don't have any construction projects assigned yet. Please contact your project administrator.
          </p>
        </div>
      </HomeownerLayout>
    )
  }

  const project = data.projects[0] // Assuming homeowner has one project
  const projectStatus = getProjectStatus(project)
  const nextMilestone = getNextMilestone(project)
  const recentUpdates = project.timeline
    .flatMap((phase: any) => phase.updates || [])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <HomeownerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {data.user?.name}!</h1>
          <p className="text-muted-foreground">Here's the latest on your construction project</p>
        </div>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <Badge className={projectStatus.color}>{projectStatus.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(projectStatus.progress)}% Complete</span>
              </div>
              <Progress value={projectStatus.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{project.timeline.length} Total Phases</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {project.timeline.filter((phase: any) => phase.status === "completed").length} Phases Completed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Started {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        {nextMilestone && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Next Milestone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">{nextMilestone.name}</h3>
                  <p className="text-sm text-muted-foreground">{nextMilestone.description}</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Expected: {format(new Date(nextMilestone.endDate), "MMM d, yyyy")}</span>
                    <Badge variant="outline">
                      {differenceInDays(new Date(nextMilestone.endDate), new Date())} days remaining
                    </Badge>
                  </div>
                  <Link href="/homeowner/timeline">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      View Full Timeline
                    </Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Updates</CardTitle>
              <Link href="/homeowner/timeline">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  View All
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map((update: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{update.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(update.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{update.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent updates available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/homeowner/timeline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">View Timeline</h3>
                  <p className="text-sm text-muted-foreground">See detailed project progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/homeowner/documents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="p-2 bg-secondary/10 rounded-full">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-medium">View Documents</h3>
                  <p className="text-sm text-muted-foreground">Access floor plans and photos</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </HomeownerLayout>
  )
}
