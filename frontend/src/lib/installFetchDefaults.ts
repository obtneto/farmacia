const globalScope = globalThis as typeof globalThis & {
  __farmaciaFetchDefaultsInstalled__?: boolean
}

if (!globalScope.__farmaciaFetchDefaultsInstalled__) {
  const originalFetch = globalScope.fetch.bind(globalScope)

  globalScope.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const nextInit = init ? { ...init } : {}

    if (nextInit.credentials === undefined) {
      nextInit.credentials = 'include'
    }

    return originalFetch(input, nextInit)
  }) as typeof globalScope.fetch

  globalScope.__farmaciaFetchDefaultsInstalled__ = true
}

export {}
