import type { AuthUser } from "./auth"

export interface Permission {
  resource: string
  action: string
}

export const PERMISSIONS = {
  // Project permissions
  PROJECT_CREATE: { resource: "project", action: "create" },
  PROJECT_READ: { resource: "project", action: "read" },
  PROJECT_UPDATE: { resource: "project", action: "update" },
  PROJECT_DELETE: { resource: "project", action: "delete" },

  // User permissions
  USER_CREATE: { resource: "user", action: "create" },
  USER_READ: { resource: "user", action: "read" },
  USER_UPDATE: { resource: "user", action: "update" },
  USER_DELETE: { resource: "user", action: "delete" },

  // Timeline permissions
  TIMELINE_READ: { resource: "timeline", action: "read" },
  TIMELINE_UPDATE: { resource: "timeline", action: "update" },

  // File permissions
  FILE_UPLOAD: { resource: "file", action: "upload" },
  FILE_READ: { resource: "file", action: "read" },

  // Analytics permissions
  ANALYTICS_READ: { resource: "analytics", action: "read" },
} as const

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.TIMELINE_READ,
    PERMISSIONS.TIMELINE_UPDATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  manager: [
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.TIMELINE_READ,
    PERMISSIONS.TIMELINE_UPDATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_READ,
  ],
  engineer: [
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TIMELINE_READ,
    PERMISSIONS.TIMELINE_UPDATE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_READ,
  ],
  homeowner: [PERMISSIONS.PROJECT_READ, PERMISSIONS.TIMELINE_READ, PERMISSIONS.FILE_READ],
}

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.some((p) => p.resource === permission.resource && p.action === permission.action)
}

export function canAccessResource(user: AuthUser, resource: string, action: string): boolean {
  return hasPermission(user, { resource, action })
}

export function getUserPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

export function canManageUsers(user: AuthUser): boolean {
  return hasPermission(user, PERMISSIONS.USER_CREATE)
}

export function canCreateProjects(user: AuthUser): boolean {
  return hasPermission(user, PERMISSIONS.PROJECT_CREATE)
}

export function canUpdateTimeline(user: AuthUser): boolean {
  return hasPermission(user, PERMISSIONS.TIMELINE_UPDATE)
}

export function canUploadFiles(user: AuthUser): boolean {
  return hasPermission(user, PERMISSIONS.FILE_UPLOAD)
}

export function canViewAnalytics(user: AuthUser): boolean {
  return hasPermission(user, PERMISSIONS.ANALYTICS_READ)
}
