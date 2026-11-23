import { getApiBaseUrl } from './api-base-url'
import { logoutRedirect } from './auth-helpers'

const API_BASE_URL = getApiBaseUrl()
const PUBLIC_AUTH_PATHS = new Set(['/auth/autentica', '/auth/listar_dominios', '/auth/logout'])

type ApiResponse<T> = {
  err: number
  msg: string
  mensagem?: string
  status: number
  data: T
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const base = new URL(API_BASE_URL, window.location.href)
  const target = new URL(url, window.location.href)
  const basePath = base.pathname.replace(/\/$/, '')
  const path = target.pathname.slice(basePath.length).replace(/\/$/, '').toLowerCase()
  const isProtectedApi = target.origin === base.origin && target.pathname.startsWith(`${basePath}/`) && !PUBLIC_AUTH_PATHS.has(path)
  const headers = new Headers(init?.headers)
  headers.delete('Authorization')

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (isProtectedApi && path !== '/auth/sessao' && response.status === 401) {
    const error = await response.clone().json().catch(() => null)
    if (error?.code?.startsWith('AUTH_')) {
      void logoutRedirect(error.code === 'AUTH_SESSION_EXPIRED' ? 'idle' : undefined)
    }
  }

  return response
}

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await apiFetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    cache: init?.cache ?? 'no-store',
    headers,
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || json.err) {
    throw new Error(json.msg || json.mensagem || 'Falha ao processar a solicitacao.')
  }

  return json.data
}
