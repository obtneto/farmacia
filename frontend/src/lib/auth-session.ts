import { getApiBaseUrl } from './api-base-url'

const API_BASE_URL = getApiBaseUrl()
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const LEGACY_AUTH_TOKEN_KEYS = ['authToken', 'access_token', 'accessToken', 'token', 'jwt', 'jwtToken']

type AuthClaims = Record<string, unknown>

type AuthUser = {
  id: string
  name: string
  roles: string[]
  tokenVerified: boolean
  claims: AuthClaims
}

type AuthResponse = {
  user: AuthUser
  cookieName: string
  cookieMode: string
}

type ApiResponse<T> = {
  err: number
  msg: string
  status: number
  data: T
}

type StoredSessionUser = Record<string, unknown>

let bootstrapPromise: Promise<StoredSessionUser> | null = null

function normalizeStoredSessionUser(user: AuthUser): StoredSessionUser {
  const claims = user.claims || {}
  const displayName = String(
    claims.name
    || claims.fullname
    || claims.preferred_username
    || claims.user_name
    || claims.user
    || user.name
    || 'Usuario autenticado'
  ).trim()
  const username = String(
    claims.preferred_username
    || claims.user_name
    || claims.username
    || claims.user
    || user.id
  ).trim()

  return {
    id: String(claims.uid || claims.user_id || claims.sub || user.id),
    displayName,
    name: displayName,
    fullName: displayName,
    fullname: displayName,
    username,
    user: username,
    user_name: username,
    preferred_username: username,
    email: String(claims.email || ''),
    telephonenumber: String(claims.telephonenumber || claims.phone_number || ''),
    role: user.roles[0] || 'USUARIO_AUTENTICADO',
  }
}

async function createSimulatedAuthSession(): Promise<StoredSessionUser> {
  const response = await fetch(`${API_BASE_URL}/auth/simular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  const json = (await response.json()) as ApiResponse<AuthResponse>

  if (!response.ok || json.err) {
    throw new Error(json.msg || 'Falha ao criar a sessao simulada.')
  }

  const sessionUser = normalizeStoredSessionUser(json.data.user)
  for (const key of LEGACY_AUTH_TOKEN_KEYS) {
    window.localStorage.removeItem(key)
  }
  window.localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(sessionUser))

  return sessionUser
}

export function bootstrapAuthSession(): Promise<StoredSessionUser> {
  if (!bootstrapPromise) {
    bootstrapPromise = createSimulatedAuthSession().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  return bootstrapPromise
}
