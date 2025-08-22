import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  addProjectUpdate,
  updateProject,
  getProjectById,
} from '@/lib/db/projects';
import { ObjectId } from 'mongodb';

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

    const { phaseId, phaseName, message, phaseStatus, images } =
      await request.json();
    const rawMsg = typeof message === 'string' ? message.trim() : '';
    // If only a status change without message, create a synthetic message so homeowners can see activity
    const msg =
      rawMsg || (phaseStatus ? `Status changed to ${phaseStatus}` : '');

    // Require a phase selector (id or name) and at least one of message or phaseStatus
    if ((!phaseId && !phaseName) || (!rawMsg && !phaseStatus)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the user is assigned to the project (unless admin)
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (
      session.role !== 'admin' &&
      !(
        project.engineerIds.includes(session.id) ||
        project.managerIds.includes(session.id)
      )
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Locate target phase by id or name
    const targetIndex = project.timeline.findIndex(
      (p) =>
        (phaseId && p._id === phaseId) ||
        (!phaseId && phaseName && p.name === phaseName)
    );
    if (targetIndex === -1) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }
    const targetPhase = project.timeline[targetIndex];

    // Build update payload
    const update = {
      userId: session.id,
      userName: session.name,
      message: msg,
      images: Array.isArray(images) ? images : undefined,
      createdAt: new Date(),
    };

    if (msg) {
      if (targetPhase._id) {
        await addProjectUpdate(id, targetPhase._id, update);
      } else {
        // Fallback for legacy phases without _id: update timeline immutably by index
        const updateWithId = { ...update, _id: new ObjectId().toString() };
        const updatedTimeline = project.timeline.map((p, i) =>
          i === targetIndex
            ? { ...p, updates: [...(p.updates || []), updateWithId] }
            : p
        );
        await updateProject(id, { timeline: updatedTimeline });
      }
    }

    // Update phase status if provided (avoid double-updating timeline already mutated above without status change)
    if (phaseStatus) {
      const updatedTimeline = project.timeline.map((p, i) =>
        (targetPhase._id ? p._id === targetPhase._id : i === targetIndex)
          ? { ...p, status: phaseStatus }
          : p
      );
      await updateProject(id, { timeline: updatedTimeline });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
