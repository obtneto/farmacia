import { getApiBaseUrl } from './api-base-url'

const API_BASE_URL = getApiBaseUrl()

type ApiResponse<T> = {
  err: number
  msg: string
  status: number
  data: T
}

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: init?.credentials ?? 'include',
    cache: init?.cache ?? 'no-store',
    headers,
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || json.err) {
    throw new Error(json.msg || 'Falha ao processar a solicitacao.')
  }

  return json.data
}
