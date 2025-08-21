import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { addProjectUpdate, updateProject, getProjectById } from "@/lib/db/projects"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session || !["admin", "engineer", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phaseId, message, phaseStatus } = await request.json()

    if (!phaseId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add the update
    const update = {
      userId: session.id,
      userName: session.name,
      message,
      createdAt: new Date(),
    }

    await addProjectUpdate(params.id, phaseId, update)

    // Update phase status if provided
    if (phaseStatus) {
      const project = await getProjectById(params.id)
      if (project) {
        const updatedTimeline = project.timeline.map((phase) =>
          phase._id === phaseId ? { ...phase, status: phaseStatus } : phase,
        )

        await updateProject(params.id, { timeline: updatedTimeline })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
