import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateProject, getProjectById } from '@/lib/db/projects';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || !['admin', 'engineer', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phaseId, phaseName, materials } = await request.json();

    // Require a phase selector (id or name) and a materials array
    if ((!phaseId && !phaseName) || !Array.isArray(materials)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current project
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Only assigned engineers/managers (or admin) can update materials
    if (
      session.role !== 'admin' &&
      !(
        project.engineerIds.includes(session.id) ||
        project.managerIds.includes(session.id)
      )
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find target phase by id or name
    const targetIndex = project.timeline.findIndex(
      (p) => (phaseId && p._id === phaseId) || (!phaseId && phaseName && p.name === phaseName)
    );
    if (targetIndex === -1) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Sanitize materials payload
    type Incoming = unknown;
    const has = (o: Incoming, k: string) =>
      typeof o === 'object' && o !== null && k in o;
    const get = (o: Incoming, k: string) => (has(o, k) ? (o as Record<string, unknown>)[k] : undefined);

    const safeMaterials = (materials as Incoming[])
      .filter((m) => has(m, 'name') && has(m, 'unit'))
      .map((m) => ({
        name: String(get(m, 'name') ?? '').trim(),
        unit: String(get(m, 'unit') ?? '').trim(),
        quantity: Number(get(m, 'quantity') ?? 0),
        cost:
          get(m, 'cost') !== undefined && get(m, 'cost') !== null && get(m, 'cost') !== ''
            ? Number(get(m, 'cost'))
            : undefined,
        supplier: get(m, 'supplier') ? String(get(m, 'supplier')) : undefined,
      }));

    const updatedTimeline = project.timeline.map((phase, i) =>
      (project.timeline[targetIndex]._id ? phase._id === project.timeline[targetIndex]._id : i === targetIndex)
        ? { ...phase, materials: safeMaterials }
        : phase
    );

    await updateProject(id, { timeline: updatedTimeline });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update materials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
