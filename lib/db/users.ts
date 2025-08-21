import { getDatabase } from "../mongodb"
import type { User, CreateUserData } from "../models/User"
import { ObjectId } from "mongodb"

export async function createUser(userData: CreateUserData): Promise<User> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const user: Omit<User, "_id"> = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await collection.insertOne(user)
  return { ...user, _id: result.insertedId.toString() }
}

export async function getUserByMobile(mobile: string): Promise<User | null> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const user = await collection.findOne({ mobile })
  if (!user) return null

  return { ...user, _id: user._id?.toString() }
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const user = await collection.findOne({ _id: new ObjectId(id) })
  if (!user) return null

  return { ...user, _id: user._id?.toString() }
}

export async function getUsersByRole(role: User["role"]): Promise<User[]> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const users = await collection.find({ role }).toArray()
  return users.map((user) => ({ ...user, _id: user._id?.toString() }))
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" },
  )

  if (!result) return null
  return { ...result, _id: result._id?.toString() }
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase()
  const collection = db.collection<User>("users")

  const users = await collection.find({}).toArray()
  return users.map((user) => ({ ...user, _id: user._id?.toString() }))
}
