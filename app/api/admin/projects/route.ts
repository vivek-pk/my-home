import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createProject } from '@/lib/db/projects';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    const project = await createProject(projectData);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
