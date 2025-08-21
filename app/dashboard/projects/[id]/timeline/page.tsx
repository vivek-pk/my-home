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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground">
                  Project Timeline & Progress
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/projects/${project._id}`}>
                  <Button variant="ghost" size="sm">
                    Project
                  </Button>
                </Link>
                <LogoutButton variant="outline" size="sm" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <TimelineView project={project} canEdit={true} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
