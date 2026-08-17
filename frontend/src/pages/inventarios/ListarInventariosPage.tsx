import { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, SelectPicker, Tooltip, Whisper, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'
import '../estoque/ConsultaMovimentacoesPage.css'
import './ListarInventariosPage.css'

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

interface DepositoOptionRecord {
  dep_descr: string
  dep_id: number
}

interface SelectOption<TValue extends number = number> {
  label: string
  value: TValue
}

interface InventarioRecord {
  dep_descr: string | null
  inv_date: Date | string | null
  inv_id: number
  inv_num: string | null
  inv_status: number | string | null
  inv_tipo: string | null
  tipo_descr: string | null
}

interface InventarioItemRecord {
  iti_id: number
  iti_inv_num: string | null
  iti_lote: string | null
  iti_med_id: number | null
  iti_qtde_dif: number | null
  iti_qtde_estoque: number | null
  iti_qtde_invent: number | null
  iti_validade: Date | string | null
  med_descr?: string | null
  med_und?: string | null
}

interface InventarioDetalheResponse {
  inventario: InventarioRecord
  itens: InventarioItemRecord[]
}

interface SalvarDigitacaoItem {
  med_id: number
  med_lote: string
  qtde_invent: number
}

interface SalvarDigitacaoRequest {
  invNum: string
  itens: SalvarDigitacaoItem[]
}

interface FilterValues {
  dataFinal: string
  dataInicial: string
  depositoId: number | null
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

export interface ListarInventariosPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 10

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

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

function formatDateForInput(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultFilters(): FilterValues {
  return {
    dataFinal: formatDateForInput(new Date()),
    dataInicial: '1970-01-01',
    depositoId: null,
  }
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

function formatDateForPath(value: string): string {
  return value.replaceAll('-', '/')
}

function maskInventarioNumero(value: string | null): string {
  const normalizedValue = String(value ?? '').replace(/[^A-Za-z0-9]/g, '').toLocaleUpperCase('pt-BR')

  if (!normalizedValue) {
    return '-'
  }

  return [
    normalizedValue.slice(0, 3),
    normalizedValue.slice(3, 7),
    normalizedValue.slice(7, 11),
  ].filter(Boolean).join('-')
}

function formatNumber(value: number | null): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getDigitacaoValue(item: InventarioItemRecord, values: Record<number, number | null>): number | null {
  if (Object.hasOwn(values, item.iti_id)) {
    return values[item.iti_id]
  }

  return item.iti_qtde_invent
}

function getDigitacaoDifference(item: InventarioItemRecord, values: Record<number, number | null>): number {
  return Number(getDigitacaoValue(item, values) || 0) - Number(item.iti_qtde_estoque || 0)
}

function getInventarioStatusLabel(value: number | string | null): string {
  const normalizedValue = Number(value)

  if (normalizedValue === 0) {
    return 'Aberto'
  }

  if (normalizedValue === 1) {
    return 'Fechado'
  }

  return 'Sem status'
}

function getInventarioStatusTone(value: number | string | null): 'neutral' | 'success' | 'warning' {
  const normalizedValue = Number(value)

  if (normalizedValue === 0) {
    return 'warning'
  }

  if (normalizedValue === 1) {
    return 'success'
  }

  return 'neutral'
}

function validateFilters(values: FilterValues): FilterErrors {
  const errors: FilterErrors = {}

  if (!values.dataInicial) {
    errors.dataInicial = 'Informe a data inicial.'
  }

  if (!values.dataFinal) {
    errors.dataFinal = 'Informe a data final.'
  }

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito.'
  }

  if (errors.dataInicial || errors.dataFinal) {
    return errors
  }

  const initialDate = new Date(`${values.dataInicial}T00:00:00`)
  const finalDate = new Date(`${values.dataFinal}T00:00:00`)

  if (Number.isNaN(initialDate.getTime())) {
    errors.dataInicial = 'Data inicial invalida.'
  }

  if (Number.isNaN(finalDate.getTime())) {
    errors.dataFinal = 'Data final invalida.'
  }

  if (errors.dataInicial || errors.dataFinal) {
    return errors
  }

  if (finalDate.getTime() < initialDate.getTime()) {
    errors.dataFinal = 'A data final deve ser maior ou igual a data inicial.'
  }

  return errors
}

async function requestInventarios<T>(
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
    payload = await response.json()
  } catch {
    // Respostas fora do contrato JSON sao tratadas pelo status HTTP.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function listarInventarios(
  baseUrl: string,
  filters: FilterValues,
  authToken?: string | null,
): Promise<InventarioRecord[]> {
  return requestInventarios<InventarioRecord[]>(
    baseUrl,
    `/inventarios/listar/${encodeURIComponent(formatDateForPath(filters.dataInicial))}/${encodeURIComponent(formatDateForPath(filters.dataFinal))}/${filters.depositoId ?? 0}`,
    { method: 'GET' },
    authToken,
  )
}

async function detalharInventario(
  baseUrl: string,
  invNum: string,
  authToken?: string | null,
): Promise<InventarioDetalheResponse> {
  return requestInventarios<InventarioDetalheResponse>(
    baseUrl,
    `/inventarios/detalhar/${encodeURIComponent(invNum)}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarDigitacaoInventario(
  baseUrl: string,
  invNum: string,
  itens: SalvarDigitacaoItem[],
  authToken?: string | null,
): Promise<Record<string, never>> {
  return requestInventarios<Record<string, never>>(
    baseUrl,
    `/inventarios/salvar-digitacao/${encodeURIComponent(invNum)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ itens }),
    },
    authToken,
  )
}

export function ListarInventariosPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: ListarInventariosPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilters)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [selectedInventario, setSelectedInventario] = useState<InventarioRecord | null>(null)
  const [digitacaoValues, setDigitacaoValues] = useState<Record<number, number | null>>({})
  const [digitacaoModalVersion, setDigitacaoModalVersion] = useState(0)
  const modalTableRef = useRef<HTMLDivElement | null>(null)
  const [digitacaoTableWidth, setDigitacaoTableWidth] = useState(0)

  const depositosQuery = useQuery({
    queryKey: ['listar-inventarios-depositos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => requestInventarios<DepositoOptionRecord[]>(
      apiBaseUrl,
      '/parametros/depositos/listar/*',
      { method: 'GET' },
      resolvedAuthToken,
    ),
  })

  const listQuery = useQuery({
    queryKey: ['listar-inventarios', apiBaseUrl, submittedFilters, resolvedAuthToken],
    queryFn: () => listarInventarios(apiBaseUrl, submittedFilters ?? getDefaultFilters(), resolvedAuthToken),
    enabled: submittedFilters !== null,
  })

  const detalheQuery = useQuery({
    queryKey: ['listar-inventarios-detalhe', apiBaseUrl, selectedInventario?.inv_num, resolvedAuthToken],
    queryFn: () => {
      const invNum = selectedInventario?.inv_num?.trim()

      if (!invNum) {
        throw new Error('Numero do inventario nao informado.')
      }

      return detalharInventario(apiBaseUrl, invNum, resolvedAuthToken)
    },
    enabled: Boolean(selectedInventario?.inv_num),
  })

  const saveDigitacaoMutation = useMutation({
    mutationFn: ({ invNum, itens }: SalvarDigitacaoRequest) => salvarDigitacaoInventario(
      apiBaseUrl,
      invNum,
      itens,
      resolvedAuthToken,
    ),
    onSuccess: () => {
      setSelectedInventario(null)
      setDigitacaoValues({})
      void message.success('Digitacao salva', 'As quantidades inventariadas foram salvas com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel salvar a digitacao', getErrorMessage(error))
    },
  })

  const depositoOptions: Array<SelectOption<number>> = (depositosQuery.data ?? [])
    .map((item) => ({
      label: item.dep_descr,
      value: Number(item.dep_id),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const records = listQuery.data ?? []
  const hasDependencyError = depositosQuery.isError
  const hasSubmittedFilters = submittedFilters !== null
  const hasRecords = records.length > 0
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const tableHeight = isCompactLayout ? 360 : 430
  const detalhe = detalheQuery.data
  const detalheItens = detalhe?.itens ?? []
  const hasDetalheItens = detalheItens.length > 0

  useLayoutEffect(() => {
    if (!selectedInventario || !hasDetalheItens || !modalTableRef.current) {
      return
    }

    const tableWrap = modalTableRef.current
    const updateDigitacaoTableWidth = () => {
      const nextWidth = tableWrap.clientWidth

      if (nextWidth > 0) {
        setDigitacaoTableWidth((current) => current === nextWidth ? current : nextWidth)
      }
    }

    updateDigitacaoTableWidth()

    const resizeObserver = new ResizeObserver(updateDigitacaoTableWidth)
    resizeObserver.observe(tableWrap)

    return () => {
      resizeObserver.disconnect()
    }
  }, [hasDetalheItens, selectedInventario])
  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.warning('Revise os filtros', 'Informe o periodo e selecione o deposito.')
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

  const handleOpenDigitacao = (inventario: InventarioRecord) => {
    setDigitacaoValues({})
    setDigitacaoModalVersion((current) => current + 1)
    setSelectedInventario(inventario)
  }

  const handleCloseDigitacao = () => {
    setSelectedInventario(null)
    setDigitacaoValues({})
  }

  const handleSaveDigitacao = () => {
    const invNum = detalhe?.inventario.inv_num?.trim()

    if (!invNum || detalheItens.length === 0) {
      void message.warning('Digitacao indisponivel', 'Nenhum item do inventario esta disponivel para salvar.')
      return
    }

    if (detalheItens.some((item) => !item.iti_med_id || !item.iti_lote)) {
      void message.error('Nao foi possivel salvar a digitacao', 'Ha item sem medicamento ou lote informado.')
      return
    }

    saveDigitacaoMutation.mutate({
      invNum,
      itens: detalheItens.map((item) => ({
        med_id: Number(item.iti_med_id),
        med_lote: item.iti_lote ?? '',
        qtde_invent: Number(getDigitacaoValue(item, digitacaoValues) ?? 0),
      })),
    })
  }

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout listar-inventarios-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <div className="boname-page__form-grid estoque-page__filters-grid listar-inventarios-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="listar-inventarios-data-inicial">Data Inicial de Inventario</label>
            <Input
              id="listar-inventarios-data-inicial"
              type="date"
              size="sm"
              className={filterErrors.dataInicial ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.dataInicial}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, dataInicial: value }))
                setFilterErrors((current) => ({ ...current, dataInicial: undefined }))
              }}
            />
            {filterErrors.dataInicial ? <span role="alert">{filterErrors.dataInicial}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="listar-inventarios-data-final">Data Final de Inventario</label>
            <Input
              id="listar-inventarios-data-final"
              type="date"
              size="sm"
              className={filterErrors.dataFinal ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.dataFinal}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, dataFinal: value }))
                setFilterErrors((current) => ({ ...current, dataFinal: undefined }))
              }}
            />
            {filterErrors.dataFinal ? <span role="alert">{filterErrors.dataFinal}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="listar-inventarios-deposito-label">Depositos</label>
            <SelectPicker
              aria-labelledby="listar-inventarios-deposito-label"
              className={filterErrors.depositoId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              cleanable={false}
              data={depositoOptions}
              loading={depositosQuery.isPending}
              placeholder="Selecione o deposito"
              searchable
              value={filterValues.depositoId}
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

        {hasDependencyError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os depositos"
            description={getErrorMessage(depositosQuery.error, 'Erro ao listar depositos.')}
            action={
              <Button appearance="primary" onClick={() => void depositosQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!hasDependencyError && !hasSubmittedFilters ? (
          <DataState
            state="empty"
            title="Defina os filtros para pesquisar"
            description="Informe o periodo e o deposito para listar os inventarios."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando inventarios..."
            description="Consultando os inventarios do periodo informado."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os inventarios"
            description={getErrorMessage(listQuery.error, 'Erro ao listar inventarios.')}
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
            title="Nenhum inventario encontrado"
            description="Nao ha inventarios para o periodo e deposito informados."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                      <Panel bordered key={rowData.inv_id} className="boname-page__record-card">
                        <div className="boname-page__record-card-top">
                          <div>
                            <strong>{maskInventarioNumero(rowData.inv_num)}</strong>
                            <p>{rowData.dep_descr || '-'}</p>
                          </div>
                          <StatusBadge tone={getInventarioStatusTone(rowData.inv_status)}>
                            {getInventarioStatusLabel(rowData.inv_status)}
                          </StatusBadge>
                        </div>

                        <dl className="boname-page__record-meta listar-inventarios-page__record-meta">
                          <div>
                            <dt>ID</dt>
                            <dd>{rowData.inv_id}</dd>
                          </div>
                          <div>
                            <dt>Data</dt>
                            <dd>{formatDateForDisplay(rowData.inv_date)}</dd>
                          </div>
                          <div>
                            <dt>Tipo</dt>
                            <dd>{rowData.tipo_descr || '-'}</dd>
                          </div>
                          <div>
                            <dt>Tipo de Inventario</dt>
                            <dd>{rowData.inv_tipo || '-'}</dd>
                          </div>
                        </dl>
                        <HStack spacing={10} className="boname-page__row-actions boname-page__row-actions--compact">
                          <Button
                            appearance="primary"
                            startIcon={<VisibleIcon />}
                            onClick={() => handleOpenDigitacao(rowData)}
                          >
                            Digitar
                          </Button>
                        </HStack>
                      </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table
                    autoHeight={false}
                    bordered
                    data={paginatedRecords}
                    fillHeight
                    height={tableHeight}
                    headerHeight={52}
                    rowHeight={56}
                    virtualized
                  >
                    <Column width={76} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="inv_id" />
                    </Column>

                    <Column width={150} fixed>
                      <HeaderCell>Numero</HeaderCell>
                      <Cell>{(rowData: InventarioRecord) => maskInventarioNumero(rowData.inv_num)}</Cell>
                    </Column>

                    <Column width={120}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: InventarioRecord) => formatDateForDisplay(rowData.inv_date)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell>{(rowData: InventarioRecord) => rowData.tipo_descr || '-'}</Cell>
                    </Column>

                    <Column flexGrow={1.1} minWidth={210}>
                      <HeaderCell>Deposito</HeaderCell>
                      <Cell>{(rowData: InventarioRecord) => rowData.dep_descr || '-'}</Cell>
                    </Column>

                    <Column width={130}>
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: InventarioRecord) => (
                          <StatusBadge tone={getInventarioStatusTone(rowData.inv_status)}>
                            {getInventarioStatusLabel(rowData.inv_status)}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={170}>
                      <HeaderCell>Tipo de Inventario</HeaderCell>
                      <Cell>{(rowData: InventarioRecord) => rowData.inv_tipo || '-'}</Cell>
                    </Column>

                    <Column width={96} align="center" fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>
                        {(rowData: InventarioRecord) => (
                          <HStack spacing={6} className="boname-page__row-actions boname-page__row-actions--table">
                            <Whisper
                              placement="top"
                              trigger="hover"
                              speaker={<Tooltip>Digitar inventario</Tooltip>}
                            >
                              <IconButton
                                aria-label="Digitar inventario"
                                appearance="subtle"
                                className="boname-page__action-icon"
                                icon={<VisibleIcon />}
                                onClick={() => handleOpenDigitacao(rowData)}
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
        className="boname-page__record-modal listar-inventarios-page__digitacao-modal"
        intent="edit"
        open={Boolean(selectedInventario)}
        overflow
        size="lg"
        title="Digitacao do Inventario"
        intentVisible={false}
        onClose={handleCloseDigitacao}
        footer={
          <Button
            appearance="primary"
            disabled={!hasDetalheItens || detalheQuery.isPending || saveDigitacaoMutation.isPending}
            loading={saveDigitacaoMutation.isPending}
            onClick={handleSaveDigitacao}
          >
            Salvar Digitacao
          </Button>
        }
      >
        {detalheQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando inventario..."
            description="Buscando os itens do inventario selecionado."
          />
        ) : null}

        {detalheQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar o inventario"
            description={getErrorMessage(detalheQuery.error, 'Erro ao detalhar inventario.')}
            action={
              <Button appearance="primary" onClick={() => void detalheQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {selectedInventario && !detalheQuery.isPending && !detalheQuery.isError && detalhe ? (
          <div className="listar-inventarios-page__modal-content">
            <dl className="boname-page__record-meta listar-inventarios-page__modal-meta">
              <div>
                <dt>Numero</dt>
                <dd>{maskInventarioNumero(detalhe.inventario.inv_num)}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{formatDateForDisplay(detalhe.inventario.inv_date)}</dd>
              </div>
              <div>
                <dt>Deposito</dt>
                <dd>{detalhe.inventario.dep_descr || '-'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{getInventarioStatusLabel(detalhe.inventario.inv_status)}</dd>
              </div>
            </dl>

            {!hasDetalheItens ? (
              <DataState
                state="empty"
                title="Nenhum item encontrado"
                description="O inventario selecionado nao possui itens para digitacao."
              />
            ) : (
              <div ref={modalTableRef} className="boname-page__table-wrap listar-inventarios-page__modal-table">
                <Table
                  autoHeight={false}
                  bordered
                  data={detalheItens}
                  height={360}
                  headerHeight={52}
                  key={`${selectedInventario?.inv_num ?? 'inventario'}-${digitacaoModalVersion}-${digitacaoTableWidth}`}
                  rowHeight={58}
                  width={digitacaoTableWidth || undefined}
                >
                  <Column width={76} align="center" verticalAlign="middle">
                    <HeaderCell>ID</HeaderCell>
                    <Cell dataKey="iti_med_id" />
                  </Column>

                  <Column flexGrow={1.3} minWidth={240} verticalAlign="middle">
                    <HeaderCell>Medicamento</HeaderCell>
                    <Cell>{(rowData: InventarioItemRecord) => rowData.med_descr || '-'}</Cell>
                  </Column>

                  <Column width={100} verticalAlign="middle">
                    <HeaderCell>Unidade</HeaderCell>
                    <Cell>{(rowData: InventarioItemRecord) => rowData.med_und || '-'}</Cell>
                  </Column>

                  <Column width={130} verticalAlign="middle">
                    <HeaderCell>Lote</HeaderCell>
                    <Cell>{(rowData: InventarioItemRecord) => rowData.iti_lote || '-'}</Cell>
                  </Column>

                  <Column width={120} verticalAlign="middle">
                    <HeaderCell>Validade</HeaderCell>
                    <Cell>{(rowData: InventarioItemRecord) => formatDateForDisplay(rowData.iti_validade)}</Cell>
                  </Column>

                  <Column width={110} align="right" verticalAlign="middle">
                    <HeaderCell>Estoque</HeaderCell>
                    <Cell>{(rowData: InventarioItemRecord) => formatNumber(rowData.iti_qtde_estoque)}</Cell>
                  </Column>

                  <Column width={140} align="center" verticalAlign="middle">
                    <HeaderCell>Inventario</HeaderCell>
                    <Cell
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      {(rowData: InventarioItemRecord) => (
                        <InputNumber
                          aria-label={`Quantidade inventariada do item ${rowData.iti_med_id ?? rowData.iti_id}`}
                          className="listar-inventarios-page__quantity-input"
                          controls={false}
                          min={0}
                          size="sm"
                          value={getDigitacaoValue(rowData, digitacaoValues)}
                          onChange={(value) => {
                            setDigitacaoValues((current) => ({
                              ...current,
                              [rowData.iti_id]: value === null || value === undefined ? null : Number(value),
                            }))
                          }}
                        />
                      )}
                    </Cell>
                  </Column>

                  <Column width={120} align="right" verticalAlign="middle">
                    <HeaderCell className="listar-inventarios-page__diff-column">Dif.</HeaderCell>
                    <Cell className="listar-inventarios-page__diff-column">{(rowData: InventarioItemRecord) => formatNumber(getDigitacaoDifference(rowData, digitacaoValues))}</Cell>
                  </Column>
                </Table>
              </div>
            )}
          </div>
        ) : null}
      </AppModal>
    </section>
  )
}

export default ListarInventariosPage
