import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DetailIcon from '@rsuite/icons/Detail'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import { Button, HStack, IconButton, Input, Pagination, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { apiRequest } from '../../lib/api'
import '../boname/BonameCrudPage.css'
import './SolicitacoesEncerradasPage.css'

export interface SolicitacaoEncerradaRecord {
  deposito_destino?: string | null
  deposito_origem?: string | null
  dep_destino_descr?: string | null
  dep_origem_descr?: string | null
  sol_data?: string | null
  sol_date?: string | null
  sol_date_aprov?: string | null
  sol_id: number
  sol_status?: number | null
  sol_user_aprov?: string | null
  sol_user_create?: string | null
}

export interface SolicitacaoEncerradaItemRecord {
  iso_id: number
  iso_med_id?: number | null
  iso_med_lote?: string | null
  iso_med_qtde?: number | null
  iso_med_validade?: string | null
  iso_qtde_digitada?: number | null
  med_descr?: string | null
  med_descr_coml?: string | null
}

interface FilterValues {
  dataFinal: string
  dataInicial: string
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

export interface SolicitacoesEncerradasPageProps {
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 8

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
  }
}

function formatDateForDisplay(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatDateTimeForDisplay(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const textValue = String(value).trim()
  const dateTimeMatch = textValue.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/)

  if (dateTimeMatch) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = dateTimeMatch
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`
  }

  return formatDateForDisplay(value)
}

function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatText(value?: string | number | null): string {
  const text = String(value ?? '').trim()
  return text || '-'
}

function getSolicitacaoDate(record: SolicitacaoEncerradaRecord): string | null | undefined {
  return record.sol_data || record.sol_date
}

function getDepositoOrigem(record: SolicitacaoEncerradaRecord): string | null | undefined {
  return record.deposito_origem || record.dep_origem_descr
}

function getDepositoDestino(record: SolicitacaoEncerradaRecord): string | null | undefined {
  return record.deposito_destino || record.dep_destino_descr
}

function validateFilters(values: FilterValues): FilterErrors {
  const errors: FilterErrors = {}

  if (!values.dataInicial) {
    errors.dataInicial = 'Informe a data inicial.'
  }

  if (!values.dataFinal) {
    errors.dataFinal = 'Informe a data final.'
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
  }

  return errors
}

async function listarSolicitacoesEncerradas(filters: FilterValues): Promise<SolicitacaoEncerradaRecord[]> {
  const dataInicial = encodeURIComponent(filters.dataInicial)
  const dataFinal = encodeURIComponent(filters.dataFinal)

  return apiRequest<SolicitacaoEncerradaRecord[]>(
    `/solicitacoes/listar_encerradas/${dataInicial}/${dataFinal}?data_ini=${dataInicial}&data_fim=${dataFinal}`,
    { method: 'GET' },
  )
}

async function listarItensSolicitacao(solId: number): Promise<SolicitacaoEncerradaItemRecord[]> {
  return apiRequest<SolicitacaoEncerradaItemRecord[]>(`/itens-solicitacoes/listar/${solId}`, { method: 'GET' })
}

export function SolicitacoesEncerradasPage({
  pageSize = DEFAULT_PAGE_SIZE,
}: SolicitacoesEncerradasPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilterValues)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoEncerradaRecord | null>(null)

  const listQuery = useQuery({
    queryKey: ['solicitacoes-encerradas', submittedFilters],
    queryFn: () => {
      if (!submittedFilters) {
        return Promise.resolve([])
      }

      return listarSolicitacoesEncerradas(submittedFilters)
    },
    enabled: submittedFilters !== null,
  })

  const itensQuery = useQuery({
    queryKey: ['solicitacao-encerrada-itens', selectedSolicitacao?.sol_id],
    queryFn: () => listarItensSolicitacao(Number(selectedSolicitacao?.sol_id ?? 0)),
    enabled: selectedSolicitacao !== null,
  })

  const records = listQuery.data ?? []
  const itens = itensQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(pageStart, pageStart + pageSize)
  const hasSubmittedFilters = submittedFilters !== null
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : 470
  const detailTableHeight = isCompactLayout ? 420 : 460
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0

  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise o periodo',
        text: 'Informe datas validas para consultar as solicitacoes encerradas.',
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

  const handleOpenDetailsModal = (record: SolicitacaoEncerradaRecord) => {
    setSelectedSolicitacao(record)
  }

  const handleCloseDetailsModal = () => {
    setSelectedSolicitacao(null)
  }

  const renderRowActions = (rowData: SolicitacaoEncerradaRecord, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" size="xs" startIcon={<DetailIcon />} onClick={() => handleOpenDetailsModal(rowData)}>
          Detalhes da Solicitação
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-encerrada-detail-${rowData.sol_id}`} speaker={<Tooltip>Detalhes da solicitação</Tooltip>}>
          <IconButton
            appearance="subtle"
            size="xs"
            circle
            className="boname-page__action-icon boname-page__action-icon--edit"
            icon={<DetailIcon />}
            aria-label="Detalhes da solicitação"
            onClick={() => handleOpenDetailsModal(rowData)}
          />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout solicitacoes-encerradas-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section solicitacoes-encerradas-page__section">
        <div className="boname-page__form-grid estoque-page__filters-grid solicitacoes-encerradas-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="solicitacoes-encerradas-data-inicial">Data inicial</label>
            <Input
              id="solicitacoes-encerradas-data-inicial"
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
            <label htmlFor="solicitacoes-encerradas-data-final">Data final</label>
            <Input
              id="solicitacoes-encerradas-data-final"
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
              onPressEnter={() => void handleSubmitFilters()}
            />
            {filterErrors.dataFinal ? <span role="alert">{filterErrors.dataFinal}</span> : null}
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

        {!hasSubmittedFilters ? (
          <DataState
            state="empty"
            title="Defina o periodo para pesquisar"
            description="Use a data inicial e final para listar as solicitacoes de transferencia encerradas."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando solicitacoes..."
            description="Consultando solicitacoes encerradas no periodo informado."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as solicitacoes"
            description={getErrorMessage(listQuery.error, 'Erro ao listar solicitacoes encerradas.')}
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
            title="Nenhuma solicitacao encerrada"
            description="Nao ha solicitacoes encerradas no periodo informado."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.sol_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>Solicitação {rowData.sol_id}</strong>
                          <p>{formatText(getDepositoOrigem(rowData))} para {formatText(getDepositoDestino(rowData))}</p>
                        </div>
                        <StatusBadge tone="success">Encerrada</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta solicitacoes-encerradas-page__record-meta">
                        <div>
                          <dt>Data</dt>
                          <dd>{formatDateForDisplay(getSolicitacaoDate(rowData))}</dd>
                        </div>
                        <div>
                          <dt>Origem</dt>
                          <dd>{formatText(getDepositoOrigem(rowData))}</dd>
                        </div>
                        <div>
                          <dt>Destino</dt>
                          <dd>{formatText(getDepositoDestino(rowData))}</dd>
                        </div>
                        <div>
                          <dt>Criado por</dt>
                          <dd>{formatText(rowData.sol_user_create)}</dd>
                        </div>
                        <div>
                          <dt>Aprovado por</dt>
                          <dd>{formatText(rowData.sol_user_aprov)}</dd>
                        </div>
                        <div>
                          <dt>Data aprovacao</dt>
                          <dd>{formatDateTimeForDisplay(rowData.sol_date_aprov)}</dd>
                        </div>
                      </dl>

                      {renderRowActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table
                    data={paginatedRecords}
                    height={tableHeight}
                    virtualized
                    bordered
                    rowHeight={56}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={120} align="center" fixed>
                      <HeaderCell>Solicitação</HeaderCell>
                      <Cell dataKey="sol_id" />
                    </Column>

                    <Column width={140}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatDateForDisplay(getSolicitacaoDate(rowData))}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Origem</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatText(getDepositoOrigem(rowData))}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Destino</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatText(getDepositoDestino(rowData))}
                      </Cell>
                    </Column>

                    <Column width={170}>
                      <HeaderCell>Criado por</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatText(rowData.sol_user_create)}
                      </Cell>
                    </Column>

                    <Column width={170}>
                      <HeaderCell>Aprovado por</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatText(rowData.sol_user_aprov)}
                      </Cell>
                    </Column>

                    <Column width={170}>
                      <HeaderCell>Data aprovação</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoEncerradaRecord) => formatDateForDisplay(rowData.sol_date_aprov)}
                      </Cell>
                    </Column>

                    <Column width={112} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>{() => <StatusBadge tone="success">Encerrada</StatusBadge>}</Cell>
                    </Column>

                    <Column width={118} fixed="right">
                      <HeaderCell>Ação</HeaderCell>
                      <Cell>{(rowData: SolicitacaoEncerradaRecord) => renderRowActions(rowData)}</Cell>
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
                limit={pageSize}
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
        open={selectedSolicitacao !== null}
        backdrop="static"
        className="boname-page__record-modal solicitacoes-encerradas-page__details-modal"
        footer={(
          <Button appearance="primary" onClick={handleCloseDetailsModal}>
            Fechar
          </Button>
        )}
        intent="view"
        intentVisible={false}
        loading={itensQuery.isPending}
        onClose={handleCloseDetailsModal}
        size={isCompactLayout ? 'full' : 'lg'}
        subtitle={selectedSolicitacao ? `Solicitação ${selectedSolicitacao.sol_id}` : undefined}
        title="Detalhes da Solicitação"
      >
        {selectedSolicitacao ? (
          <div className="solicitacoes-encerradas-page__details-summary">
            <div className="solicitacoes-encerradas-page__details-flow">
              <div>
                <span>Origem</span>
                <strong>{formatText(getDepositoOrigem(selectedSolicitacao))}</strong>
              </div>
              <div className="solicitacoes-encerradas-page__details-flow-separator" aria-hidden="true" />
              <div>
                <span>Destino</span>
                <strong>{formatText(getDepositoDestino(selectedSolicitacao))}</strong>
              </div>
            </div>

            <dl className="solicitacoes-encerradas-page__details-meta">
              <div>
                <dt>Data</dt>
                <dd>{formatDateForDisplay(getSolicitacaoDate(selectedSolicitacao))}</dd>
              </div>
              <div>
                <dt>Criado por</dt>
                <dd>{formatText(selectedSolicitacao.sol_user_create)}</dd>
              </div>
              <div>
                <dt>Aprovado por</dt>
                <dd>{formatText(selectedSolicitacao.sol_user_aprov)}</dd>
              </div>
              <div>
                <dt>Data aprovação</dt>
                <dd>{formatDateTimeForDisplay(selectedSolicitacao.sol_date_aprov)}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {itensQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar os itens"
            description={getErrorMessage(itensQuery.error, 'Nao foi possivel carregar os itens da solicitacao.')}
            action={
              <Button appearance="primary" onClick={() => void itensQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && itens.length === 0 ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="A solicitacao selecionada nao possui itens vinculados."
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && itens.length > 0 ? (
          <div className="boname-page__table-wrap solicitacoes-encerradas-page__details-table-wrap">
            <Table
              data={itens}
              height={detailTableHeight}
              bordered
              virtualized
              rowHeight={58}
              headerHeight={52}
              autoHeight={false}
            >
              <Column width={86}>
                <HeaderCell>Código</HeaderCell>
                <Cell>{(rowData: SolicitacaoEncerradaItemRecord) => formatText(rowData.iso_med_id)}</Cell>
              </Column>

              <Column flexGrow={1} minWidth={300}>
                <HeaderCell>Medicamento</HeaderCell>
                <Cell>
                  {(rowData: SolicitacaoEncerradaItemRecord) => (
                    <div className="solicitacoes-encerradas-page__table-copy">
                      <strong>{formatText(rowData.med_descr)}</strong>
                      <span>{formatText(rowData.med_descr_coml)}</span>
                    </div>
                  )}
                </Cell>
              </Column>

              <Column width={118}>
                <HeaderCell>Lote</HeaderCell>
                <Cell>{(rowData: SolicitacaoEncerradaItemRecord) => formatText(rowData.iso_med_lote)}</Cell>
              </Column>

              <Column width={112}>
                <HeaderCell>Validade</HeaderCell>
                <Cell>{(rowData: SolicitacaoEncerradaItemRecord) => formatDateForDisplay(rowData.iso_med_validade)}</Cell>
              </Column>

              <Column width={126} align="right">
                <HeaderCell>Qtde solicitada</HeaderCell>
                <Cell>{(rowData: SolicitacaoEncerradaItemRecord) => formatNumber(rowData.iso_med_qtde)}</Cell>
              </Column>

              <Column width={122} align="right">
                <HeaderCell>Qtde digitada</HeaderCell>
                <Cell>{(rowData: SolicitacaoEncerradaItemRecord) => formatNumber(rowData.iso_qtde_digitada)}</Cell>
              </Column>
            </Table>
          </div>
        ) : null}
      </AppModal>
    </section>
  )
}

export default SolicitacoesEncerradasPage
