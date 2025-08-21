import { getDatabase } from "../mongodb"
import type { Project, CreateProjectData, ProjectUpdate } from "../models/Project"
import { ObjectId } from "mongodb"

export async function createProject(projectData: CreateProjectData): Promise<Project> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  const project: Omit<Project, "_id"> = {
    ...projectData,
    status: "planning",
    createdAt: new Date(),
    updatedAt: new Date(),
    floorPlans: [],
    images: [],
  }

  const result = await collection.insertOne(project)
  return { ...project, _id: result.insertedId.toString() }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  const project = await collection.findOne({ _id: new ObjectId(id) })
  if (!project) return null

  return { ...project, _id: project._id?.toString() }
}

export async function getProjectsByUserId(userId: string, userRole: string): Promise<Project[]> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  let query: any = {}

  switch (userRole) {
    case "homeowner":
      query = { homeownerId: userId }
      break
    case "engineer":
      query = { engineerIds: userId }
      break
    case "manager":
      query = { managerIds: userId }
      break
    case "admin":
      // Admin can see all projects
      break
    default:
      return []
  }

  const projects = await collection.find(query).toArray()
  return projects.map((project) => ({ ...project, _id: project._id?.toString() }))
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" },
  )

  if (!result) return null
  return { ...result, _id: result._id?.toString() }
}

export async function addProjectUpdate(
  projectId: string,
  phaseId: string,
  update: Omit<ProjectUpdate, "_id">,
): Promise<Project | null> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  const updateWithId = { ...update, _id: new ObjectId().toString() }

  const result = await collection.findOneAndUpdate(
    {
      _id: new ObjectId(projectId),
      "timeline._id": phaseId,
    },
    {
      $push: { "timeline.$.updates": updateWithId },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: "after" },
  )

  if (!result) return null
  return { ...result, _id: result._id?.toString() }
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase()
  const collection = db.collection<Project>("projects")

  const projects = await collection.find({}).toArray()
  return projects.map((project) => ({ ...project, _id: project._id?.toString() }))
}
