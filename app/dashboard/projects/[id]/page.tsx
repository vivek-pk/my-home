import { ProtectedRoute } from '@/components/auth/protected-route';
import { getProjectById } from '@/lib/db/projects';
import { getSession } from '@/lib/session';
import { canAccessProject } from '@/lib/auth';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { ProjectPhase } from '@/lib/models/Project';

async function getProjectWithAccess(projectId: string) {
  const session = await getSession();
  if (!session) return null;

  const project = await getProjectById(projectId);
  if (!project) return null;

  if (!canAccessProject(session.role, session.id, project)) {
    return null;
  }

  return { project, session } as const;
}

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProjectWithAccess(id);
  if (!result) {
    notFound();
  }

  const { project, session } = result;
  const completed = project.timeline.filter(
    (p: ProjectPhase) => p.status === 'completed'
  ).length;
  const total = project.timeline.length;

  return (
    <ProtectedRoute allowedRoles={['engineer', 'manager']}>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold leading-tight break-words">
                  {project.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Project Overview
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {session.role}
                </Badge>
                <Link href={`/dashboard/projects/${project._id}/timeline`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Timeline
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    My Projects
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {completed} of {total} phases completed
                </span>
              </div>
              <div>
                <Badge>{project.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {project.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Phases</CardTitle>
                <CardDescription>Key stages and current status</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {project.timeline.map((p) => (
                  <div
                    key={p._id ?? p.name}
                    className="flex items-center justify-between border rounded p-3 gap-4"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(p.startDate), 'MMM d')} –{' '}
                        {format(new Date(p.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <Badge variant="outline">{p.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
