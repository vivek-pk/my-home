import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  addProjectUpdate,
  deleteProjectUpdate,
  updateProject,
  getProjectById,
} from '@/lib/db/projects';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the project to check access permissions
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess =
      session.role === 'admin' ||
      project.homeownerId === session.id ||
      project.engineerIds.includes(session.id) ||
      project.managerIds.includes(session.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Collect all updates from all phases
    const allUpdates = project.timeline.flatMap((phase) =>
      (phase.updates || []).map((update) => ({
        ...update,
        phaseId: phase._id,
        phaseName: phase.name,
      }))
    );

    // Sort by creation date, newest first
    allUpdates.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      updates: allUpdates,
      totalCount: allUpdates.length,
    });
  } catch (error) {
    console.error('Get updates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    console.log('POST Update Debug:', {
      phaseId,
      phaseName,
      rawMessage: rawMsg,
      finalMessage: msg,
      phaseStatus,
      sessionUser: session.name,
      sessionId: session.id,
    });

    // Require a phase selector (id or name) and at least one of message or phaseStatus
    if ((!phaseId && !phaseName) || (!rawMsg && !phaseStatus)) {
      console.log('Missing required fields validation failed');
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

    console.log('Phase search:', {
      phaseId,
      phaseName,
      targetIndex,
      projectPhases: project.timeline.map((p) => ({
        _id: p._id,
        name: p.name,
      })),
    });

    if (targetIndex === -1) {
      console.log('Phase not found!');
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

    console.log('Update payload:', update);
    console.log('Target phase:', {
      _id: targetPhase._id,
      name: targetPhase.name,
    });

    // Do a single combined update for both message and status
    if (msg) {
      if (targetPhase._id) {
        console.log(
          'Using addProjectUpdate function with phaseId:',
          targetPhase._id
        );
        const result = await addProjectUpdate(id, targetPhase._id, update);
        console.log('addProjectUpdate result:', result ? 'Success' : 'Failed');

        // If we also need to update status, do it after the update is saved
        if (phaseStatus && phaseStatus !== targetPhase.status) {
          console.log('Updating phase status to:', phaseStatus);
          const statusResult = await updateProject(id, {
            timeline: project.timeline.map((p, i) =>
              i === targetIndex ? { ...p, status: phaseStatus } : p
            ),
          });
          console.log(
            'Status update result:',
            statusResult ? 'Success' : 'Failed'
          );
        }
      } else {
        console.log('Using fallback timeline update for legacy phase');
        // Fallback for legacy phases without _id: update timeline immutably by index
        const updateWithId = { ...update, _id: new ObjectId().toString() };
        const updatedTimeline = project.timeline.map((p, i) =>
          i === targetIndex
            ? {
                ...p,
                updates: [...(p.updates || []), updateWithId],
                status: phaseStatus || p.status, // Update status at the same time
              }
            : p
        );
        const result = await updateProject(id, { timeline: updatedTimeline });
        console.log(
          'Legacy timeline update result:',
          result ? 'Success' : 'Failed'
        );
      }
    } else if (phaseStatus) {
      // Only status change, no message
      console.log('Status-only update to:', phaseStatus);
      const updatedTimeline = project.timeline.map((p, i) =>
        i === targetIndex ? { ...p, status: phaseStatus } : p
      );
      const result = await updateProject(id, { timeline: updatedTimeline });
      console.log('Status-only update result:', result ? 'Success' : 'Failed');
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || !['admin', 'engineer', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phaseId = searchParams.get('phaseId');
    const updateId = searchParams.get('updateId');

    console.log('DELETE Update Debug:', {
      projectId: id,
      phaseId,
      updateId,
      sessionUser: session.name,
      sessionId: session.id,
    });

    if (!phaseId || !updateId) {
      return NextResponse.json(
        { error: 'Missing phaseId or updateId' },
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

    // Additional permission check: users can only delete their own updates (unless admin)
    const targetPhase = project.timeline.find((p) => p._id === phaseId);
    if (!targetPhase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const targetUpdate = targetPhase.updates?.find((u) => u._id === updateId);
    if (!targetUpdate) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && targetUpdate.userId !== session.id) {
      return NextResponse.json(
        {
          error: 'You can only delete your own updates',
        },
        { status: 403 }
      );
    }

    console.log('Deleting update:', {
      updateId,
      createdBy: targetUpdate.userId,
      deletedBy: session.id,
    });

    // Delete the update
    const result = await deleteProjectUpdate(id, phaseId, updateId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete update' },
        { status: 500 }
      );
    }

    console.log('Update deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
