import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/session';
import { getProjectsByUserId } from '@/lib/db/projects';
import type { Project, ProjectPhase } from '@/lib/models/Project';
import { Building2, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';
import { format } from 'date-fns';

async function getUserProjects(): Promise<Project[]> {
  const session = await getSession();
  if (!session) return [];

  return await getProjectsByUserId(session.id, session.role);
}

function getProjectStatus(project: Project) {
  const completedPhases = project.timeline.filter(
    (phase: ProjectPhase) => phase.status === 'completed'
  ).length;
  const totalPhases = project.timeline.length;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  if (project.status === 'completed')
    return { status: 'Completed', color: 'bg-green-100 text-green-800' };
  if (project.status === 'on-hold')
    return { status: 'On Hold', color: 'bg-yellow-100 text-yellow-800' };
  if (progress === 0)
    return { status: 'Starting Soon', color: 'bg-blue-100 text-blue-800' };
  if (progress < 100)
    return { status: 'In Progress', color: 'bg-orange-100 text-orange-800' };
  return { status: 'Completed', color: 'bg-green-100 text-green-800' };
}

export default async function EngineerManagerDashboard() {
  const projects = await getUserProjects();
  const session = await getSession();

  return (
    <ProtectedRoute allowedRoles={['engineer', 'manager']}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {session?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{session?.role}</Badge>
                <nav className="hidden md:flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">My Projects</Button>
                  </Link>
                </nav>
                <LogoutButton variant="outline" size="sm" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const projectStatus = getProjectStatus(project);
                const activeTasks = project.timeline.filter(
                  (phase: ProjectPhase) =>
                    phase.status === 'in-progress' || phase.status === 'pending'
                ).length;

                return (
                  <Card
                    key={project._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <Badge className={projectStatus.color}>
                          {projectStatus.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="mr-2 h-4 w-4" />
                          {project.timeline?.length || 0} phases total
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {activeTasks} active tasks
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Last updated{' '}
                          {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/projects/${project._id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                          >
                            View Project
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/projects/${project._id}/timeline`}
                        >
                          <Button variant="ghost" size="sm">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No projects assigned
                </h3>
                <p className="text-muted-foreground text-center">
                  You haven&apos;t been assigned to any construction projects
                  yet. Contact your administrator for project assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
