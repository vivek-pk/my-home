import { ProtectedRoute } from '@/components/auth/protected-route';
import { TimelineView } from '@/components/timeline/timeline-view';
import { getProjectById } from '@/lib/db/projects';
import { getSession } from '@/lib/session';
import { canAccessProject } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';

async function getProjectWithAccess(projectId: string) {
  const session = await getSession();
  if (!session) return null;

  const project = await getProjectById(projectId);
  if (!project) return null;

  if (!canAccessProject(session.role, session.id, project)) {
    return null;
  }

  return project;
}

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectWithAccess(id);

  if (!project) {
    notFound();
  }

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
                  Project Timeline & Progress
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/dashboard/projects/${project._id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Project
                  </Button>
                </Link>
                <LogoutButton variant="outline" size="sm" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="rounded border p-2 sm:p-4">
            <TimelineView project={project} canEdit={true} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
