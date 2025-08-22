import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getProjectById, updateProject } from '@/lib/db/projects';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || !['admin', 'engineer', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // For non-admins, ensure they are assigned to the project
    if (
      session.role !== 'admin' &&
      !(
        project.engineerIds.includes(session.id) ||
        project.managerIds.includes(session.id)
      )
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectData = await request.json();

    // Validate required fields
    if (
      !projectData.name ||
      !projectData.description ||
      !projectData.homeownerId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingProject = await getProjectById(id);
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Ensure timeline phases have IDs and preserve existing updates when possible
    let timeline = projectData.timeline || [];
    if (Array.isArray(timeline)) {
      timeline = timeline.map((phase: unknown) => {
        const p = phase as {
          _id?: string;
          name?: string;
          [key: string]: unknown;
        };
        const existing = existingProject.timeline.find(
          (e) => e.name === p.name
        );
        return {
          _id: p._id || existing?._id || new ObjectId().toString(),
          updates: existing?.updates || [],
          ...(phase as object),
        } as unknown as (typeof existingProject.timeline)[number];
      });
    }

    const updatedProject = await updateProject(id, {
      ...projectData,
      timeline,
      // preserve files if not explicitly provided
      floorPlans: projectData.floorPlans ?? existingProject.floorPlans,
      images: projectData.images ?? existingProject.images,
      coverImage: projectData.coverImage ?? existingProject.coverImage,
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
