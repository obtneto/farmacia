const SALT_KEY = 'security_salt'
const LEGACY_AUTH_TOKEN_KEY = '_auth_token'
const SESSION_KEYS = ['_upf', '_uln', '_nav_m', '_u_apps'] as const

function getSessionSalt(): string {
  let salt = sessionStorage.getItem(SALT_KEY)

  if (!salt) {
    salt = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem(SALT_KEY, salt)
  }

  return salt
}

export function saveSession(key: string, value: unknown): void {
  if (key === LEGACY_AUTH_TOKEN_KEY) return
  try {
    if (value === null || value === undefined) {
      return
    }

    const payload = {
      _d: value,
      _s: getSessionSalt(),
    }

    const json = JSON.stringify(payload).replace(/[\u0100-\uffff]/g, (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
    )
    sessionStorage.setItem(key, btoa(json))
  } catch (error) {
    console.error('Erro ao salvar sessao', error)
  }
}

export function getSession<T = unknown>(key: string): T | null {
  const value = sessionStorage.getItem(key)

  if (!value) {
    return null
  }

  try {
    const payload = JSON.parse(atob(value)) as { _d?: T }

    if (payload && payload._d !== undefined) {
      return payload._d
    }

    return payload as T
  } catch {
    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  }
}

export function removeSession(key: string): void {
  sessionStorage.removeItem(key)
}

export function clearSessionCache(): void {
  for (const key of SESSION_KEYS) {
    sessionStorage.removeItem(key)
  }
  sessionStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
}

export function clearLegacyAuthTokens(): void {
  const legacyKeys = ['authToken', 'access_token', 'token', 'jwtToken', 'accessToken', 'jwt']
  try {
    for (const key of legacyKeys) {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    }
    sessionStorage.removeItem(LEGACY_AUTH_TOKEN_KEY)
  } catch {
    // Storage may be disabled by the browser; the server cookie remains authoritative.
  }
}
