import { clearSessionCache, getSession, saveSession } from './storage-session'

export type JsonRecord = Record<string, unknown>

type JwtPayload = JsonRecord & {
  exp?: number
  user?: JsonRecord
}

let latestAuthToken: string | null = null
let tokenRenewalTimeout: ReturnType<typeof setTimeout> | null = null

export function getAppId(): number {
  const raw = String(import.meta.env.VITE_APP_ID || '').trim()
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function getAuthApiBaseUrl(): string {
  const configured = String(import.meta.env.VITE_API_AUTH || '').trim().replace(/\/$/, '')
  if (configured) {
    return configured
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3008`
  }

  return 'http://localhost:3008'
}

export function getSaLoginUrl(): string {
  const envUrl = String(import.meta.env.VITE_API_SA || '').trim()
  if (envUrl && envUrl !== '/') {
    return envUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:3007`
  }

  return '/'
}

export function parseJwt(token: string): JwtPayload | null {
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const jsonPayload = decodeURIComponent(
      window
        .atob(padded)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0)}`).slice(-2)}`)
        .join(''),
    )

    return JSON.parse(jsonPayload) as JwtPayload
  } catch (error) {
    console.error('Falha ao processar JWT:', error)
    return null
  }
}

export function getAuthToken(): string | null {
  return latestAuthToken
}

function scheduleTokenRenewal(tokenExp: number): void {
  if (tokenRenewalTimeout) {
    clearTimeout(tokenRenewalTimeout)
    tokenRenewalTimeout = null
  }

  const timeUntilExp = tokenExp * 1000 - Date.now()
  if (timeUntilExp <= 0) {
    return
  }

  let timeUntilRenewal = timeUntilExp - 4 * 60 * 1000
  if (timeUntilRenewal <= 0) {
    timeUntilRenewal = 5000
  }

  tokenRenewalTimeout = setTimeout(() => {
    void fetchUserSession().catch((error) => {
      console.error('Erro na renovacao agendada de token:', error)
    })
  }, timeUntilRenewal)
}

export function setAuthToken(token: string | null): void {
  if (!token) {
    latestAuthToken = null
    if (tokenRenewalTimeout) {
      clearTimeout(tokenRenewalTimeout)
      tokenRenewalTimeout = null
    }
    return
  }

  try {
    const incomingExp = parseJwt(token)?.exp
    const currentExp = latestAuthToken ? parseJwt(latestAuthToken)?.exp : null

    if (incomingExp && currentExp && incomingExp < currentExp) {
      return
    }

    latestAuthToken = token

    if (incomingExp) {
      scheduleTokenRenewal(incomingExp)
    }
  } catch {
    latestAuthToken = token
  }
}

