import { getApiBaseUrl } from './api-base-url'
import { forceLoginRedirect, getAuthToken, setAuthToken } from './auth-helpers'

const API_BASE_URL = getApiBaseUrl()

type ApiResponse<T> = {
  err: number
  msg: string
  status: number
  data: T
}

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const token = getAuthToken()
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: init?.credentials ?? 'include',
    headers,
  })

  const newToken = response.headers.get('x-new-token')
  if (newToken) {
    setAuthToken(newToken)
  }

  if (response.status === 401 || response.status === 503) {
    forceLoginRedirect()
    throw new Error(response.status === 401 ? 'Sessao expirada.' : 'Servico de autenticacao indisponivel.')
  }

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || json.err) {
    throw new Error(json.msg || 'Falha ao processar a solicitacao.')
  }

  return json.data
}
