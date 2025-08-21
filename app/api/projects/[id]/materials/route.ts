import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateProject, getProjectById } from "@/lib/db/projects"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session || !["admin", "engineer", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phaseId, materials } = await request.json()

    if (!phaseId || !materials) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get current project
    const project = await getProjectById(params.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Update the specific phase's materials
    const updatedTimeline = project.timeline.map((phase) => (phase._id === phaseId ? { ...phase, materials } : phase))

    await updateProject(params.id, { timeline: updatedTimeline })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update materials error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
