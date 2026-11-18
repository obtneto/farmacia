import { clearSessionCache, getSession } from './storage-session'

export type JsonRecord = Record<string, unknown>

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
  return profile ? formatDisplayName(profile.fullname || profile.user || profile.name) : 'Usuario'
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

export async function logoutRedirect(): Promise<void> {
  clearSessionCache()
}
