import { getDatabase } from '../mongodb';
import type { User, CreateUserData } from '../models/User';
import { ObjectId, type Collection, type Document, type Filter } from 'mongodb';

export async function createUser(userData: CreateUserData): Promise<User> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const user: Omit<User, '_id'> = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(user as unknown as Document);
  return { ...user, _id: result.insertedId.toString() };
}

export async function getUserByMobile(mobile: string): Promise<User | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const doc = await collection.findOne({ mobile } as Filter<Document>);
  if (!doc) return null;

  return {
    ...(doc as unknown as User),
    _id: (doc as unknown as { _id?: { toString(): string } })._id?.toString(),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const doc = await collection.findOne({
    _id: new ObjectId(id),
  } as Filter<Document>);
  if (!doc) return null;

  return {
    ...(doc as unknown as User),
    _id: (doc as unknown as { _id?: { toString(): string } })._id?.toString(),
  };
}

export async function getUsersByRole(role: User['role']): Promise<User[]> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const users = await collection.find({ role } as Filter<Document>).toArray();
  return users.map((doc) => ({
    ...(doc as unknown as User),
    _id: (doc as unknown as { _id?: { toString(): string } })._id?.toString(),
  }));
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | null> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const entries = Object.entries(updates as Record<string, unknown>).filter(
    ([k]) => k !== '_id'
  );
  const toSet = {
    ...Object.fromEntries(entries),
    updatedAt: new Date(),
  } as Document;

  const updatedDoc = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) } as Filter<Document>,
    { $set: toSet } as unknown as import('mongodb').UpdateFilter<Document>,
    { returnDocument: 'after' }
  );

  const updated = updatedDoc as unknown as Document | null;
  if (!updated) return null;
  return {
    ...(updated as unknown as User),
    _id: (
      updated as unknown as { _id?: { toString(): string } }
    )._id?.toString(),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase();
  const collection: Collection<Document> = db.collection('users');

  const users = await collection.find({}).toArray();
  return users.map((doc) => ({
    ...(doc as unknown as User),
    _id: (doc as unknown as { _id?: { toString(): string } })._id?.toString(),
  }));
}
