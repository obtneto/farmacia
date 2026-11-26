import { getUserProfile } from './auth-helpers'

export type Permission =
  | 'demandas_especificas.editar'
  | 'estoque.ajustar_saldo'
  | 'inventarios.criar'
  | 'inventarios.fechar'
  | 'entradas.aprovar'
  | 'requisicoes.aprovar'
  | 'requisicoes.controle_ddu.excluir'

export const ALL_ALLOWED_ROUTE_PATHS = [
  'inicio',
  'pacientes/ambulatorio',
  'pacientes/demandas_especificas',
  'estoque/listar',
  'estoque/consultar_movimentacoes',
  'estoque/alerta_validade',
  'estoque/transferencia_depositos/nova_solicitacao',
  'estoque/transferencia_depositos/solicitacoes_abertas',
  'estoque/transferencia_depositos/solicitacoes_encerradas',
  'operacao/entradas/nova',
  'operacao/entradas/listar',
  'operacao/entradas/demandas',
  'operacao/entradas/aprovacao',
  'operacao/inventarios/listar',
  'operacao/inventarios/novo',
  'requisicoes/por_paciente',
  'requisicoes/por_setor',
  'requisicoes/aprovacao',
  'requisicoes/listar_por_periodo',
  'requisicoes/devolucao_medicamento',
  'requisicoes/controle_dose_domiciliar',
  'requisicoes/rastreamento_lotes',
  'parametros/boname',
  'parametros/depositos',
  'parametros/fornecedores',
  'parametros/medicamentos',
  'parametros/diagnosticos',
  'parametros/locais',
  'parametros/tipos_medicamentos',
  'parametros/setores',
  'parametros/tipos_requisicoes',
  'parametros/settings',
  'parametros/usuarios',
] as const

const OPERATOR_ALLOWED_ROUTE_PATHS = ALL_ALLOWED_ROUTE_PATHS.filter((path) => !path.startsWith('parametros/'))

function getProfileId(): number {
  const profile = getUserProfile()
  const value = profile?.perfil ?? profile?.perfil_id ?? profile?.usu_perfil_id
  const profileId = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(profileId) ? profileId : 0
}

export function getAllowedRoutePaths(): string[] {
  const profileId = getProfileId()

  if (profileId === 1) {
    return [...ALL_ALLOWED_ROUTE_PATHS]
  }

  if (profileId === 2 || profileId === 3) {
    return OPERATOR_ALLOWED_ROUTE_PATHS.filter((path) => (
      path !== 'operacao/entradas/aprovacao' || profileId === 2
    ) && (
      path !== 'requisicoes/aprovacao' || profileId === 2
    ) && (
      path !== 'operacao/inventarios/novo'
    ))
  }

  return ['inicio']
}

export function hasPermission(permission: Permission): boolean {
  const profileId = getProfileId()

  if (profileId === 1) {
    return true
  }

  if (permission === 'demandas_especificas.editar') {
    return false
  }

  if (permission === 'estoque.ajustar_saldo' || permission === 'inventarios.criar' || permission === 'inventarios.fechar') {
    return false
  }

  if (permission === 'entradas.aprovar' || permission === 'requisicoes.aprovar') {
    return profileId === 2
  }

  return false
}

export function userHasGroup(groupId: number): boolean {
  const groups = getUserProfile()?.groups_ids
  return Array.isArray(groups) && groups.some((group) => Number(group) === groupId)
}

export function isSectionAllowed(section: string, allowedPaths = getAllowedRoutePaths()): boolean {
  return allowedPaths.includes(section)
}
