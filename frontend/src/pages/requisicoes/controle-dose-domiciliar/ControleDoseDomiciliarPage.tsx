import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EditIcon from '@rsuite/icons/Edit'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, Checkbox, HStack, IconButton, Input, InputNumber, Pagination, SelectPicker, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { useMask } from '../../../hooks/useMask'
import { apiRequest } from '../../../lib/api'
import '../../boname/BonameCrudPage.css'
import '../../estoque/SolicitacoesEncerradasPage.css'
import './ControleDoseDomiciliarPage.css'

export interface ControleDDURecord {
  cdd_date?: string | null
  cdd_id: number
  cdd_pac_id?: number | null
  cdd_req_num?: number | string | null
  cdd_status?: number | null
  paciente?: string | null
}

export interface ControleDDUItemRecord {
  ite_dd_id?: number | null
  ite_dd_lote?: string | null
  ite_dd_med_id?: number | null
  ite_dd_qtde?: number | null
  ite_dd_qtde_retorno?: number | null
  med_descr?: string | null
  med_descr_coml?: string | null
  med_id?: number | null
  med_lote?: string | null
  med_qtde?: number | null
  med_qtde_digitada?: number | null
}

interface FilterValues {
  dataFinal: string
  dataInicial: string
  pesquisa: string
  status: number
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>

type AtualizarItemPayload = {
  lote: string
  med_id: number
  qtde_retorno: number
}

type AtualizarControlePayload = {
  itens: AtualizarItemPayload[]
  req_num: string
}

type ExcluirItemPayload = Omit<AtualizarItemPayload, 'qtde_retorno'>

type ExcluirControlePayload = {
  itens: ExcluirItemPayload[]
  req_num: string
}

type ModalMode = 'edit' | 'view'

export interface ControleDoseDomiciliarPageProps {
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 20
const EMPTY_CONTROLE_DDU_ITEMS: ControleDDUItemRecord[] = []
const EMPTY_CONTROLE_DDU_RECORDS: ControleDDURecord[] = []

const statusOptions = [
  { label: 'Aberto', value: 0 },
  { label: 'Encerrado', value: 1 },
]

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
    pesquisa: '*',
    status: 0,
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

function formatNumber(value?: number | string | null): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatText(value?: string | number | null): string {
  const text = String(value ?? '').trim()

  return text || '-'
}

function normalizeSearch(value: string): string {
  const text = value.trim()

  return text || '*'
}

function normalizeReqNum(value?: number | string | null): string {
  return String(value ?? '').trim()
}

function isControleEncerrado(status?: number | null): boolean {
  return Number(status ?? 0) === 1
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

function getItemId(item: ControleDDUItemRecord): number {
  return Number(item.ite_dd_id || `${getItemMedId(item)}${getItemLote(item)}`.length)
}

function getItemMedId(item: ControleDDUItemRecord): number {
  return Number(item.med_id ?? item.ite_dd_med_id ?? 0)
}

function getItemLote(item: ControleDDUItemRecord): string {
  return String(item.med_lote ?? item.ite_dd_lote ?? '').trim()
}

function getItemQuantidade(item: ControleDDUItemRecord): number {
  return Number(item.med_qtde ?? item.ite_dd_qtde ?? 0)
}

function getItemQuantidadeDigitada(item: ControleDDUItemRecord): number {
  return Number(item.med_qtde_digitada ?? item.ite_dd_qtde_retorno ?? 0)
}

function getItemLimiteRetorno(item: ControleDDUItemRecord): number {
  return Math.max(getItemQuantidade(item) - getItemQuantidadeDigitada(item), 0)
}

function getQuantidadeRetornoNumber(value: number | string | null | undefined): number {
  const numericValue = Number(value ?? 0)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(numericValue, 0)
}

function normalizeQuantidadeRetorno(value: number | string | null | undefined, maxValue: number): number {
  return Math.min(getQuantidadeRetornoNumber(value), Math.max(maxValue, 0))
}

async function listarControleDDU(filters: FilterValues): Promise<ControleDDURecord[]> {
  const pesquisa = encodeURIComponent(normalizeSearch(filters.pesquisa))
  const dataInicial = encodeURIComponent(filters.dataInicial)
  const dataFinal = encodeURIComponent(filters.dataFinal)

  return apiRequest<ControleDDURecord[]>(
    `/controle-ddu/listar/${pesquisa}/${dataInicial}/${dataFinal}/${filters.status}`,
    { method: 'GET' },
  )
}

async function listarItensControleDDU(reqNum: string, pesquisa: string): Promise<ControleDDUItemRecord[]> {
  return apiRequest<ControleDDUItemRecord[]>(
    `/controle-ddu/listar-itens/${encodeURIComponent(reqNum)}/${encodeURIComponent(normalizeSearch(pesquisa))}`,
    { method: 'GET' },
  )
}

async function atualizarItemControleDDU(payload: AtualizarControlePayload): Promise<void> {
  await apiRequest('/controle-ddu/atualizar-item', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

async function excluirItemControleDDU(payload: ExcluirControlePayload): Promise<void> {
  await apiRequest('/controle-ddu/excluir-item', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function ControleDoseDomiciliarPage({
  pageSize = DEFAULT_PAGE_SIZE,
}: ControleDoseDomiciliarPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const mask = useMask()
  const message = useMessage()
  const queryClient = useQueryClient()
  const [filterValues, setFilterValues] = useState<FilterValues>(getDefaultFilterValues)
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues>(getDefaultFilterValues)
  const [activePage, setActivePage] = useState(1)
  const [selectedControle, setSelectedControle] = useState<ControleDDURecord | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('edit')
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])
  const [digitadas, setDigitadas] = useState<Record<number, number>>({})

  const listQuery = useQuery({
    queryKey: ['controle-ddu', submittedFilters],
    queryFn: () => listarControleDDU(submittedFilters),
  })

  const reqNumSelecionada = normalizeReqNum(selectedControle?.cdd_req_num)
  const itensQuery = useQuery({
    queryKey: ['controle-ddu-itens', reqNumSelecionada],
    queryFn: () => listarItensControleDDU(reqNumSelecionada, '*'),
    enabled: reqNumSelecionada !== '',
  })

  const updateMutation = useMutation({
    mutationFn: atualizarItemControleDDU,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['controle-ddu-itens', reqNumSelecionada] })
      await message.success('DDU atualizado', 'Itens atualizados com sucesso.')
      handleCloseEditModal()
    },
    onError: async (error) => {
      await message.error('Nao foi possivel salvar o DDU', getErrorMessage(error))
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: excluirItemControleDDU,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['controle-ddu-itens', reqNumSelecionada] })
      await message.success('Item excluido', 'O item foi removido do DDU.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel excluir o item', getErrorMessage(error))
    },
  })

