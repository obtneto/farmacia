import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, SelectPicker, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import LockIcon from '@rsuite/icons/Lock'
import UnlockIcon from '@rsuite/icons/legacy/Unlock'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

interface DepositoOptionRecord {
  dep_ativo: 0 | 1
  dep_descr: string
  dep_id: number
}

interface TipoMedicamentoOptionRecord {
  tipo_ativo: 0 | 1
  tipo_codigo: string
  tipo_descr: string
  tipo_id: number
}

interface SelectOption<TValue extends number | string = number> {
  label: string
  value: TValue
}

export interface EstoqueRecord {
  alerta_validade: number | null
  descricao: string | null
  descricao_comercial: string | null
  dias_para_validade: number | string | null
  est_id: number
  id: number
  lote: string | null
  med_id?: number | null
  medicamento_id: number | null
  saldo_bloqueado: number
  saldo_disponivel: number
  unidade: string | null
  validade: Date | string | null
}

interface FilterValues {
  pesquisa: string
  depositoId: number | null
  tipoCodigo: string | null
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

type AjustarSaldoAction = 'bloquear' | 'desbloquear'

interface AjustarSaldoPayload {
  action: AjustarSaldoAction
  estId: number
  quantidade: number
}

export interface EstoqueListPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 10
const DEFAULT_FILTER_VALUES: FilterValues = {
  pesquisa: '',
  depositoId: null,
  tipoCodigo: null,
}

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of LOCAL_STORAGE_TOKEN_KEYS) {
    const value = window.localStorage.getItem(key)?.trim()
    if (value) {
      return value
    }
  }

  return null
}

function validateFilters(values: FilterValues): FilterErrors {
  const errors: FilterErrors = {}

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito.'
  }

  if (!values.tipoCodigo?.trim()) {
    errors.tipoCodigo = 'Selecione o tipo de medicamento.'
  }

  return errors
}

