export interface Project {
  _id?: string
  name: string
  description: string
  homeownerId: string
  engineerIds: string[]
  managerIds: string[]
  timeline: ProjectPhase[]
  status: "planning" | "in-progress" | "completed" | "on-hold"
  createdAt: Date
  updatedAt: Date
  floorPlans: FileUpload[]
  images: FileUpload[]
}

export interface ProjectPhase {
  _id?: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: "pending" | "in-progress" | "completed" | "delayed"
  materials: Material[]
  updates: ProjectUpdate[]
}

export interface Material {
  name: string
  quantity: number
  unit: string
  cost?: number
  supplier?: string
}

export interface ProjectUpdate {
  _id?: string
  userId: string
  userName: string
  message: string
  images?: FileUpload[]
  createdAt: Date
}

export interface FileUpload {
  _id?: string
  filename: string
  originalName: string
  url: string
  type: "image" | "pdf"
  size: number
  uploadedAt: Date
  uploadedBy: string
}

export interface CreateProjectData {
  name: string
  description: string
  homeownerId: string
  engineerIds: string[]
  managerIds: string[]
  timeline: Omit<ProjectPhase, "_id" | "updates">[]
}
