import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, HStack, IconButton, Input, Pagination, Panel, SelectPicker, Tooltip, Whisper, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { useMask } from '../../../hooks/useMask'
import { getApiBaseUrl } from '../../../lib/api-base-url'
import '../../boname/BonameCrudPage.css'
import '../../estoque/ConsultaMovimentacoesPage.css'
import './ListarRequisicoesPorPeriodoPage.css'

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

export interface RequisicaoPeriodoRecord {
  data?: Date | string | null
  dep_descr?: string | null
  deposito?: string | null
  local?: string | null
  nom_paciente?: string | null
  numero?: string | null
  paciente?: string | null
  requisicao?: number | string | null
  req_date?: Date | string | null
  req_dep_id?: number | string | null
  req_id?: number | string | null
  req_num?: string | null
  req_solicitado_por?: string | null
  req_status?: number | string | null
  setor?: string | null
  solicitado_por?: string | null
  status?: number | string | null
  tipo?: string | null
}

interface RequisicaoItemRecord {
  ite_id: number
  ite_lote: string | null
  ite_med_id: number | string | null
  ite_qtde: number | string | null
  ite_validade: Date | string | null
  med_descr: string | null
  med_und: string | null
}

interface RequisicaoDetalheRecord extends RequisicaoPeriodoRecord {
  itens?: RequisicaoItemRecord[]
}

