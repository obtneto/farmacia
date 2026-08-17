import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import { Button, HStack, Input, Pagination, Panel, SelectPicker, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'
import './ConsultaMovimentacoesPage.css'

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

interface TipoMedicamentoOptionRecord {
  tipo_ativo: 0 | 1
  tipo_codigo: string
  tipo_descr: string
  tipo_id: number
}

interface SelectOption<TValue extends number | string = number | string> {
  label: string
  value: TValue
}

export interface MovimentacaoRecord {
  med_descr?: string | null
  med_nome?: string | null
  med_nome_comercial?: string | null
  mov_date: Date | string | null
  mov_descr: string | null
  mov_documento: string | null
  mov_id: number
  mov_med_id: number | null
  mov_med_lote: string | null
  mov_qtde: number | null
  mov_tipo: string | null
  mov_user: string | null
}

interface FilterValues {
  dataFinal: string
  dataInicial: string
  pesquisa: string
  tipoCodigo: string | null
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

export interface ConsultaMovimentacoesPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DAY_IN_MS = 1000 * 60 * 60 * 24
const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const MAX_RANGE_DAYS = 45
const PAGE_SIZE = 10

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

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultFilterValues(): FilterValues {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    dataFinal: formatDateInputValue(today),
    dataInicial: formatDateInputValue(firstDayOfMonth),
    pesquisa: '',
    tipoCodigo: null,
  }
}

function formatDateTimeForDisplay(value: Date | string | null): string {
  if (!value) {
    return '-'
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleString('pt-BR')
}

function formatNumber(value: number | null): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getRangeInDays(dataInicial: string, dataFinal: string): number | null {
  const initialDate = new Date(dataInicial)
  const finalDate = new Date(dataFinal)

  if (Number.isNaN(initialDate.getTime()) || Number.isNaN(finalDate.getTime())) {
    return null
  }

  return Math.floor((finalDate.getTime() - initialDate.getTime()) / DAY_IN_MS)
}

function getMedicamentoDescricao(record: MovimentacaoRecord): string {
  return record.med_nome?.trim() || record.med_descr?.trim() || record.mov_descr?.trim() || '-'
}

function getDescricaoComplementar(record: MovimentacaoRecord): string {
  const descricaoPrincipal = getMedicamentoDescricao(record)

  if (record.med_nome_comercial?.trim() && record.med_nome_comercial !== descricaoPrincipal) {
    return record.med_nome_comercial
  }

  if (record.mov_descr?.trim() && record.mov_descr !== descricaoPrincipal) {
    return record.mov_descr
  }

  return 'Descricao complementar nao informada'
}

function resolveMovementTone(value: string | null): 'danger' | 'info' | 'neutral' | 'success' | 'warning' {
  const normalizedValue = String(value || '').trim().toLocaleUpperCase()

  if (normalizedValue.includes('ENTRADA') || normalizedValue.includes('DEVOL')) {
    return 'success'
  }

  if (normalizedValue.includes('TRANSF')) {
    return 'info'
  }

  if (normalizedValue.includes('PERDA') || normalizedValue.includes('BLOQ')) {
    return 'danger'
  }

  if (normalizedValue.includes('SAIDA') || normalizedValue.includes('BAIXA')) {
    return 'warning'
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

  if (!values.tipoCodigo?.trim()) {
    errors.tipoCodigo = 'Selecione o tipo de medicamento.'
  }

  if (errors.dataInicial || errors.dataFinal) {
    return errors
  }

  const initialDate = new Date(values.dataInicial)
  const finalDate = new Date(values.dataFinal)

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
    return errors
  }

  const rangeInDays = getRangeInDays(values.dataInicial, values.dataFinal)

  if (rangeInDays !== null && rangeInDays > MAX_RANGE_DAYS) {
    errors.dataFinal = 'O intervalo entre as datas nao pode ultrapassar 45 dias.'
  }

  return errors
}

async function requestMovimentacoes<T>(
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

async function listarTiposMedicamentosAtivos(
  baseUrl: string,
  authToken?: string | null,
): Promise<TipoMedicamentoOptionRecord[]> {
  return requestMovimentacoes<TipoMedicamentoOptionRecord[]>(
    baseUrl,
    '/parametros/tipos_medicamentos/listar-ativos/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarMovimentacoes(
  baseUrl: string,
  filters: FilterValues,
  authToken?: string | null,
): Promise<MovimentacaoRecord[]> {
  const pesquisa = filters.pesquisa.trim() ? encodeURIComponent(filters.pesquisa.trim()) : '*'

  return requestMovimentacoes<MovimentacaoRecord[]>(
    baseUrl,
    `/movimentacoes/listar-movimentacoes/${pesquisa}/${filters.dataInicial}/${filters.dataFinal}/${encodeURIComponent(filters.tipoCodigo ?? '*')}`,
    { method: 'GET' },
    authToken,
  )
}

export function ConsultaMovimentacoesPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: ConsultaMovimentacoesPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilterValues)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['movimentacoes-tipos-medicamentos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarTiposMedicamentosAtivos(apiBaseUrl, resolvedAuthToken),
  })

  const listQuery = useQuery({
    queryKey: ['movimentacoes-list', apiBaseUrl, submittedFilters, resolvedAuthToken],
    queryFn: () => listarMovimentacoes(apiBaseUrl, submittedFilters as FilterValues, resolvedAuthToken),
    enabled: submittedFilters !== null,
  })

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
  const hasDependencyError = tiposMedicamentosQuery.isError
  const hasSubmittedFilters = submittedFilters !== null
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : 440
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0

  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise os filtros',
        text: 'Selecione o tipo de medicamento e mantenha o periodo em ate 45 dias.',
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
    await tiposMedicamentosQuery.refetch()
  }

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout consulta-movimentacoes-page">
      <PageSection
        className="estoque-page__filters-section estoque-page__merged-section"
      >
        <div className="boname-page__form-grid estoque-page__filters-grid consulta-movimentacoes-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="movimentacoes-pesquisa">Pesquisar</label>
            <Input
              id="movimentacoes-pesquisa"
              size="sm"
              className="boname-page__control"
              placeholder="Descricao do medicamento, documento ou lote"
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
            <label htmlFor="movimentacoes-data-inicial">Data inicial</label>
            <Input
              id="movimentacoes-data-inicial"
              type="date"
              size="sm"
              className={filterErrors.dataInicial ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.dataInicial}
              onChange={(value) => {
                setFilterValues((current) => ({
                  ...current,
                  dataInicial: value,
                }))
                setFilterErrors((current) => ({ ...current, dataInicial: undefined }))
              }}
            />
            {filterErrors.dataInicial ? <span role="alert">{filterErrors.dataInicial}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="movimentacoes-data-final">Data final</label>
            <Input
              id="movimentacoes-data-final"
              type="date"
              size="sm"
              className={filterErrors.dataFinal ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.dataFinal}
              onChange={(value) => {
                setFilterValues((current) => ({
                  ...current,
                  dataFinal: value,
                }))
                setFilterErrors((current) => ({ ...current, dataFinal: undefined }))
              }}
            />
            {filterErrors.dataFinal ? <span role="alert">{filterErrors.dataFinal}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="movimentacoes-tipo-label">Tipo de medicamento</label>
            <SelectPicker
              aria-labelledby="movimentacoes-tipo-label"
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

        {hasDependencyError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os filtros"
            description="Verifique o cadastro de tipos de medicamentos antes de consultar as movimentacoes."
            action={
              <Button appearance="primary" onClick={() => void handleRetryDependencies()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!hasDependencyError && !hasSubmittedFilters ? (
          <DataState
            state="empty"
            title="Defina os filtros para pesquisar"
            description="Selecione o tipo de medicamento, ajuste o periodo em ate 45 dias e use a pesquisa se necessario."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando movimentacoes..."
            description="Consultando o historico operacional com os filtros informados."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as movimentacoes"
            description={getErrorMessage(listQuery.error, 'Erro ao listar as movimentacoes.')}
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
            title="Nenhuma movimentacao encontrada"
            description="Nao ha registros para o periodo e tipo de medicamento informados."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={`${rowData.mov_id}-${rowData.mov_med_lote ?? 'sem-lote'}`} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{getMedicamentoDescricao(rowData)}</strong>
                          <p>{getDescricaoComplementar(rowData)}</p>
                        </div>
                        <StatusBadge tone={resolveMovementTone(rowData.mov_tipo)}>
                          {rowData.mov_tipo || 'Sem tipo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta consulta-movimentacoes-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.mov_id}</dd>
                        </div>
                        <div>
                          <dt>Data</dt>
                          <dd>{formatDateTimeForDisplay(rowData.mov_date)}</dd>
                        </div>
                        <div>
                          <dt>Lote</dt>
                          <dd>{rowData.mov_med_lote || '-'}</dd>
                        </div>
                        <div>
                          <dt>Quantidade</dt>
                          <dd>{formatNumber(rowData.mov_qtde)}</dd>
                        </div>
                        <div>
                          <dt>Documento</dt>
                          <dd>{rowData.mov_documento || '-'}</dd>
                        </div>
                        <div>
                          <dt>Usuario</dt>
                          <dd>{rowData.mov_user || '-'}</dd>
                        </div>
                      </dl>
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
                    rowHeight={56}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={72} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="mov_id" />
                    </Column>

                    <Column width={170}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => formatDateTimeForDisplay(rowData.mov_date)}
                      </Cell>
                    </Column>

                    <Column width={140}>
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => (
                          <StatusBadge tone={resolveMovementTone(rowData.mov_tipo)}>
                            {rowData.mov_tipo || 'Sem tipo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column flexGrow={1.3} minWidth={240}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => (
                          <div className="consulta-movimentacoes-page__table-copy">
                            <strong>{getMedicamentoDescricao(rowData)}</strong>
                            <span>{getDescricaoComplementar(rowData)}</span>
                          </div>
                        )}
                      </Cell>
                    </Column>

                    <Column width={140}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => rowData.mov_med_lote || '-'}
                      </Cell>
                    </Column>

                    <Column width={120} align="right">
                      <HeaderCell>Quantidade</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => formatNumber(rowData.mov_qtde)}
                      </Cell>
                    </Column>

                    <Column width={160}>
                      <HeaderCell>Documento</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => rowData.mov_documento || '-'}
                      </Cell>
                    </Column>

                    <Column width={160}>
                      <HeaderCell>Usuario</HeaderCell>
                      <Cell>
                        {(rowData: MovimentacaoRecord) => rowData.mov_user || '-'}
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
    </section>
  )
}

export default ConsultaMovimentacoesPage