  const records = listQuery.data ?? EMPTY_CONTROLE_DDU_RECORDS
  const itens = itensQuery.data ?? EMPTY_CONTROLE_DDU_ITEMS
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(pageStart, pageStart + pageSize)
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : 470
  const detailTableHeight = isCompactLayout ? 420 : 460
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const selectedItems = itens.filter((item) => selectedItemIds.includes(getItemId(item)))

  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise o periodo',
        text: 'Informe datas validas para consultar o controle DDU.',
      })
      return
    }

    setActivePage(1)
    setSubmittedFilters({
      ...filterValues,
      pesquisa: normalizeSearch(filterValues.pesquisa),
    })
  }

  const handleRefresh = async () => {
    await listQuery.refetch()
  }

  const handleOpenEditModal = (record: ControleDDURecord) => {
    if (isControleEncerrado(record.cdd_status)) {
      return
    }

    setModalMode('edit')
    setSelectedControle(record)
    setSelectedItemIds([])
    setDigitadas({})
  }

  const handleOpenViewModal = (record: ControleDDURecord) => {
    setModalMode('view')
    setSelectedControle(record)
    setSelectedItemIds([])
    setDigitadas({})
  }

  function handleCloseEditModal() {
    setSelectedControle(null)
    setSelectedItemIds([])
    setDigitadas({})
  }

  const handleToggleItem = (itemId: number, checked: boolean) => {
    setSelectedItemIds((current) => {
      if (checked) {
        return current.includes(itemId) ? current : [...current, itemId]
      }

      return current.filter((selectedItemId) => selectedItemId !== itemId)
    })
  }

  const handleChangeDigitada = (itemId: number, value: number | string | null, maxValue: number) => {
    const numericValue = getQuantidadeRetornoNumber(value)

    if (numericValue > maxValue) {
      void message.warning(
        'Quantidade invalida',
        `A quantidade a retornar nao pode ser maior que ${formatNumber(maxValue)}.`,
      )
    }

    setDigitadas((current) => ({
      ...current,
      [itemId]: normalizeQuantidadeRetorno(value, maxValue),
    }))
  }

  const handleSave = async () => {
    if (!reqNumSelecionada || updateMutation.isPending) {
      return
    }

    if (selectedItems.length === 0) {
      await message.warning('Nenhum item selecionado', 'Marque pelo menos um item para salvar.')
      return
    }

    const payloadCandidates = selectedItems
      .map((item) => ({
        item,
        qtdeRetorno: normalizeQuantidadeRetorno(digitadas[getItemId(item)], getItemLimiteRetorno(item)),
      }))
      .filter((payload) => payload.qtdeRetorno > 0)

    if (payloadCandidates.length === 0) {
      await message.warning('Quantidade invalida', 'Informe pelo menos uma quantidade a retornar.')
      return
    }

    const hasInvalidQuantity = payloadCandidates.some((payload) => payload.qtdeRetorno > getItemLimiteRetorno(payload.item))

    if (hasInvalidQuantity) {
      await message.warning('Quantidade invalida', 'A quantidade a retornar nao pode ser maior que a quantidade recebida pendente de retorno.')
      return
    }

    const payloads = payloadCandidates.map((payload) => ({
      lote: getItemLote(payload.item),
      med_id: getItemMedId(payload.item),
      qtde_retorno: payload.qtdeRetorno,
    }))

    const hasInvalidItem = payloads.some((payload) => payload.med_id <= 0 || !payload.lote)

    if (hasInvalidItem) {
      await message.warning('Quantidade invalida', 'Revise os itens selecionados antes de salvar.')
      return
    }

    updateMutation.mutate({
      itens: payloads,
      req_num: reqNumSelecionada,
    })
  }

  const handleRequestDeleteSelectedItems = async () => {
    if (!reqNumSelecionada) {
      return
    }

    if (selectedItems.length === 0) {
      await message.warning('Nenhum item selecionado', 'Marque pelo menos um item para excluir.')
      return
    }

    await message.confirmDestructive({
      title: 'Confirmar exclusao',
      subtitle: 'Os itens selecionados serao removidos do controle DDU.',
      description: 'Esta acao exclui os itens de forma permanente.',
      highlightedLabel: 'Itens',
      highlightedDescription: `${selectedItems.length} selecionado(s)`,
      onConfirm: () => deleteItemMutation.mutateAsync({
        itens: selectedItems.map((item) => ({
          lote: getItemLote(item),
          med_id: getItemMedId(item),
        })),
        req_num: reqNumSelecionada,
      }),
    })
  }

  const renderStatus = (status?: number | null) => {
    if (isControleEncerrado(status)) {
      return <StatusBadge tone="success">Encerrado</StatusBadge>
    }

    return <StatusBadge tone="warning">Aberto</StatusBadge>
  }

  const renderRowActions = (rowData: ControleDDURecord, compact = false) => {
    const editDisabled = isControleEncerrado(rowData.cdd_status)
    const editTooltip = editDisabled ? 'DDU encerrado' : 'Editar DDU'

    return (
      <HStack
        spacing={8}
        wrap={compact}
        className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
      >
        {compact ? (
          <>
            <Button appearance="subtle" size="xs" startIcon={<VisibleIcon />} onClick={() => handleOpenViewModal(rowData)}>
              Visualizar itens
            </Button>
            <Button appearance="subtle" size="xs" startIcon={<EditIcon />} disabled={editDisabled} onClick={() => handleOpenEditModal(rowData)}>
              Editar DDU
            </Button>
          </>
        ) : (
          <>
            <Whisper placement="top" trigger={['hover', 'focus']} controlId={`controle-ddu-view-${rowData.cdd_id}`} speaker={<Tooltip>Visualizar itens</Tooltip>}>
              <IconButton
                appearance="subtle"
                size="xs"
                circle
                className="boname-page__action-icon boname-page__action-icon--view"
                icon={<VisibleIcon />}
                aria-label="Visualizar itens"
                onClick={() => handleOpenViewModal(rowData)}
              />
            </Whisper>
            <Whisper placement="top" trigger={['hover', 'focus']} controlId={`controle-ddu-edit-${rowData.cdd_id}`} speaker={<Tooltip>{editTooltip}</Tooltip>}>
              <span>
                <IconButton
                  appearance="subtle"
                  size="xs"
                  circle
                  disabled={editDisabled}
                  className={`boname-page__action-icon boname-page__action-icon--edit ${editDisabled ? 'controle-dose-domiciliar-page__disabled-action' : ''}`.trim()}
                  icon={<EditIcon />}
                  aria-label="Editar DDU"
                  onClick={() => handleOpenEditModal(rowData)}
                />
              </span>
            </Whisper>
          </>
        )}
      </HStack>
    )
  }

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout controle-dose-domiciliar-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section controle-dose-domiciliar-page__section">
        <div className="boname-page__form-grid estoque-page__filters-grid controle-dose-domiciliar-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="controle-ddu-data-inicial">Data inicial</label>
            <Input
              id="controle-ddu-data-inicial"
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
            <label htmlFor="controle-ddu-data-final">Data final</label>
            <Input
              id="controle-ddu-data-final"
              type="date"
              size="sm"
              className={filterErrors.dataFinal ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.dataFinal}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, dataFinal: value }))
                setFilterErrors((current) => ({ ...current, dataFinal: undefined }))
              }}
              onPressEnter={() => void handleSubmitFilters()}
            />
            {filterErrors.dataFinal ? <span role="alert">{filterErrors.dataFinal}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="controle-ddu-pesquisa">Pesquisa</label>
            <Input
              id="controle-ddu-pesquisa"
              size="sm"
              className="boname-page__control"
              value={filterValues.pesquisa}
              onChange={(value) => setFilterValues((current) => ({ ...current, pesquisa: value }))}
              onPressEnter={() => void handleSubmitFilters()}
            />
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label htmlFor="controle-ddu-status">Status</label>
            <SelectPicker
              id="controle-ddu-status"
              data={statusOptions}
              searchable={false}
              cleanable={false}
              size="sm"
              block
              className="boname-page__control"
              value={filterValues.status}
              onChange={(value) => setFilterValues((current) => ({ ...current, status: Number(value ?? 0) }))}
            />
          </div>

          <div className="boname-page__field estoque-page__actions-field">
            <label className="estoque-page__actions-label">Acoes</label>
            <HStack spacing={10} className="boname-page__toolbar-actions estoque-page__actions-row">
              <Button appearance="primary" startIcon={<SearchIcon />} loading={listQuery.isFetching} onClick={() => void handleSubmitFilters()}>
                Pesquisar
              </Button>
              <Button appearance="ghost" startIcon={<ReloadIcon />} loading={listQuery.isFetching && !listQuery.isPending} onClick={() => void handleRefresh()}>
                Atualizar
              </Button>
            </HStack>
          </div>
        </div>

        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando controles..."
            description="Consultando controles de dose domiciliar."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os controles"
            description={getErrorMessage(listQuery.error, 'Erro ao listar controles DDU.')}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasRecords ? (
          <DataState
            state="empty"
            title="Nenhum controle encontrado"
            description="Nao ha controles DDU no periodo informado."
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.cdd_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.requisitionNumber(rowData.cdd_req_num) || formatText(rowData.cdd_req_num)}</strong>
                          <p>{formatText(rowData.paciente)}</p>
                        </div>
                        {renderStatus(rowData.cdd_status)}
                      </div>

                      <dl className="boname-page__record-meta controle-dose-domiciliar-page__record-meta">
                        <div>
                          <dt>Data</dt>
                          <dd>{formatDateForDisplay(rowData.cdd_date)}</dd>
                        </div>
                        <div>
                          <dt>Paciente</dt>
                          <dd>{formatText(rowData.paciente)}</dd>
                        </div>
                        <div>
                          <dt>Requisicao</dt>
                          <dd>{mask.requisitionNumber(rowData.cdd_req_num) || formatText(rowData.cdd_req_num)}</dd>
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
                    <Column width={130} fixed>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: ControleDDURecord) => formatDateForDisplay(rowData.cdd_date)}</Cell>
                    </Column>

                    <Column width={150}>
                      <HeaderCell>Requisicao</HeaderCell>
                      <Cell>{(rowData: ControleDDURecord) => mask.requisitionNumber(rowData.cdd_req_num) || formatText(rowData.cdd_req_num)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={260}>
                      <HeaderCell>Paciente</HeaderCell>
                      <Cell>{(rowData: ControleDDURecord) => formatText(rowData.paciente)}</Cell>
                    </Column>

                    <Column width={120} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>{(rowData: ControleDDURecord) => renderStatus(rowData.cdd_status)}</Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: ControleDDURecord) => renderRowActions(rowData)}</Cell>
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
        open={selectedControle !== null}
        backdrop="static"
        className="boname-page__record-modal controle-dose-domiciliar-page__edit-modal"
        footer={(
          modalMode === 'edit' ? (
            <>
              <Button appearance="subtle" disabled={updateMutation.isPending} onClick={handleCloseEditModal}>
                Cancelar
              </Button>
              <Button
                appearance="primary"
                color="red"
                disabled={!itensQuery.isPending && selectedItems.length === 0}
                loading={deleteItemMutation.isPending}
                onClick={() => void handleRequestDeleteSelectedItems()}
              >
                Excluir
              </Button>
              <Button
                appearance="primary"
                disabled={!itensQuery.isPending && selectedItems.length === 0}
                loading={updateMutation.isPending}
                onClick={() => void handleSave()}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button appearance="primary" onClick={handleCloseEditModal}>
              Fechar
            </Button>
          )
        )}
        intent="edit"
        intentVisible={false}
        loading={itensQuery.isPending}
        onClose={handleCloseEditModal}
        size={isCompactLayout ? 'full' : 'lg'}
        subtitle={selectedControle?.cdd_req_num ? `Requisicao ${mask.requisitionNumber(selectedControle.cdd_req_num) || selectedControle.cdd_req_num}` : undefined}
        title={modalMode === 'edit' ? 'Editar DDU' : 'Visualizar itens do DDU'}
      >
        {selectedControle ? (
          <div className="controle-dose-domiciliar-page__edit-summary">
            <div className="controle-dose-domiciliar-page__edit-summary-item">
              <span>Paciente</span>
              <strong>{formatText(selectedControle.paciente)}</strong>
            </div>
            <div className="controle-dose-domiciliar-page__edit-summary-item">
              <span>Requisicao</span>
              <strong>{mask.requisitionNumber(selectedControle.cdd_req_num) || formatText(selectedControle.cdd_req_num)}</strong>
            </div>
            <div className="controle-dose-domiciliar-page__edit-summary-item">
              <span>Itens</span>
              <strong>{modalMode === 'edit' ? `${selectedItemIds.length} de ${itens.length}` : itens.length}</strong>
            </div>
          </div>
        ) : null}

        {itensQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar os itens"
            description={getErrorMessage(itensQuery.error, 'Nao foi possivel carregar os itens do DDU.')}
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
            description="O controle selecionado nao possui itens vinculados."
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && itens.length > 0 ? (
          <>
            <div className="boname-page__table-wrap controle-dose-domiciliar-page__edit-table-wrap">
              <Table
                data={itens}
                height={detailTableHeight}
                bordered
                rowHeight={58}
                headerHeight={52}
                autoHeight={false}
              >
                {modalMode === 'edit' ? (
                  <Column flexGrow={1} minWidth={72} align="center">
                    <HeaderCell>Sel.</HeaderCell>
                    <Cell>
                      {(rowData: ControleDDUItemRecord) => {
                        const itemId = getItemId(rowData)

                        return (
                          <Checkbox
                            aria-label={`Selecionar item ${itemId}`}
                            checked={selectedItemIds.includes(itemId)}
                            onChange={(_, checked) => handleToggleItem(itemId, checked)}
                          />
                        )
                      }}
                    </Cell>
                  </Column>
                ) : null}

                <Column flexGrow={1} minWidth={96}>
                  <HeaderCell>Codigo</HeaderCell>
                  <Cell>{(rowData: ControleDDUItemRecord) => formatText(getItemMedId(rowData))}</Cell>
                </Column>

                <Column flexGrow={4} minWidth={260}>
                  <HeaderCell>Descricao</HeaderCell>
                  <Cell>{(rowData: ControleDDUItemRecord) => formatText(rowData.med_descr)}</Cell>
                </Column>

                <Column flexGrow={2} minWidth={126}>
                  <HeaderCell>Lote</HeaderCell>
                  <Cell>{(rowData: ControleDDUItemRecord) => formatText(getItemLote(rowData))}</Cell>
                </Column>

                <Column flexGrow={2} minWidth={150} align="right">
                  <HeaderCell>Qtde Recebida</HeaderCell>
                  <Cell>{(rowData: ControleDDUItemRecord) => formatNumber(getItemQuantidade(rowData))}</Cell>
                </Column>

                <Column flexGrow={2} minWidth={150} align="right">
                  <HeaderCell>Qtde Retornada</HeaderCell>
                  <Cell>{(rowData: ControleDDUItemRecord) => formatNumber(getItemQuantidadeDigitada(rowData))}</Cell>
                </Column>

                {modalMode === 'edit' ? (
                  <Column flexGrow={2} minWidth={170}>
                    <HeaderCell>Qtde a Retornar</HeaderCell>
                    <Cell>
                      {(rowData: ControleDDUItemRecord) => {
                        const itemId = getItemId(rowData)
                        const maxValue = getItemLimiteRetorno(rowData)

                        return (
                          <InputNumber
                            min={0}
                            max={maxValue}
                            step={1}
                            controls={false}
                            className="boname-page__control controle-dose-domiciliar-page__quantity-input"
                            value={normalizeQuantidadeRetorno(digitadas[itemId], maxValue)}
                            onChange={(value) => handleChangeDigitada(itemId, value, maxValue)}
                            onBlur={(event) => handleChangeDigitada(itemId, event.currentTarget.value, maxValue)}
                          />
                        )
                      }}
                    </Cell>
                  </Column>
                ) : null}

              </Table>
            </div>

          </>
        ) : null}
      </AppModal>
    </section>
  )
}

export default ControleDoseDomiciliarPage
