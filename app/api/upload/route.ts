import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { saveFile, validateFile } from "@/lib/upload"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "image"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validationError = validateFile(file, type as "image" | "pdf")
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Save file
    const uploadResult = await saveFile(file, type as "image" | "pdf")

    // Add metadata
    const fileData = {
      ...uploadResult,
      uploadedAt: new Date(),
      uploadedBy: session.id,
    }

    return NextResponse.json({ success: true, file: fileData })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
