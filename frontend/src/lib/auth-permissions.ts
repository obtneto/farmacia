export type PermissionRoute = {
  id?: number | string
  path?: string
  link?: string
  route?: string
  url?: string
  pathname?: string
  [key: string]: unknown
}

export function getAllowedRoutePaths(): string[] {
  return []
}

export function userHasGroup(): boolean {
  return false
}

export function isSectionAllowed(): boolean {
  return true
}
