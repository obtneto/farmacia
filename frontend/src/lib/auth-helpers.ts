import { clearSessionCache, getSession } from './storage-session'
import { getApiBaseUrl } from './api-base-url'

export type JsonRecord = Record<string, unknown>
export const LOGIN_SECTION = 'login'
export const LOGIN_URL = `?section=${LOGIN_SECTION}`

function formatDisplayName(fullName: unknown): string {
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return 'Usuario'
  }

  const names = fullName.trim().split(/\s+/)
  return names.length > 1 ? `${names[0]} ${names[1]}` : names[0]
}

export function getUserProfile(): JsonRecord | null {
  return getSession<JsonRecord>('_upf')
}

export function getUserDisplayName(): string {
  const profile = getUserProfile()
  return profile ? formatDisplayName(profile.nome_completo || profile.fullname || profile.user || profile.name) : 'Usuario'
}

export function getSessionUsername(): string {
  const profile = getUserProfile()

  if (!profile) {
    return ''
  }

  return String(
    profile.user
    || profile.username
    || profile.user_name
    || profile.preferred_username
    || profile.id
    || ''
  ).trim()
}

export async function logoutRedirect(reason?: 'idle'): Promise<void> {
  void fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
  }).catch(() => undefined)
  clearSessionCache()
  window.location.replace(reason ? `${LOGIN_URL}&reason=${reason}` : LOGIN_URL)
}
