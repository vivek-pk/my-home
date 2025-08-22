import AdminLayout from '@/components/admin/admin-layout';
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
import Image from 'next/image';
import { getProjectById } from '@/lib/db/projects';
import { notFound } from 'next/navigation';
import {
  Building2,
  Calendar,
  Users,
  FileText,
  ImageIcon,
  Pencil,
} from 'lucide-react';
import { TimelineView } from '@/components/timeline/timeline-view';

export default async function AdminProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const teamCount =
    (project.engineerIds?.length || 0) + (project.managerIds?.length || 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {project.status.replace('-', ' ')}
            </Badge>
            <Link href={`/admin/projects/${project._id}/edit`}>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" /> Project Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /> Team members: {teamCount}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> Phases:{' '}
                {project.timeline?.length || 0}
              </div>
              {project.startDate && project.endDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.startDate).toLocaleDateString()} –{' '}
                  {new Date(project.endDate).toLocaleDateString()}
                </div>
              )}
              {project.budget != null && (
                <div className="text-muted-foreground">
                  Budget: ₹{project.budget.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Project Files</CardTitle>
              <CardDescription>Floor plans and images</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Floor Plans</span>
                </div>
                <div className="space-y-2">
                  {project.floorPlans?.length ? (
                    project.floorPlans.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <span className="truncate mr-2">{f.originalName}</span>
                        <Link href={f.url} target="_blank">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No floor plans
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Images</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {project.images?.length ? (
                    project.images.map((img, i) => (
                      <Link
                        key={i}
                        href={img.url}
                        target="_blank"
                        className="block"
                      >
                        <div className="relative w-full h-20 rounded border overflow-hidden">
                          <Image
                            src={img.url}
                            alt={img.originalName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            priority={false}
                            unoptimized
                          />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No images
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Phases, materials and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineView project={project} canEdit={false} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
