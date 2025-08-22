import { getDatabase } from '../mongodb';
import type {
  Project,
  CreateProjectData,
  ProjectUpdate,
  FileUpload,
} from '../models/Project';
import { ObjectId, type Collection, type Document, type Filter } from 'mongodb';

export async function createProject(
  projectData: CreateProjectData
): Promise<Project> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  // Ensure each phase has an _id and empty updates array on creation
  const timeline = (projectData.timeline || []).map((phase) => ({
    _id: new ObjectId().toString(),
    ...phase,
    updates: [],
  }));

  const project: Omit<Project, '_id'> = {
    name: projectData.name,
    description: projectData.description,
    homeownerId: projectData.homeownerId,
    engineerIds: projectData.engineerIds,
    managerIds: projectData.managerIds,
    timeline,
    status: 'planning',
    // optional high-level attributes
    budget: projectData.budget,
    startDate: projectData.startDate
      ? new Date(projectData.startDate)
      : undefined,
    endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    floorPlans: projectData.floorPlans || [],
    images: projectData.images || [],
    coverImage: (projectData as CreateProjectData & { coverImage?: FileUpload })
      .coverImage,
  };

  const result = await collection.insertOne(project as unknown as Document);
  return { ...project, _id: result.insertedId.toString() };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  const project = await collection.findOne({
    _id: new ObjectId(id),
  } as Filter<Document>);
  if (!project) return null;

  return {
    ...(project as unknown as Project),
    _id: (
      project as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  };
}

export async function getProjectsByUserId(
  userId: string,
  userRole: string
): Promise<Project[]> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  let query: Filter<Document> = {};

  switch (userRole) {
    case 'homeowner':
      query = { homeownerId: userId };
      break;
    case 'engineer':
      query = { engineerIds: userId };
      break;
    case 'manager':
      query = { managerIds: userId };
      break;
    case 'admin':
      // Admin can see all projects
      break;
    default:
      return [];
  }

  const projects = await collection.find(query).toArray();
  return projects.map((project) => ({
    ...(project as unknown as Project),
    _id: (
      project as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  }));
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) } as Filter<Document>,
    {
      $set: { ...(updates as unknown as Document), updatedAt: new Date() },
    } as unknown as import('mongodb').UpdateFilter<Document>,
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...(result as unknown as Project),
    _id: (
      result as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  };
}

export async function addProjectUpdate(
  projectId: string,
  phaseId: string,
  update: Omit<ProjectUpdate, '_id'>
): Promise<Project | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  const updateWithId = { ...update, _id: new ObjectId().toString() };

  const result = await collection.findOneAndUpdate(
    {
      _id: new ObjectId(projectId),
      'timeline._id': phaseId,
    } as unknown as Filter<Document>,
    {
      $push: { 'timeline.$.updates': updateWithId },
      $set: { updatedAt: new Date() },
    } as unknown as import('mongodb').UpdateFilter<Document>,
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return {
    ...(result as unknown as Project),
    _id: (
      result as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('projects');

  const projects = await collection.find({}).toArray();
  return projects.map((project) => ({
    ...(project as unknown as Project),
    _id: (
      project as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  }));
}
