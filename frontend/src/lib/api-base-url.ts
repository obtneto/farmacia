function isLoopbackHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '')
}

function resolveBrowserBaseUrl() {
  return `${window.location.protocol}//${window.location.hostname}:3000`
}

export function getApiBaseUrl() {
  const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim()

  if (configuredBaseUrl) {
    const normalizedBaseUrl = normalizeBaseUrl(configuredBaseUrl)

    if (typeof window === 'undefined') {
      return normalizedBaseUrl
    }

    try {
      const configuredUrl = new URL(normalizedBaseUrl)

      if (isLoopbackHostname(configuredUrl.hostname) && !isLoopbackHostname(window.location.hostname)) {
        configuredUrl.hostname = window.location.hostname
        return normalizeBaseUrl(configuredUrl.toString())
      }
    } catch {
      return normalizedBaseUrl
    }

    return normalizedBaseUrl
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  return resolveBrowserBaseUrl()
}
