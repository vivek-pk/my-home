'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useEffect } from 'react';
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
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityItem {
  projectId: string;
  projectName: string;
  phaseName?: string;
  message: string;
  userName?: string;
  createdAt: Date;
}

interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  recent: RecentActivityItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const data = await response.json();
          console.log("sats",data);
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-500">
          Failed to load dashboard data.
        </div>
      </AdminLayout>
    );
  }

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
                      className="flex items-start space-x-3 p-2 rounded-md hover:bg-primary hover:text-white transition-colors group"
                    >
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-white" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium group-hover:text-white">
                            {item.projectName}
                          </span>{' '}
                          {item.phaseName && (
                            <>
                              –{' '}
                              <span className="text-muted-foreground group-hover:text-white">
                                {item.phaseName}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground group-hover:text-white line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground group-hover:text-white">
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
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-primary hover:text-white transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <FolderPlus className="h-5 w-5 text-primary group-hover:text-white" />
                  <span className="font-medium group-hover:text-white">
                    Create New Project
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:text-white" />
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-primary hover:text-white transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-secondary group-hover:text-white" />
                  <span className="font-medium group-hover:text-white">
                    Manage Users
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:text-white" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
