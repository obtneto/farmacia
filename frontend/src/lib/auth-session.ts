import { forceLoginRedirect, getUserProfile, restoreSession, type JsonRecord } from './auth-helpers'
import { syncUserPermissions } from './auth-permissions'

export type BootstrapAuthResult = {
  permissions: Awaited<ReturnType<typeof syncUserPermissions>>
  user: JsonRecord
}

let bootstrapPromise: Promise<BootstrapAuthResult> | null = null

async function createBarramentoAuthSession(): Promise<BootstrapAuthResult> {
  const hasSession = await restoreSession()

  if (!hasSession) {
    forceLoginRedirect()
    throw new Error('Sessao do barramento nao encontrada.')
  }

  const user = getUserProfile()
  if (!user) {
    forceLoginRedirect()
    throw new Error('Perfil do usuario nao encontrado.')
  }

  const permissions = await syncUserPermissions(true)

  return {
    user,
    permissions,
  }
}

export function bootstrapAuthSession(): Promise<BootstrapAuthResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = createBarramentoAuthSession().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  return bootstrapPromise
}
