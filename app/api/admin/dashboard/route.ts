import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDatabase } from '@/lib/mongodb';
import type {
  Project,
  ProjectPhase,
  ProjectUpdate,
} from '@/lib/models/Project';

export const runtime = 'nodejs';

interface RecentActivityItem {
  projectId: string;
  projectName: string;
  phaseName?: string;
  message: string;
  userName?: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Sort recent activity by date and take the last 5
    recent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const recentActivity = recent.slice(0, 5);

    return NextResponse.json({
      totalProjects,
      totalUsers,
      activeProjects,
      completedProjects,
      recent: recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
