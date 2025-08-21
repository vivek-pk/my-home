import jwt from "jsonwebtoken"
import { getUserByMobile } from "./db/users"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export interface AuthUser {
  id: string
  mobile: string
  name: string
  role: "admin" | "engineer" | "manager" | "homeowner"
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export async function authenticateUser(mobile: string): Promise<AuthUser | null> {
  const user = await getUserByMobile(mobile)
  if (!user) return null

  return {
    id: user._id!,
    mobile: user.mobile,
    name: user.name,
    role: user.role,
  }
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: string): boolean {
  return userRole === "admin"
}

export function canAccessProject(userRole: string, userId: string, project: any): boolean {
  if (userRole === "admin") return true
  if (userRole === "homeowner" && project.homeownerId === userId) return true
  if (userRole === "engineer" && project.engineerIds.includes(userId)) return true
  if (userRole === "manager" && project.managerIds.includes(userId)) return true
  return false
}
