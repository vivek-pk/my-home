export interface User {
  _id?: string
  mobile: string
  name: string
  role: "admin" | "engineer" | "manager" | "homeowner"
  createdAt: Date
  updatedAt: Date
  projectIds?: string[] // Projects assigned to this user
}

export interface CreateUserData {
  mobile: string
  name: string
  role: "admin" | "engineer" | "manager" | "homeowner"
  projectIds?: string[]
}
