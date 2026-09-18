import { getAppId, getAuthApiBaseUrl, getAuthToken, type JsonRecord } from './auth-helpers'
import { getSession, saveSession } from './storage-session'

export type PermissionRoute = {
  id?: number | string
  path?: string
  link?: string
  route?: string
  url?: string
  pathname?: string
  id_application?: number | string
  applicationId?: number | string
  idApplication?: number | string
  app_id?: number | string
  application_id?: number | string
  [key: string]: unknown
}

function extractGroupIds(upf: JsonRecord): number[] {
  const directGroupIds =
    upf.groups_ids
    ?? upf.groupsIds
    ?? upf.group_ids
    ?? upf.groupIds
    ?? (upf.user as JsonRecord | undefined)?.groups_ids
    ?? (upf.user as JsonRecord | undefined)?.groupsIds
    ?? (upf.user as JsonRecord | undefined)?.group_ids
    ?? (upf.user as JsonRecord | undefined)?.groupIds

  if (Array.isArray(directGroupIds)) {
    return [...new Set(directGroupIds.map((groupId) => Number(groupId)).filter((id) => Number.isFinite(id) && id > 0))]
  }

  const arrayGroups = Array.isArray(upf.groups)
    ? upf.groups
    : Array.isArray((upf.user as JsonRecord | undefined)?.groups)
      ? ((upf.user as JsonRecord).groups as unknown[])
      : []

  const nestedGroupIds = arrayGroups
    .map((group) => {
      if (!group || typeof group !== 'object') {
        return null
      }

      const record = group as JsonRecord
      return record.id ?? record.group_id ?? record.groupId
    })
    .map((groupId) => Number(groupId))
    .filter((id) => Number.isFinite(id) && id > 0)

  if (nestedGroupIds.length > 0) {
    return [...new Set(nestedGroupIds)]
  }

  const singleGroupId =
    upf.id_group
    ?? upf.group_id
    ?? upf.groupId
    ?? upf.idGroup
    ?? upf.id_grupo
    ?? upf.grupo_id
    ?? (upf.user as JsonRecord | undefined)?.id_group
    ?? (upf.user as JsonRecord | undefined)?.group_id
    ?? (upf.user as JsonRecord | undefined)?.groupId

  if (singleGroupId) {
    const normalized = Number(singleGroupId)
    return Number.isFinite(normalized) && normalized > 0 ? [normalized] : []
  }

  return []
}

function extractApplicationId(item: PermissionRoute): number | null {
  const applicationId =
    item.id_application
    ?? item.applicationId
    ?? item.idApplication
    ?? item.app_id
    ?? item.application_id

  const normalized = Number(applicationId)
  return Number.isFinite(normalized) ? normalized : null
}

export function normalizeRouteValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase().replace(/^\/+|\/+$/g, '')
    return normalized || null
  }

  if (value && typeof value === 'object') {
    const candidate =
      (value as PermissionRoute).path
      ?? (value as PermissionRoute).link
      ?? (value as PermissionRoute).route
      ?? (value as PermissionRoute).url
      ?? (value as PermissionRoute).pathname

    if (typeof candidate === 'string') {
      const normalized = candidate.trim().toLowerCase().replace(/^\/+|\/+$/g, '')
      return normalized || null
    }
  }

  return null
}

export function getAllowedRoutes(): PermissionRoute[] {
  const allowedRoutesRaw = getSession<PermissionRoute[] | { data?: PermissionRoute[] }>('_nav_m')

  if (Array.isArray(allowedRoutesRaw)) {
    return allowedRoutesRaw
  }

  if (allowedRoutesRaw && Array.isArray(allowedRoutesRaw.data)) {
    return allowedRoutesRaw.data
  }

  return []
}

export function getAllowedRoutePaths(): string[] {
  return [...new Set(getAllowedRoutes().map((route) => normalizeRouteValue(route)).filter(Boolean) as string[])]
}

export function isSectionAllowed(sectionKey: string, allowedPaths = getAllowedRoutePaths()): boolean {
  if (sectionKey === 'inicio') {
    return true
  }

  if (allowedPaths.length === 0) {
    return false
  }

  const targetPath = sectionKey.toLowerCase().replace(/^\/+|\/+$/g, '')

  return allowedPaths.some((allowedPath) => {
    if (!allowedPath) {
      return false
    }

    if (targetPath === allowedPath) {
      return true
    }

    const targetSegments = targetPath.split('/').filter(Boolean)
    const allowedSegments = allowedPath.split('/').filter(Boolean)
    const isParentRoute =
      allowedSegments.length > 0 && allowedSegments.every((segment, index) => targetSegments[index] === segment)

    if (isParentRoute) {
      return true
    }

    if (targetPath.startsWith(`${allowedPath}/`)) {
      return true
    }

    return false
  })
}

export async function syncUserPermissions(forceRefresh = false): Promise<PermissionRoute[]> {
  const cachedRoutes = getSession<PermissionRoute[]>('_nav_m')
  if (!forceRefresh && Array.isArray(cachedRoutes) && cachedRoutes.length > 0) {
    return cachedRoutes
  }

  const userData = getSession<JsonRecord>('_upf')
  const currentAppId = getAppId()

  if (!userData || !currentAppId) {
    saveSession('_nav_m', [])
    return []
  }

  const targetGroupIds = extractGroupIds(userData)
  if (targetGroupIds.length === 0) {
    saveSession('_nav_m', [])
    return []
  }

  const authBaseUrl = getAuthApiBaseUrl()
  const authToken = getAuthToken()

  const responses = await Promise.all(
    targetGroupIds.map(async (groupId) => {
      try {
        const headers: Record<string, string> = {
          Accept: 'application/json',
        }

        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`
        }

        const response = await fetch(`${authBaseUrl}/permissionsLinksGroups/byGroup/${groupId}`, {
          method: 'GET',
          credentials: 'include',
          headers,
          cache: 'no-store',
        })

        if (!response.ok) {
          return [] as PermissionRoute[]
        }

        const json = (await response.json()) as PermissionRoute[] | { data?: PermissionRoute[] }
        const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
        return list.filter((item) => extractApplicationId(item) === currentAppId)
      } catch (error) {
        console.warn(`[Permissions] Falha ao buscar grupo ${groupId}:`, error)
        return [] as PermissionRoute[]
      }
    }),
  )

  const uniqueRoutesMap = new Map<string | number, PermissionRoute>()

  for (const route of responses.flat()) {
    const key = route.id ?? normalizeRouteValue(route)
    if (key !== null && key !== undefined && !uniqueRoutesMap.has(key)) {
      uniqueRoutesMap.set(key, route)
    }
  }

  const uniqueRoutes = Array.from(uniqueRoutesMap.values())
  saveSession('_nav_m', uniqueRoutes)
  return uniqueRoutes
}
