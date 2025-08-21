import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createUser, getUserByMobile } from "@/lib/db/users"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, mobile, role } = await request.json()

    // Validate required fields
    if (!name || !mobile || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["admin", "manager", "engineer", "homeowner"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByMobile(mobile)
    if (existingUser) {
      return NextResponse.json({ error: "User with this mobile number already exists" }, { status: 400 })
    }

    // Create user
    const user = await createUser({ name, mobile, role })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
