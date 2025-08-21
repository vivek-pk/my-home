import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export interface UploadResult {
  filename: string
  originalName: string
  url: string
  type: "image" | "pdf"
  size: number
}

export async function saveFile(file: File, type: "image" | "pdf" = "image"): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create upload directory if it doesn't exist
  const uploadDir = join(process.cwd(), "public", "uploads", type + "s")
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split(".").pop()
  const filename = `${timestamp}-${randomString}.${extension}`

  // Save file
  const filePath = join(uploadDir, filename)
  await writeFile(filePath, buffer)

  return {
    filename,
    originalName: file.name,
    url: `/uploads/${type}s/${filename}`,
    type,
    size: file.size,
  }
}

export function validateFile(file: File, type: "image" | "pdf"): string | null {
  const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB for images, 50MB for PDFs

  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`
  }

  if (type === "image") {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed"
    }
  } else if (type === "pdf") {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed"
    }
  }

  return null
}
