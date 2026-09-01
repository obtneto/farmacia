import { getApiBaseUrl } from './api-base-url'

const API_BASE_URL = getApiBaseUrl()

const globalScope = globalThis as typeof globalThis & {
  __farmaciaFetchDefaultsInstalled__?: boolean
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input
  }

  if (input instanceof URL) {
    return input.href
  }

  return input.url
}

function isApiRequest(input: RequestInfo | URL): boolean {
  try {
    return new URL(getRequestUrl(input), globalScope.location?.origin).href.startsWith(API_BASE_URL)
  } catch {
    return getRequestUrl(input).startsWith(API_BASE_URL)
  }
}

function getRequestHeaders(input: RequestInfo | URL, init?: RequestInit): Headers {
  if (init?.headers) {
    return new Headers(init.headers)
  }

  if (input instanceof Request) {
    return new Headers(input.headers)
  }

  return new Headers()
}

if (!globalScope.__farmaciaFetchDefaultsInstalled__) {
  const originalFetch = globalScope.fetch.bind(globalScope)

  globalScope.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const nextInit = init ? { ...init } : {}

    if (nextInit.credentials === undefined) {
      nextInit.credentials = 'include'
    }

    if (isApiRequest(input)) {
      const headers = getRequestHeaders(input, init)
      headers.set('Cache-Control', 'no-cache')
      nextInit.headers = headers
      nextInit.cache = 'no-store'
    }

    return originalFetch(input, nextInit)
  }) as typeof globalScope.fetch

  globalScope.__farmaciaFetchDefaultsInstalled__ = true
}

export {}