export function clearAuthCookies(): void {
  setAuthToken(null)

  const domains = ['; path=/; SameSite=Lax', '; path=/;']
  const cookies = ['auth_token', 'FSPH_ruse']

  for (const cookie of cookies) {
    for (const domain of domains) {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${domain}`
    }
  }
}

function formatDisplayName(fullName: unknown): string {
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return 'Usuario'
  }

  const names = fullName.trim().split(/\s+/)
  return names.length > 1 ? `${names[0]} ${names[1]}` : names[0]
}

function extractUserProfile(source: unknown): JsonRecord | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return null
  }

  const record = source as JsonRecord
  const nestedUser = record.user

  if (nestedUser && typeof nestedUser === 'object' && !Array.isArray(nestedUser)) {
    return nestedUser as JsonRecord
  }

  if (record.fullname || record.user || record.groups_ids || record.id) {
    return record
  }

  return null
}

function persistUserProfile(profile: JsonRecord): void {
  saveSession('_upf', profile)
  saveSession('_uln', formatDisplayName(profile.fullname || profile.user || profile.name))
}

function mergeGroupsIfSameUser(currentUpf: JsonRecord | null, newData: JsonRecord | null): JsonRecord | null {
  if (!currentUpf || !newData) {
    return newData
  }

  const currentId = currentUpf.id ?? (currentUpf.user as JsonRecord | undefined)?.id
  const newId = newData.id ?? (newData.user as JsonRecord | undefined)?.id

  if (currentId !== newId) {
    return newData
  }

  const groupKeys = [
    'groups',
    'groups_ids',
    'groupsIds',
    'group_ids',
    'groupIds',
    'id_group',
    'group_id',
    'idGroup',
    'id_grupo',
    'grupo_id',
  ]

  const finalData = { ...newData }

  for (const key of groupKeys) {
    const currentValue = currentUpf[key]
    const nextValue = finalData[key]
    const nextEmpty = nextValue === undefined || (Array.isArray(nextValue) && nextValue.length === 0)

    if (currentValue !== undefined && nextEmpty) {
      finalData[key] = currentValue
    }
  }

  return finalData
}

export async function fetchUserSession(): Promise<unknown | null> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }

  if (latestAuthToken) {
    headers.Authorization = `Bearer ${latestAuthToken}`
  }

  const response = await fetch(`${getAuthApiBaseUrl()}/auth/validar`, {
    method: 'GET',
    credentials: 'include',
    headers,
    cache: 'no-store',
  })

  const newToken = response.headers.get('x-new-token')
  if (newToken) {
    setAuthToken(newToken)
  }

  if (!response.ok) {
    return null
  }

  const result = (await response.json()) as { data?: unknown }
  return result.data !== undefined ? result.data : result
}

export async function restoreSession(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const urlToken = params.get('token')

  if (urlToken) {
    sessionStorage.removeItem('_nav_m')
    setAuthToken(urlToken)

    const decoded = parseJwt(urlToken)
    const profile = extractUserProfile(decoded)

    if (profile) {
      const currentUpf = getSession<JsonRecord>('_upf')
      const merged = mergeGroupsIfSameUser(currentUpf, profile)
      if (merged) {
        persistUserProfile(merged)
      }
    }

    params.delete('token')
    const nextQuery = params.toString()
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', nextUrl)
    return true
  }

  const cachedProfile = getSession<JsonRecord>('_upf')
  if (cachedProfile) {
    return true
  }

  try {
    const sessionData = await fetchUserSession()
    const profile = extractUserProfile(sessionData)

    if (!profile) {
      return false
    }

    const currentUpf = getSession<JsonRecord>('_upf')
    const merged = mergeGroupsIfSameUser(currentUpf, profile)
    if (merged) {
      persistUserProfile(merged)
    }

    if (sessionData && typeof sessionData === 'object' && !Array.isArray(sessionData)) {
      const apps = (sessionData as JsonRecord).apps ?? (sessionData as JsonRecord).allowed_app_ids
      if (apps) {
        saveSession('_u_apps', apps)
      }
    }

    return true
  } catch (error) {
    console.error('Erro ao buscar sessao do barramento:', error)
    return false
  }
}

export async function logoutRedirect(): Promise<void> {
  clearSessionCache()
  clearAuthCookies()

  try {
    await fetch(`${getAuthApiBaseUrl()}/apiauth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // ignore logout network errors
  }

  window.location.href = getSaLoginUrl()
}

export function forceLoginRedirect(): void {
  clearSessionCache()
  clearAuthCookies()
  window.location.href = getSaLoginUrl()
}

export function getUserDisplayName(): string {
  const cachedName = getSession<string>('_uln')
  if (cachedName) {
    return cachedName
  }

  const profile = getSession<JsonRecord>('_upf')
  if (!profile) {
    return 'Usuario autenticado'
  }

  return formatDisplayName(profile.fullname || profile.user || profile.name)
}

export function getUserProfile(): JsonRecord | null {
  return getSession<JsonRecord>('_upf')
}

/**
 * Login/username do usuario autenticado (Barramento `_upf`).
 * Usado em payloads que exigem digitador, solicitante, aprovador, etc.
 */
export function getSessionUsername(): string {
  const profile = getUserProfile()

  if (profile) {
    const fromProfile = String(
      profile.user
      || profile.username
      || profile.user_name
      || profile.preferred_username
      || (typeof profile.id === 'string' || typeof profile.id === 'number' ? profile.id : '')
      || ''
    ).trim()

    if (fromProfile) {
      return fromProfile
    }
  }

  // Fallback legado (sessao simulada antiga em localStorage)
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const raw = window.localStorage.getItem('sessionUser')
    if (!raw) {
      return ''
    }

    const sessionUser = JSON.parse(raw) as JsonRecord
    return String(
      sessionUser.username
      || sessionUser.user
      || sessionUser.user_name
      || sessionUser.preferred_username
      || sessionUser.id
      || ''
    ).trim()
  } catch {
    return ''
  }
}
