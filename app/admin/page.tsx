import { AdminLayout } from '@/components/admin/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDatabase } from '@/lib/mongodb';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  FolderPlus,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type {
  Project,
  ProjectPhase,
  ProjectUpdate,
} from '@/lib/models/Project';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityItem {
  projectId: string;
  projectName: string;
  phaseName?: string;
  message: string;
  userName?: string;
  createdAt: Date;
}

async function getDashboardStats(): Promise<{
  totalProjects: number;
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  recent: RecentActivityItem[];
}> {
  const db = await getDatabase();

  const [
    totalProjects,
    totalUsers,
    activeProjects,
    completedProjects,
    projects,
  ] = await Promise.all([
    db.collection('projects').countDocuments(),
    db.collection('users').countDocuments(),
    db.collection('projects').countDocuments({ status: 'in-progress' }),
    db.collection('projects').countDocuments({ status: 'completed' }),
    db
      .collection('projects')
      .find({})
      .project({ name: 1, timeline: 1 })
      .toArray(),
  ]);

  // Extract updates from all project phases
  const recent: RecentActivityItem[] = [];
  for (const p of projects as unknown as Project[]) {
    for (const phase of (p.timeline || []) as ProjectPhase[]) {
      for (const upd of (phase.updates || []) as ProjectUpdate[]) {
        recent.push({
          projectId: p._id || '',
          projectName: p.name,
          phaseName: phase.name,
          message: upd.message,
          userName: upd.userName,
          createdAt: new Date(upd.createdAt),
        });
      }
    }
  }

  recent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const limitedRecent = recent.slice(0, 8);

  return {
    totalProjects,
    totalUsers,
    activeProjects,
    completedProjects,
    recent: limitedRecent,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      description: 'All construction projects',
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered users in system',
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      description: 'Currently in progress',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Completed Projects',
      value: stats.completedProjects,
      description: 'Successfully finished',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your construction projects and team members
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest real project updates</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recent.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent.map((item) => (
                    <Link
                      key={`${item.projectId}-${item.createdAt.toISOString()}`}
                      href={`/admin/projects/${item.projectId}`}
                      className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {item.projectName}
                          </span>{' '}
                          {item.phaseName && (
                            <>
                              –{' '}
                              <span className="text-muted-foreground">
                                {item.phaseName}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.userName && (
                            <span className="mr-1">{item.userName} •</span>
                          )}
                          {formatDistanceToNow(item.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/admin/projects/create"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <span className="font-medium">Create New Project</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
