import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getProjectById, updateProject } from "@/lib/db/projects"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session || !["admin", "engineer", "manager"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectData = await request.json()

    // Validate required fields
    if (!projectData.name || !projectData.description || !projectData.homeownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingProject = await getProjectById(id)
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updatedProject = await updateProject(id, projectData)

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