function formatDateForDisplay(value: Date | string | null): string {
  if (!value) {
    return '-'
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function resolveValidityBadge(
  value: Date | string | null,
  alertDays: number | null,
): { label: string; tone: 'danger' | 'neutral' | 'success' | 'warning' } {
  if (!value) {
    return { label: 'Sem validade', tone: 'neutral' }
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return { label: 'Sem validade', tone: 'neutral' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsedDate.setHours(0, 0, 0, 0)

  const diffInDays = Math.ceil((parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const normalizedAlertDays = Number(alertDays || 0)

  if (diffInDays < 0) {
    return { label: formatDateForDisplay(parsedDate), tone: 'danger' }
  }

  if (normalizedAlertDays > 0 && diffInDays <= normalizedAlertDays) {
    return { label: formatDateForDisplay(parsedDate), tone: 'warning' }
  }

  return { label: formatDateForDisplay(parsedDate), tone: 'success' }
}

function renderValidityBadge(value: Date | string | null, alertDays: number | null) {
  const validityBadge = resolveValidityBadge(value, alertDays)

  return <StatusBadge tone={validityBadge.tone}>{validityBadge.label}</StatusBadge>
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getMedicamentoId(item: EstoqueRecord): number {
  return Number(item.med_id ?? item.medicamento_id ?? 0)
}

function formatDaysToValidity(value: number | string | null): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

async function requestEstoque<T>(
  baseUrl: string,
  path: string,
  init: RequestInit,
  authToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    ...init,
    headers,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // Non-JSON responses are handled below.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function listarDepositosAtivos(baseUrl: string, authToken?: string | null): Promise<DepositoOptionRecord[]> {
  return requestEstoque<DepositoOptionRecord[]>(
    baseUrl,
    '/parametros/depositos/listar-ativos/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarTiposMedicamentos(baseUrl: string, authToken?: string | null): Promise<TipoMedicamentoOptionRecord[]> {
  return requestEstoque<TipoMedicamentoOptionRecord[]>(
    baseUrl,
    '/parametros/tipos_medicamentos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarEstoque(
  baseUrl: string,
  filters: FilterValues,
  authToken?: string | null,
): Promise<EstoqueRecord[]> {
  const pesquisa = filters.pesquisa.trim() ? encodeURIComponent(filters.pesquisa.trim()) : '*'
  return requestEstoque<EstoqueRecord[]>(
    baseUrl,
    `/estoque/listar/${pesquisa}/${filters.depositoId ?? 0}/${encodeURIComponent(filters.tipoCodigo ?? '')}`,
    { method: 'GET' },
    authToken,
  )
}

async function ajustarSaldoEstoque(
  baseUrl: string,
  payload: AjustarSaldoPayload,
  authToken?: string | null,
): Promise<void> {
  const isBloqueio = payload.action === 'bloquear'

  await requestEstoque<Record<string, never>>(
    baseUrl,
    `/estoque/${payload.action}/${payload.estId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(isBloqueio ? { est_bloquear: payload.quantidade } : { est_desbloquear: payload.quantidade }),
    },
    authToken,
  )
}

export function EstoqueListPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: EstoqueListPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const queryClient = useQueryClient()
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTER_VALUES)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [selectedBlockItem, setSelectedBlockItem] = useState<EstoqueRecord | null>(null)
  const [saldoAction, setSaldoAction] = useState<AjustarSaldoAction>('bloquear')
  const [blockQuantity, setBlockQuantity] = useState<number | null>(null)
  const [blockQuantityError, setBlockQuantityError] = useState<string | undefined>()

  const depositosQuery = useQuery({
    queryKey: ['estoque-depositos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarDepositosAtivos(apiBaseUrl, resolvedAuthToken),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['estoque-tipos-medicamentos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarTiposMedicamentos(apiBaseUrl, resolvedAuthToken),
  })

  const listQuery = useQuery({
    queryKey: ['estoque-list', apiBaseUrl, submittedFilters, resolvedAuthToken],
    queryFn: () => listarEstoque(apiBaseUrl, submittedFilters as FilterValues, resolvedAuthToken),
    enabled: submittedFilters !== null,
  })

  const depositoOptions: Array<SelectOption<number>> = (depositosQuery.data ?? [])
    .map((item) => ({
      label: item.dep_descr,
      value: Number(item.dep_id),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const tipoOptions: Array<SelectOption<string>> = (tiposMedicamentosQuery.data ?? [])
    .filter((item) => Number(item.tipo_ativo) === 1)
    .map((item) => ({
      label: `${item.tipo_descr} (${item.tipo_codigo})`,
      value: item.tipo_codigo,
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const records = listQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const hasSubmittedFilters = submittedFilters !== null
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : 420
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const hasFiltersDependencyError = depositosQuery.isError || tiposMedicamentosQuery.isError
  const selectedSaldoLimit = Number(
    saldoAction === 'bloquear' ? selectedBlockItem?.saldo_disponivel || 0 : selectedBlockItem?.saldo_bloqueado || 0,
  )
  const saldoActionLabel = saldoAction === 'bloquear' ? 'Bloquear Saldo' : 'Desbloquear Saldo'
  const saldoActionFieldLabel = saldoAction === 'bloquear' ? 'Quantidade a bloquear' : 'Quantidade a desbloquear'
  const saldoActionErrorLabel = saldoAction === 'bloquear' ? 'bloqueio' : 'desbloqueio'
  const canSubmitBlock =
    selectedBlockItem !== null &&
    Number(selectedBlockItem.est_id || 0) > 0 &&
    blockQuantity !== null &&
    blockQuantity > 0 &&
    blockQuantity <= selectedSaldoLimit &&
    !blockQuantityError

  const blockMutation = useMutation({
    mutationFn: (payload: AjustarSaldoPayload) => ajustarSaldoEstoque(apiBaseUrl, payload, resolvedAuthToken),
    onSuccess: async (_data, payload) => {
      await queryClient.invalidateQueries({ queryKey: ['estoque-list'] })
      setSelectedBlockItem(null)
      setSaldoAction('bloquear')
      setBlockQuantity(null)
      setBlockQuantityError(undefined)
      await message.success(
        payload.action === 'bloquear' ? 'Saldo bloqueado' : 'Saldo desbloqueado',
        payload.action === 'bloquear' ? 'O saldo foi bloqueado com sucesso.' : 'O saldo foi desbloqueado com sucesso.',
      )
    },
    onError: async (error, payload) => {
      await message.error(
        payload.action === 'bloquear' ? 'Falha ao bloquear saldo' : 'Falha ao desbloquear saldo',
        error instanceof Error ? error.message : 'Erro ao processar saldo.',
      )
    },
  })

  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise os filtros',
        text: 'Selecione o deposito e o tipo de medicamento antes de pesquisar.',
      })
      return
    }

    setActivePage(1)
    setSubmittedFilters({ ...filterValues })
  }

  const handleRefresh = async () => {
    if (!submittedFilters) {
      await handleSubmitFilters()
      return
    }

    await listQuery.refetch()
  }

  const handleRetryDependencies = async () => {
    await Promise.all([depositosQuery.refetch(), tiposMedicamentosQuery.refetch()])
  }

  const handleOpenBlockModal = (record: EstoqueRecord, action: AjustarSaldoAction) => {
    setSelectedBlockItem(record)
    setSaldoAction(action)
    setBlockQuantity(null)
    setBlockQuantityError(undefined)
  }

  const handleCloseBlockModal = () => {
    if (blockMutation.isPending) {
      return
    }

    setSelectedBlockItem(null)
    setSaldoAction('bloquear')
    setBlockQuantity(null)
    setBlockQuantityError(undefined)
  }

  const handleChangeBlockQuantity = async (value: number | string | null) => {
    const parsedValue = Number(value || 0)

    if (parsedValue > selectedSaldoLimit) {
      setBlockQuantity(null)
      setBlockQuantityError(`Informe uma quantidade menor ou igual ao saldo para ${saldoActionErrorLabel}.`)
      await message.warning('Saldo insuficiente', `A quantidade para ${saldoActionErrorLabel} nao pode ser maior que o saldo permitido.`)
      return
    }

    setBlockQuantity(parsedValue > 0 ? parsedValue : null)
    setBlockQuantityError(undefined)
  }

  const handleSubmitBlock = async () => {
    if (!selectedBlockItem) {
      return
    }

    const quantidade = Number(blockQuantity || 0)
    const estId = Number(selectedBlockItem.est_id || 0)

    if (estId <= 0) {
      await message.error(
        saldoAction === 'bloquear' ? 'Falha ao bloquear saldo' : 'Falha ao desbloquear saldo',
        'Atualize a listagem para carregar o ID real do estoque.',
      )
      return
    }

    if (quantidade <= 0) {
      setBlockQuantityError('Informe uma quantidade maior que zero.')
      return
    }

    if (quantidade > selectedSaldoLimit) {
      setBlockQuantityError(`Informe uma quantidade menor ou igual ao saldo para ${saldoActionErrorLabel}.`)
      return
    }

    await blockMutation.mutateAsync({
      action: saldoAction,
      estId,
      quantidade,
    })
  }

  return (
    <section className="boname-page estoque-page estoque-list-page estoque-page--merged-layout">
      <PageSection
        className="estoque-page__filters-section estoque-page__merged-section"
      >
        <div className="boname-page__form-grid estoque-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="estoque-pesquisa">Pesquisar</label>
            <Input
              id="estoque-pesquisa"
              size="sm"
              className="boname-page__control"
              placeholder="Descricao ou descricao comercial"
              value={filterValues.pesquisa}
              onChange={(value) => {
                setFilterValues((current) => ({
                  ...current,
                  pesquisa: value,
                }))
              }}
              onPressEnter={() => void handleSubmitFilters()}
            />
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="estoque-deposito-label">Deposito</label>
            <SelectPicker
              aria-labelledby="estoque-deposito-label"
              data={depositoOptions}
              searchable
              cleanable={false}
              placeholder="Selecione o deposito"
              className={filterErrors.depositoId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.depositoId}
              loading={depositosQuery.isPending}
              onChange={(value) => {
                setFilterValues((current) => ({
                  ...current,
                  depositoId: value == null ? null : Number(value),
                }))
                setFilterErrors((current) => ({ ...current, depositoId: undefined }))
              }}
            />

            {filterErrors.depositoId ? <span role="alert">{filterErrors.depositoId}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="estoque-tipo-label">Tipo de medicamento</label>
            <SelectPicker
              aria-labelledby="estoque-tipo-label"
              data={tipoOptions}
              searchable
              cleanable={false}
              placeholder="Selecione o tipo"
              className={filterErrors.tipoCodigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.tipoCodigo}
              loading={tiposMedicamentosQuery.isPending}
              onChange={(value) => {
                setFilterValues((current) => ({
                  ...current,
                  tipoCodigo: typeof value === 'string' ? value : null,
                }))
                setFilterErrors((current) => ({ ...current, tipoCodigo: undefined }))
              }}
            />

            {filterErrors.tipoCodigo ? <span role="alert">{filterErrors.tipoCodigo}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__actions-field">
            <label className="estoque-page__actions-label">Acoes</label>
            <HStack spacing={10} className="boname-page__toolbar-actions estoque-page__actions-row">
              <Button appearance="primary" startIcon={<SearchIcon />} onClick={() => void handleSubmitFilters()}>
                Pesquisar
              </Button>
              <Button
                appearance="ghost"
                startIcon={<ReloadIcon />}
                loading={listQuery.isFetching && !listQuery.isPending}
                onClick={() => void handleRefresh()}
              >
                Atualizar
              </Button>
            </HStack>
          </div>
        </div>

        {hasFiltersDependencyError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os filtros"
            description="Verifique os cadastros de depositos e tipos de medicamentos antes de consultar o estoque."
            action={
              <Button appearance="primary" onClick={() => void handleRetryDependencies()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!hasFiltersDependencyError && !hasSubmittedFilters ? (
          <DataState
            state="empty"
            title="Defina os filtros para pesquisar"
            description="Selecione o deposito, escolha o tipo de medicamento e use a pesquisa para refinar, se necessario."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando estoque..."
            description="Consultando o saldo disponivel com os filtros informados."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar o estoque"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar o estoque.'}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && !hasRecords ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="Nao ha saldo disponivel para o deposito e tipo de medicamento informados."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={`${rowData.id}-${rowData.lote ?? 'sem-lote'}`} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.descricao || 'Medicamento sem descricao'}</strong>
                          <p>{rowData.descricao_comercial || 'Descricao comercial nao informada'}</p>
                        </div>
                      </div>

                      <dl className="boname-page__record-meta estoque-page__record-meta">
                        <div>
                          <dt>Unidade</dt>
                          <dd>{rowData.unidade || '-'}</dd>
                        </div>
                        <div>
                          <dt>Lote</dt>
                          <dd>{rowData.lote || '-'}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{renderValidityBadge(rowData.validade, rowData.alerta_validade)}</dd>
                        </div>
                        <div>
                          <dt>Dias para validade</dt>
                          <dd>{formatDaysToValidity(rowData.dias_para_validade)}</dd>
                        </div>
                        <div>
                          <dt>Saldo disponivel</dt>
                          <dd>{formatNumber(rowData.saldo_disponivel)}</dd>
                        </div>
                        <div>
                          <dt>Saldo bloqueado</dt>
                          <dd>{formatNumber(rowData.saldo_bloqueado)}</dd>
                        </div>
                      </dl>

                      <HStack spacing={10} className="boname-page__toolbar-actions estoque-list-page__card-actions">
                        <Button
                          appearance="subtle"
                          size="xs"
                          startIcon={<LockIcon />}
                          disabled={Number(rowData.saldo_disponivel || 0) <= 0}
                          onClick={() => handleOpenBlockModal(rowData, 'bloquear')}
                        >
                          Bloquear Saldo
                        </Button>
                        <Button
                          appearance="subtle"
                          size="xs"
                          startIcon={<UnlockIcon />}
                          disabled={Number(rowData.saldo_bloqueado || 0) <= 0}
                          onClick={() => handleOpenBlockModal(rowData, 'desbloquear')}
                        >
                          Desbloquear Saldo
                        </Button>
                      </HStack>
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table
                    data={paginatedRecords}
                    height={tableHeight}
                    fillHeight
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={72} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell>{(rowData: EstoqueRecord) => getMedicamentoId(rowData)}</Cell>
                    </Column>

                    <Column flexGrow={1.3} minWidth={220}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell dataKey="descricao" />
                    </Column>

                    <Column flexGrow={1.2} minWidth={220}>
                      <HeaderCell>Descricao comercial</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => rowData.descricao_comercial || '-'}
                      </Cell>
                    </Column>

                    <Column width={96} align="center">
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => rowData.unidade || '-'}
                      </Cell>
                    </Column>

                    <Column width={140}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => rowData.lote || '-'}
                      </Cell>
                    </Column>

                    <Column width={144}>
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: EstoqueRecord) => renderValidityBadge(rowData.validade, rowData.alerta_validade)}</Cell>
                    </Column>

                    <Column width={128} align="center">
                      <HeaderCell>Dias para validade</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => formatDaysToValidity(rowData.dias_para_validade)}
                      </Cell>
                    </Column>

                    <Column width={140} align="right">
                      <HeaderCell>Saldo disponivel</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => formatNumber(rowData.saldo_disponivel)}
                      </Cell>
                    </Column>

                    <Column width={140} align="right">
                      <HeaderCell>Saldo bloqueado</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => formatNumber(rowData.saldo_bloqueado)}
                      </Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>
                        {(rowData: EstoqueRecord) => (
                          <HStack spacing={8} justifyContent="center" className="boname-page__row-actions boname-page__row-actions--table">
                            <Whisper
                              placement="top"
                              trigger={['hover', 'focus']}
                              controlId={`estoque-bloquear-${rowData.est_id}`}
                              speaker={<Tooltip>Bloquear saldo</Tooltip>}
                            >
                              <IconButton
                                appearance="subtle"
                                size="xs"
                                circle
                                className="boname-page__action-icon boname-page__action-icon--edit"
                                icon={<LockIcon />}
                                aria-label="Bloquear saldo"
                                disabled={Number(rowData.saldo_disponivel || 0) <= 0}
                                onClick={() => handleOpenBlockModal(rowData, 'bloquear')}
                              />
                            </Whisper>
                            <Whisper
                              placement="top"
                              trigger={['hover', 'focus']}
                              controlId={`estoque-desbloquear-${rowData.est_id}`}
                              speaker={<Tooltip>Desbloquear saldo</Tooltip>}
                            >
                              <IconButton
                                appearance="subtle"
                                size="xs"
                                circle
                                className="boname-page__action-icon boname-page__action-icon--view"
                                icon={<UnlockIcon />}
                                aria-label="Desbloquear saldo"
                                disabled={Number(rowData.saldo_bloqueado || 0) <= 0}
                                onClick={() => handleOpenBlockModal(rowData, 'desbloquear')}
                              />
                            </Whisper>
                          </HStack>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de <strong>{records.length}</strong> registros.
              </p>
              <Pagination
                activePage={currentPage}
                boundaryLinks
                ellipsis
                first
                last
                limit={PAGE_SIZE}
                layout={['pager']}
                maxButtons={5}
                next
                prev
                size={isCompactLayout ? 'sm' : 'md'}
                total={records.length}
                onChangePage={setActivePage}
              />
            </div>
          </>
        ) : null}
      </PageSection>

      <AppModal
        open={selectedBlockItem !== null}
        backdrop="static"
        intent="edit"
        intentVisible={false}
        title={saldoActionLabel}
        className="boname-page__record-modal estoque-list-page__block-modal"
        onClose={handleCloseBlockModal}
        size={isCompactLayout ? 'full' : 'md'}
        footer={
          <>
            <Button appearance="subtle" disabled={blockMutation.isPending} onClick={handleCloseBlockModal}>
              Fechar
            </Button>
            <Button
              appearance="primary"
              loading={blockMutation.isPending}
              disabled={!canSubmitBlock}
              onClick={() => void handleSubmitBlock()}
            >
              {saldoActionLabel}
            </Button>
          </>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Dados do item de estoque">
            <dl className="boname-page__record-meta estoque-list-page__block-meta">
              <div>
                <dt>Medicamento</dt>
                <dd>{selectedBlockItem?.descricao || '-'}</dd>
              </div>
              <div>
                <dt>Descricao comercial</dt>
                <dd>{selectedBlockItem?.descricao_comercial || '-'}</dd>
              </div>
              <div>
                <dt>Unidade</dt>
                <dd>{selectedBlockItem?.unidade || '-'}</dd>
              </div>
              <div>
                <dt>Lote</dt>
                <dd>{selectedBlockItem?.lote || '-'}</dd>
              </div>
              <div>
                <dt>Validade</dt>
                <dd>{selectedBlockItem ? renderValidityBadge(selectedBlockItem.validade, selectedBlockItem.alerta_validade) : '-'}</dd>
              </div>
              <div>
                <dt>Saldo disponivel</dt>
                <dd>{formatNumber(selectedBlockItem?.saldo_disponivel ?? 0)}</dd>
              </div>
              <div className="estoque-list-page__block-input-card">
                <dt>{saldoActionFieldLabel}</dt>
                <dd>
                  <InputNumber
                    id={saldoAction === 'bloquear' ? 'estoque-bloquear-saldo' : 'estoque-desbloquear-saldo'}
                    min={1}
                    max={selectedSaldoLimit}
                    step={1}
                    size="sm"
                    controls={false}
                    className={blockQuantityError ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={blockQuantity}
                    onChange={(value) => void handleChangeBlockQuantity(value)}
                  />
                  {blockQuantityError ? <span className="boname-page__field-error">{blockQuantityError}</span> : null}
                </dd>
              </div>
              <div>
                <dt>Saldo bloqueado</dt>
                <dd>
                  <InputNumber
                    value={selectedBlockItem?.saldo_bloqueado ?? 0}
                    size="sm"
                    controls={false}
                    readOnly
                    className="boname-page__control"
                  />
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default EstoqueListPage
