import { HomeownerLayout } from '@/components/homeowner/homeowner-layout';
import { UpdatesHistory } from '@/components/timeline/updates-history';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSession } from '@/lib/session';
import { getProjectsByUserId } from '@/lib/db/projects';
import type { Project, ProjectPhase } from '@/lib/models/Project';
import { getUserById } from '@/lib/db/users';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';

async function getHomeownerData() {
  const session = await getSession();
  if (!session) return null;

  const [user, projects] = await Promise.all([
    getUserById(session.id),
    getProjectsByUserId(session.id, session.role),
  ]);

  return {
    user,
    projects,
    currentUser: {
      id: session.id,
      role: session.role,
      name: session.name,
    },
  };
}

function getProjectStatus(project: Project) {
  const completedPhases = project.timeline.filter(
    (phase: ProjectPhase) => phase.status === 'completed'
  ).length;
  const totalPhases = project.timeline.length;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  if (project.status === 'completed')
    return {
      status: 'Completed',
      color: 'bg-green-100 text-green-800',
      progress,
    };
  if (project.status === 'on-hold')
    return {
      status: 'On Hold',
      color: 'bg-yellow-100 text-yellow-800',
      progress,
    };
  if (progress === 0)
    return {
      status: 'Starting Soon',
      color: 'bg-blue-100 text-blue-800',
      progress,
    };
  if (progress < 100)
    return {
      status: 'In Progress',
      color: 'bg-orange-100 text-orange-800',
      progress,
    };
  return {
    status: 'Completed',
    color: 'bg-green-100 text-green-800',
    progress,
  };
}

function getNextMilestone(project: Project) {
  const nextPhase = project.timeline.find(
    (phase: ProjectPhase) =>
      phase.status === 'pending' || phase.status === 'in-progress'
  );
  return nextPhase;
}

export default async function HomeownerDashboard() {
  const data = await getHomeownerData();

  if (!data || !data.projects.length) {
    return (
      <HomeownerLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
          <p className="text-muted-foreground text-center">
            You don&apos;t have any construction projects assigned yet. Please
            contact your project administrator.
          </p>
        </div>
      </HomeownerLayout>
    );
  }

  const project = data.projects[0]; // Assuming homeowner has one project
  const projectStatus = getProjectStatus(project);
  const nextMilestone = getNextMilestone(project);

  return (
    <HomeownerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-1 px-2">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            Welcome back, {data.user?.name}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here&apos;s the latest on your construction project
          </p>
        </div>

        {/* Cover Section */}
        {project.coverImage && (
          <div className="relative rounded-lg overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage.url}
              alt={project.coverImage.originalName}
              className="h-48 w-full object-cover md:h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold drop-shadow-sm">
                {project.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                <Badge className={projectStatus.color}>
                  {projectStatus.status}
                </Badge>
                {project.budget && (
                  <span className="px-2 py-1 rounded bg-background/70 border text-muted-foreground">
                    Budget: ${project.budget.toLocaleString()}
                  </span>
                )}
                {project.startDate && project.endDate && (
                  <span className="px-2 py-1 rounded bg-background/70 border text-muted-foreground">
                    {format(new Date(project.startDate), 'MMM d')} –{' '}
                    {format(new Date(project.endDate), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <Badge className={projectStatus.color}>
                {projectStatus.status}
              </Badge>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{project.timeline.length} Total Phases</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  {
                    project.timeline.filter(
                      (phase: ProjectPhase) => phase.status === 'completed'
                    ).length
                  }{' '}
                  Phases Completed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Started {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </span>
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
                  <p className="text-sm text-muted-foreground">
                    {nextMilestone.description}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span>
                      Expected:{' '}
                      {format(new Date(nextMilestone.endDate), 'MMM d, yyyy')}
                    </span>
                    <Badge variant="outline">
                      {differenceInDays(
                        new Date(nextMilestone.endDate),
                        new Date()
                      )}{' '}
                      days remaining
                    </Badge>
                  </div>
                  <Link href="/homeowner/timeline">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                    >
                      View Full Timeline
                    </Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Updates */}
        <UpdatesHistory
          projectId={project._id!}
          maxUpdates={5}
          showPhaseInfo={true}
          currentUser={data.currentUser}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/homeowner/timeline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-4 pt-6">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">View Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    See detailed project progress
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Access floor plans and photos
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </HomeownerLayout>
  );
}