interface FilterValues {
  dataFinal: string
  dataInicial: string
  depositoId: number | null
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

export interface ListarRequisicoesPorPeriodoPageProps {
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

function getFirstDayOfCurrentMonth(): string {
  const currentDate = new Date()
  return formatDateForInput(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
}

function getDefaultFilters(): FilterValues {
  return {
    dataFinal: formatDateForInput(new Date()),
    dataInicial: getFirstDayOfCurrentMonth(),
    depositoId: null,
  }
}

function formatDateForPath(value: string): string {
  return value.replaceAll('-', '/')
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

async function requestRequisicoes<T>(
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

async function listarRequisicoesPeriodo(
  baseUrl: string,
  filters: FilterValues,
  authToken?: string | null,
): Promise<RequisicaoPeriodoRecord[]> {
  return requestRequisicoes<RequisicaoPeriodoRecord[]>(
    baseUrl,
    `/requisicoes/listar/${encodeURIComponent(formatDateForPath(filters.dataInicial))}/${encodeURIComponent(formatDateForPath(filters.dataFinal))}/${filters.depositoId ?? 0}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarRequisicaoDetalhe(
  baseUrl: string,
  reqId: number,
  authToken?: string | null,
): Promise<RequisicaoDetalheRecord> {
  return requestRequisicoes<RequisicaoDetalheRecord>(
    baseUrl,
    `/requisicoes/buscar/${reqId}`,
    { method: 'GET' },
    authToken,
  )
}

function getRequisicaoId(record: RequisicaoPeriodoRecord): string {
  return String(record.requisicao ?? record.req_id ?? record.numero ?? record.req_num ?? `${record.data ?? record.req_date ?? ''}-${record.paciente ?? record.nom_paciente ?? ''}`)
}

function getRequisicaoIdNumber(record: RequisicaoPeriodoRecord): number {
  return Number(record.requisicao ?? record.req_id ?? 0)
}

function getRequisicaoNumero(record: RequisicaoPeriodoRecord): string | null {
  return record.numero ?? record.req_num ?? null
}

function getSolicitadoPor(record: RequisicaoPeriodoRecord): string | null {
  return record.solicitado_por ?? record.req_solicitado_por ?? null
}

function getRequisicaoDate(record: RequisicaoPeriodoRecord): Date | string | null {
  return record.data ?? record.req_date ?? null
}

function getRequisicaoDestino(record: RequisicaoPeriodoRecord): string {
  return record.paciente || record.nom_paciente || record.setor || record.local || '-'
}

function getStatusLabel(value: number | string | null | undefined): string {
  const normalizedValue = Number(value)

  if (normalizedValue === 0) {
    return 'Pendente'
  }

  if (normalizedValue === 1) {
    return 'Aprovada'
  }

  if (normalizedValue === 2) {
    return 'Reprovada'
  }

  if (normalizedValue === 3) {
    return 'Devolvida'
  }

  return 'Sem status'
}

function getStatusTone(value: number | string | null | undefined): 'danger' | 'neutral' | 'success' | 'warning' {
  const normalizedValue = Number(value)

  if (normalizedValue === 0) {
    return 'warning'
  }

  if (normalizedValue === 1) {
    return 'success'
  }

  if (normalizedValue === 2) {
    return 'danger'
  }

  return 'neutral'
}

export function ListarRequisicoesPorPeriodoPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: ListarRequisicoesPorPeriodoPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const mask = useMask()
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilters)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [selectedRequisicao, setSelectedRequisicao] = useState<RequisicaoPeriodoRecord | null>(null)
  const [detailsTableVersion, setDetailsTableVersion] = useState(0)

  const depositosQuery = useQuery({
    queryKey: ['listar-requisicoes-periodo-depositos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => requestRequisicoes<DepositoOptionRecord[]>(
      apiBaseUrl,
      '/parametros/depositos/listar/*',
      { method: 'GET' },
      resolvedAuthToken,
    ),
  })

  const listQuery = useQuery({
    queryKey: ['listar-requisicoes-periodo', apiBaseUrl, submittedFilters, resolvedAuthToken],
    queryFn: () => listarRequisicoesPeriodo(apiBaseUrl, submittedFilters ?? getDefaultFilters(), resolvedAuthToken),
    enabled: submittedFilters !== null,
  })

  const detalheQuery = useQuery({
    queryKey: ['listar-requisicoes-periodo-detalhe', apiBaseUrl, selectedRequisicao ? getRequisicaoIdNumber(selectedRequisicao) : 0, resolvedAuthToken],
    queryFn: () => buscarRequisicaoDetalhe(apiBaseUrl, selectedRequisicao ? getRequisicaoIdNumber(selectedRequisicao) : 0, resolvedAuthToken),
    enabled: selectedRequisicao !== null && getRequisicaoIdNumber(selectedRequisicao) > 0,
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
  const detalheNumero = detalhe ? getRequisicaoNumero(detalhe) : selectedRequisicao ? getRequisicaoNumero(selectedRequisicao) : null
  const detalheDestino = detalhe ? getRequisicaoDestino(detalhe) : selectedRequisicao ? getRequisicaoDestino(selectedRequisicao) : '-'

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

  const handleOpenDetails = (record: RequisicaoPeriodoRecord) => {
    const reqId = getRequisicaoIdNumber(record)

    if (reqId <= 0) {
      void message.warning('Requisicao invalida', 'Nao foi possivel identificar a requisicao para visualizacao.')
      return
    }

    setDetailsTableVersion((current) => current + 1)
    setSelectedRequisicao(record)
  }

  const handleCloseDetails = () => {
    setSelectedRequisicao(null)
  }

  const renderRowActions = (rowData: RequisicaoPeriodoRecord, compact = false) => {
    const isLoadingCurrentRow = detalheQuery.isFetching
      && selectedRequisicao !== null
      && getRequisicaoIdNumber(selectedRequisicao) === getRequisicaoIdNumber(rowData)

    if (compact) {
      return (
        <Button
          appearance="primary"
          startIcon={<VisibleIcon />}
          loading={isLoadingCurrentRow}
          onClick={() => handleOpenDetails(rowData)}
        >
          Visualizar itens
        </Button>
      )
    }

    return (
      <Whisper
        placement="top"
        trigger={['hover', 'focus']}
        controlId={`requisicao-periodo-view-${getRequisicaoId(rowData)}`}
        speaker={<Tooltip>Visualizar itens</Tooltip>}
      >
        <IconButton
          aria-label="Visualizar itens da requisicao"
          appearance="subtle"
          size="sm"
          circle
          className="boname-page__action-icon boname-page__action-icon--view listar-requisicoes-periodo-page__action-button"
          icon={<VisibleIcon />}
          loading={isLoadingCurrentRow}
          onClick={() => handleOpenDetails(rowData)}
        />
      </Whisper>
    )
  }

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout listar-requisicoes-periodo-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <div className="boname-page__form-grid estoque-page__filters-grid listar-requisicoes-periodo-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="listar-requisicoes-periodo-data-inicial">Data Inicial</label>
            <Input
              id="listar-requisicoes-periodo-data-inicial"
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
            <label htmlFor="listar-requisicoes-periodo-data-final">Data Final</label>
            <Input
              id="listar-requisicoes-periodo-data-final"
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
            <label id="listar-requisicoes-periodo-deposito-label">Depositos</label>
            <SelectPicker
              aria-labelledby="listar-requisicoes-periodo-deposito-label"
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
            description="Informe o periodo e o deposito para listar as requisicoes aprovadas."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando requisicoes..."
            description="Consultando as requisicoes do periodo informado."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as requisicoes"
            description={getErrorMessage(listQuery.error, 'Erro ao listar requisicoes.')}
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
            title="Nenhuma requisicao encontrada"
            description="Nao ha requisicoes aprovadas para o periodo e deposito informados."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={getRequisicaoId(rowData)} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.requisitionNumber(getRequisicaoNumero(rowData)) || mask.text(getRequisicaoNumero(rowData) ?? rowData.requisicao ?? rowData.req_id)}</strong>
                          <p>{getRequisicaoDestino(rowData)}</p>
                        </div>
                        <StatusBadge tone={getStatusTone(rowData.status ?? rowData.req_status)}>
                          {getStatusLabel(rowData.status ?? rowData.req_status)}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta listar-requisicoes-periodo-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{mask.text(rowData.requisicao ?? rowData.req_id)}</dd>
                        </div>
                        <div>
                          <dt>Data</dt>
                          <dd>{mask.date(getRequisicaoDate(rowData))}</dd>
                        </div>
                        <div>
                          <dt>Tipo</dt>
                          <dd>{mask.text(rowData.tipo)}</dd>
                        </div>
                      </dl>
                      {renderRowActions(rowData, true)}
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
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => mask.text(rowData.requisicao ?? rowData.req_id)}</Cell>
                    </Column>

                    <Column width={150} fixed>
                      <HeaderCell>Numero</HeaderCell>
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => mask.requisitionNumber(getRequisicaoNumero(rowData)) || mask.text(getRequisicaoNumero(rowData))}</Cell>
                    </Column>

                    <Column width={120}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => mask.date(getRequisicaoDate(rowData))}</Cell>
                    </Column>

                    <Column flexGrow={1.2} minWidth={220}>
                      <HeaderCell>Paciente / Setor</HeaderCell>
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => getRequisicaoDestino(rowData)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => mask.text(rowData.tipo)}</Cell>
                    </Column>

                    <Column width={140}>
                      <HeaderCell>Solicitado por</HeaderCell>
                      <Cell>{(rowData: RequisicaoPeriodoRecord) => mask.text(getSolicitadoPor(rowData))}</Cell>
                    </Column>

                    <Column width={130}>
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: RequisicaoPeriodoRecord) => (
                          <StatusBadge tone={getStatusTone(rowData.status ?? rowData.req_status)}>
                            {getStatusLabel(rowData.status ?? rowData.req_status)}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={96} align="center">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell className="listar-requisicoes-periodo-page__action-cell">
                        {(rowData: RequisicaoPeriodoRecord) => renderRowActions(rowData)}
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
        className="boname-page__record-modal listar-requisicoes-periodo-page__details-modal"
        intent="view"
        intentVisible={false}
        open={selectedRequisicao !== null}
        overflow
        size="lg"
        title="Itens da Requisicao"
        onClose={handleCloseDetails}
        footer={
          <Button appearance="subtle" onClick={handleCloseDetails}>
            Fechar
          </Button>
        }
      >
        {detalheQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando requisicao..."
            description="Buscando os itens da requisicao selecionada."
          />
        ) : null}

        {detalheQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os itens"
            description={getErrorMessage(detalheQuery.error, 'Erro ao buscar itens da requisicao.')}
            action={
              <Button appearance="primary" onClick={() => void detalheQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!detalheQuery.isPending && !detalheQuery.isError ? (
          <div className="listar-requisicoes-periodo-page__modal-content">
            <dl className="boname-page__record-meta listar-requisicoes-periodo-page__modal-meta">
              <div>
                <dt>Numero da Requisicao</dt>
                <dd>{mask.requisitionNumber(detalheNumero) || mask.text(detalheNumero)}</dd>
              </div>
              <div>
                <dt>Paciente / Setor</dt>
                <dd>{detalheDestino}</dd>
              </div>
            </dl>

            {detalheItens.length === 0 ? (
              <DataState
                state="empty"
                title="Nenhum item encontrado"
                description="A requisicao selecionada nao possui itens."
              />
            ) : (
              <div className="boname-page__table-wrap listar-requisicoes-periodo-page__modal-table">
                <Table
                  autoHeight={false}
                  bordered
                  data={detalheItens}
                  fillHeight
                  height={360}
                  headerHeight={52}
                  key={`${selectedRequisicao ? getRequisicaoId(selectedRequisicao) : 'requisicao'}-${detailsTableVersion}-${detalheItens.length}`}
                  rowHeight={56}
                >
                  <Column flexGrow={1} minWidth={72} align="center">
                    <HeaderCell>ID</HeaderCell>
                    <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.ite_med_id)}</Cell>
                  </Column>

                  <Column flexGrow={5} minWidth={260}>
                    <HeaderCell>Medicamento</HeaderCell>
                    <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.med_descr)}</Cell>
                  </Column>

                  <Column flexGrow={1.4} minWidth={96}>
                    <HeaderCell>Unidade</HeaderCell>
                    <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.med_und)}</Cell>
                  </Column>

                  <Column flexGrow={2} minWidth={130}>
                    <HeaderCell>Lote</HeaderCell>
                    <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.ite_lote)}</Cell>
                  </Column>

                  <Column flexGrow={1.7} minWidth={126}>
                    <HeaderCell>Validade</HeaderCell>
                    <Cell>{(rowData: RequisicaoItemRecord) => mask.date(rowData.ite_validade)}</Cell>
                  </Column>

                  <Column flexGrow={1.6} minWidth={126} align="right">
                    <HeaderCell className="listar-requisicoes-periodo-page__quantity-column">Quantidade</HeaderCell>
                    <Cell className="listar-requisicoes-periodo-page__quantity-column">{(rowData: RequisicaoItemRecord) => mask.number(rowData.ite_qtde)}</Cell>
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

export default ListarRequisicoesPorPeriodoPage
