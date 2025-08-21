import { cookies } from "next/headers"
import { verifyToken, type AuthUser } from "./auth"

const SESSION_COOKIE_NAME = "construction-auth-token"

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  return verifyToken(token)
}

export async function setSession(user: AuthUser): Promise<void> {
  const cookieStore = await cookies()
  const token = generateToken(user)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

function generateToken(user: AuthUser): string {
  // Import here to avoid circular dependency
  const jwt = require("jsonwebtoken")
  const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}
