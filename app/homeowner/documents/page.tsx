import { HomeownerLayout } from '@/components/homeowner/homeowner-layout';
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
import type { FileUpload as FileUploadModel } from '@/lib/models/Project';
import Image from 'next/image';
import { FileText, ImageIcon, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

async function getHomeownerProject() {
  const session = await getSession();
  if (!session) return null;

  const projects = await getProjectsByUserId(session.id, session.role);
  return projects[0] || null;
}

export default async function HomeownerDocumentsPage() {
  const project = await getHomeownerProject();

  if (!project) {
    return (
      <HomeownerLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Project Found</h2>
          <p className="text-muted-foreground">
            You don&apos;t have any construction projects assigned yet.
          </p>
        </div>
      </HomeownerLayout>
    );
  }

  const allImages: FileUploadModel[] = [
    ...(project.images || []),
    ...project.timeline.flatMap(
      (phase) => phase.updates?.flatMap((update) => update.images || []) || []
    ),
  ];

  return (
    <HomeownerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Project Documents</h1>
          <p className="text-muted-foreground">
            View floor plans, photos, and project documentation
          </p>
        </div>

        {/* Floor Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Floor Plans & Documents</span>
            </CardTitle>
            <CardDescription>
              Official project blueprints and documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.floorPlans && project.floorPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.floorPlans.map(
                  (file: FileUploadModel, index: number) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded">
                              <FileText className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {file.originalName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Uploaded{' '}
                                {format(
                                  new Date(file.uploadedAt),
                                  'MMM d, yyyy'
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.url} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No floor plans uploaded yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-secondary" />
              <span>Project Photos</span>
            </CardTitle>
            <CardDescription>
              Progress photos and project images
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allImages.map((image: FileUploadModel, index: number) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-muted relative">
                      <Image
                        src={image.url || '/placeholder.svg'}
                        alt={image.originalName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                        unoptimized
                      />
                    </div>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm truncate">
                          {image.originalName}
                        </h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(image.uploadedAt), 'MMM d, yyyy')}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No project photos available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
