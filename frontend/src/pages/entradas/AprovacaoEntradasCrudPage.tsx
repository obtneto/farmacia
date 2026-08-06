import { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  DatePicker,
  HStack,
  IconButton,
  Input,
  InputNumber,
  Pagination,
  Panel,
  SelectPicker,
  Tooltip,
  Whisper,
  useMediaQuery,
} from 'rsuite'
import EditIcon from '@rsuite/icons/Edit'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { useMask } from '../../hooks/useMask'
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

export interface EntradaNaoAprovadaRecord {
  data: string
  documento: string
  fornecedor: string
  id: number
  status: number
}

interface EntradaItemRecord {
  'descricao comercial'?: string
  id: number
  id_medicacao: number
  lote: string
  medicacao: string
  quantidade: number
  validade: string
}

interface EntradaDetalheRecord {
  ent_date: string | null
  ent_doc: string | null
  ent_id: number
  itens: EntradaItemRecord[]
  quantidade_total: number
  total_itens: number
}

interface EditItemForm {
  lote: string
  quantidade: number
  validade: Date | null
}

interface SelectOption {
  label: string
  value: number
}

interface FilterValues {
  depositoId: number | null
  endDate: string
  startDate: string
}

type FilterErrors = Partial<Record<keyof FilterValues, string>>
type EditItemErrors = Partial<Record<keyof EditItemForm, string>>

export interface AprovacaoEntradasCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const MAX_PERIOD_DAYS = 45
const PAGE_SIZE = 8
const MODAL_PAGE_SIZE = 8
const MAX_LOTE_LENGTH = 60
const MS_PER_DAY = 24 * 60 * 60 * 1000

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

function getStoredSessionUsername(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const rawSessionUser = window.localStorage.getItem(SESSION_USER_STORAGE_KEY)

  if (!rawSessionUser) {
    return ''
  }

  try {
    const sessionUser = JSON.parse(rawSessionUser) as Record<string, unknown>

    return String(
      sessionUser.username
      || sessionUser.user
      || sessionUser.user_name
      || sessionUser.preferred_username
      || sessionUser.id
      || '',
    ).trim()
  } catch {
    return ''
  }
}

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateFromInput(value: string): Date | null {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatDateForDisplay(value: string) {
  const parsedDate = parseDateFromInput(String(value).slice(0, 10))

  if (!parsedDate) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function createDefaultEditItemForm(): EditItemForm {
  return {
    lote: '',
    quantidade: 0,
    validade: null,
  }
}

function createEditItemForm(record: EntradaItemRecord): EditItemForm {
  return {
    lote: record.lote ?? '',
    quantidade: Number(record.quantidade || 0),
    validade: parseDateFromInput(String(record.validade).slice(0, 10)),
  }
}

function validateEditItemForm(values: EditItemForm): EditItemErrors {
  const errors: EditItemErrors = {}

  if (!values.lote.trim()) {
    errors.lote = 'Informe o lote.'
  }

  if (!values.validade) {
    errors.validade = 'Informe a validade do lote.'
  }

  if (!Number.isFinite(values.quantidade) || values.quantidade <= 0) {
    errors.quantidade = 'Informe uma quantidade maior que zero.'
  }

  return errors
}

function createDefaultFilterValues(): FilterValues {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    depositoId: null,
    endDate: formatDateForInput(today),
    startDate: formatDateForInput(monthStart),
  }
}

function calculatePeriodInDays(startDate: string, endDate: string) {
  const parsedStartDate = parseDateFromInput(startDate)
  const parsedEndDate = parseDateFromInput(endDate)

  if (!parsedStartDate || !parsedEndDate) {
    return null
  }

  return Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / MS_PER_DAY)
}

function validateFilters(values: FilterValues): FilterErrors {
  const errors: FilterErrors = {}
  const parsedStartDate = parseDateFromInput(values.startDate)
  const parsedEndDate = parseDateFromInput(values.endDate)

  if (!parsedStartDate) {
    errors.startDate = 'Informe a data inicial.'
  }

  if (!parsedEndDate) {
    errors.endDate = 'Informe a data final.'
  }

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    errors.startDate = 'A data inicial deve ser menor ou igual a data final.'
    errors.endDate = 'A data final deve ser maior ou igual a data inicial.'
  }

  const periodInDays = calculatePeriodInDays(values.startDate, values.endDate)
  if (periodInDays != null && periodInDays > MAX_PERIOD_DAYS) {
    errors.startDate = `O periodo nao pode ultrapassar ${MAX_PERIOD_DAYS} dias.`
    errors.endDate = `O periodo nao pode ultrapassar ${MAX_PERIOD_DAYS} dias.`
  }

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito.'
  }

  return errors
}

async function requestAprovacao<T>(
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
    throw new Error(payload?.msg || `Falha ao processar a requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function listarDepositosAtivos(baseUrl: string, authToken?: string | null): Promise<DepositoOptionRecord[]> {
  return requestAprovacao<DepositoOptionRecord[]>(
    baseUrl,
    '/parametros/depositos/listar-ativos/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarEntradasNaoAprovadas(
  baseUrl: string,
  filters: FilterValues,
  authToken?: string | null,
): Promise<EntradaNaoAprovadaRecord[]> {
  return requestAprovacao<EntradaNaoAprovadaRecord[]>(
    baseUrl,
    `/entradas/listar-nao-aprovados/*/${encodeURIComponent(filters.startDate)}/${encodeURIComponent(filters.endDate)}/${filters.depositoId ?? 0}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarEntradaDetalhes(baseUrl: string, entId: number, authToken?: string | null): Promise<EntradaDetalheRecord> {
  return requestAprovacao<EntradaDetalheRecord>(
    baseUrl,
    `/entradas/buscar/${entId}`,
    { method: 'GET' },
    authToken,
  )
}

type AprovarEntradaPayload = {
  entId: number
  userAprov: string
}

type AtualizarItemEntradaPayload = {
  itemId: number
  lote: string
  quantidade: number
  validade: string
}

async function aprovarEntrada(
  baseUrl: string,
  payload: AprovarEntradaPayload,
  authToken?: string | null,
): Promise<void> {
  await requestAprovacao(
    baseUrl,
    '/entradas/aprovar-entradas',
    {
      method: 'POST',
      body: JSON.stringify({
        ent_id: payload.entId,
        user_aprov: payload.userAprov,
      }),
    },
    authToken,
  )
}

async function excluirEntrada(baseUrl: string, entId: number, authToken?: string | null): Promise<void> {
  await requestAprovacao(baseUrl, `/entradas/excluir/${entId}`, { method: 'DELETE' }, authToken)
}

async function atualizarItemEntrada(
  baseUrl: string,
  payload: AtualizarItemEntradaPayload,
  authToken?: string | null,
): Promise<void> {
  await requestAprovacao(
    baseUrl,
    `/entradas/itens/${payload.itemId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        ent_lote: payload.lote,
        ent_lote_validade: payload.validade,
        ent_qtde: payload.quantidade,
      }),
    },
    authToken,
  )
}

export function AprovacaoEntradasCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: AprovacaoEntradasCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const mask = useMask()
  const queryClient = useQueryClient()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [filterValues, setFilterValues] = useState<FilterValues>(() => createDefaultFilterValues())
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({})
  const [submittedFilters, setSubmittedFilters] = useState<FilterValues | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [modalActivePage, setModalActivePage] = useState(1)
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaNaoAprovadaRecord | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EntradaItemRecord | null>(null)
  const [editItemForm, setEditItemForm] = useState<EditItemForm>(() => createDefaultEditItemForm())
  const [editItemErrors, setEditItemErrors] = useState<EditItemErrors>({})
  const modalTableWrapRef = useRef<HTMLDivElement | null>(null)
  const [modalTableWidth, setModalTableWidth] = useState(0)

  const resetEditItemState = () => {
    setEditingItem(null)
    setEditItemForm(createDefaultEditItemForm())
    setEditItemErrors({})
  }

  const depositosQuery = useQuery({
    queryKey: ['aprovacao-entradas-depositos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarDepositosAtivos(apiBaseUrl, resolvedAuthToken),
  })

  const listQuery = useQuery({
    queryKey: ['aprovacao-entradas-list', apiBaseUrl, submittedFilters, resolvedAuthToken],
    queryFn: () => listarEntradasNaoAprovadas(apiBaseUrl, submittedFilters as FilterValues, resolvedAuthToken),
    enabled: submittedFilters !== null,
  })

  const detalhesEntradaQuery = useQuery({
    queryKey: ['aprovacao-entradas-detalhes', apiBaseUrl, selectedEntrada?.id, resolvedAuthToken],
    queryFn: () => buscarEntradaDetalhes(apiBaseUrl, selectedEntrada?.id ?? 0, resolvedAuthToken),
    enabled: detailsModalOpen && selectedEntrada !== null,
  })

const aprovarEntradaMutation = useMutation({
  mutationFn: (payload: AprovarEntradaPayload) => aprovarEntrada(apiBaseUrl, payload, resolvedAuthToken),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['aprovacao-entradas-list', apiBaseUrl] })
    await message.success('Entrada aprovada', 'A entrada foi aprovada com sucesso.')
      closeDetailsModal()
    },
    onError: async (error) => {
      await message.error(
        'Nao foi possivel aprovar a entrada',
        error instanceof Error ? error.message : 'Erro ao aprovar a entrada.',
    )
  },
})

  const deleteEntradaMutation = useMutation({
    mutationFn: (entId: number) => excluirEntrada(apiBaseUrl, entId, resolvedAuthToken),
    onSuccess: async (_, entId) => {
      await queryClient.invalidateQueries({ queryKey: ['aprovacao-entradas-list', apiBaseUrl] })
      if (selectedEntrada?.id === entId) {
        closeDetailsModal()
      }
      await message.success('Entrada excluida', 'A entrada foi removida com sucesso.')
    },
    onError: async (error) => {
      await message.error(
        'Nao foi possivel excluir a entrada',
        error instanceof Error ? error.message : 'Erro ao excluir a entrada.',
      )
    },
  })

  const atualizarItemMutation = useMutation({
    mutationFn: (payload: AtualizarItemEntradaPayload) => atualizarItemEntrada(apiBaseUrl, payload, resolvedAuthToken),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['aprovacao-entradas-detalhes', apiBaseUrl, selectedEntrada?.id, resolvedAuthToken],
      })
      resetEditItemState()
      await message.success('Item atualizado', 'Lote, validade e quantidade foram atualizados com sucesso.')
    },
    onError: async (error) => {
      await message.error(
        'Nao foi possivel atualizar o item',
        getErrorMessage(error, 'Erro ao atualizar o item da entrada.'),
      )
    },
  })

  const depositoOptions: SelectOption[] = (depositosQuery.data ?? [])
    .map((item) => ({
      label: item.dep_descr,
      value: Number(item.dep_id),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const records = listQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const hasRecords = records.length > 0
  const hasSubmittedFilters = submittedFilters !== null
  const tableHeight = isCompactLayout ? 360 : 420
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const modalItems = detalhesEntradaQuery.data?.itens ?? []
  const modalItemsCount = modalItems.length
  const modalItemsTotalPages = Math.max(1, Math.ceil(modalItemsCount / MODAL_PAGE_SIZE))
  const modalCurrentPage = Math.min(modalActivePage, modalItemsTotalPages)
  const modalPageStart = (modalCurrentPage - 1) * MODAL_PAGE_SIZE
  const paginatedModalItems = modalItems.slice(modalPageStart, modalPageStart + MODAL_PAGE_SIZE)
  const modalPageLabelStart = modalItemsCount > 0 ? modalPageStart + 1 : 0
  const modalPageLabelEnd = modalItemsCount > 0 ? modalPageStart + paginatedModalItems.length : 0
  const modalTableHeight = isCompactLayout ? 360 : 430
  const effectiveModalTableWidth = detailsModalOpen ? modalTableWidth : 0

  useLayoutEffect(() => {
    if (!detailsModalOpen) {
      return
    }

    const container = modalTableWrapRef.current

    if (!container) {
      return
    }

    const updateTableWidth = () => {
      setModalTableWidth(Math.max(0, Math.round(container.getBoundingClientRect().width)))
    }

    updateTableWidth()

    const resizeObserver = new ResizeObserver(() => {
      updateTableWidth()
    })

    resizeObserver.observe(container)
    window.addEventListener('resize', updateTableWidth)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateTableWidth)
    }
  }, [detailsModalOpen, isCompactLayout, modalItemsCount])

  const handleSubmitFilters = async () => {
    const nextErrors = validateFilters(filterValues)
    setFilterErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise os filtros',
        text: 'Corrija os campos destacados antes de pesquisar.',
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

  const handleOpenDetails = (record: EntradaNaoAprovadaRecord) => {
    setModalActivePage(1)
    resetEditItemState()
    setSelectedEntrada(record)
    setDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    resetEditItemState()
    setDetailsModalOpen(false)
    setSelectedEntrada(null)
  }

  const handleCloseDetails = () => {
    if (aprovarEntradaMutation.isPending || deleteEntradaMutation.isPending || atualizarItemMutation.isPending) {
      return
    }
    closeDetailsModal()
  }

  const handleOpenEditItem = (record: EntradaItemRecord) => {
    setEditingItem(record)
    setEditItemForm(createEditItemForm(record))
    setEditItemErrors({})
  }

  const handleCloseEditItem = () => {
    if (atualizarItemMutation.isPending) {
      return
    }

    resetEditItemState()
  }

  const handleSaveEditItem = async () => {
    if (!editingItem) {
      return
    }

    const nextErrors = validateEditItemForm(editItemForm)
    setEditItemErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise os dados do item',
        text: 'Preencha lote, validade e quantidade antes de salvar.',
      })
      return
    }

    atualizarItemMutation.mutate({
      itemId: editingItem.id,
      lote: editItemForm.lote.trim().toLocaleUpperCase('pt-BR'),
      quantidade: editItemForm.quantidade,
      validade: editItemForm.validade ? formatDateForInput(editItemForm.validade) : '',
    })
  }

  const handleApproveEntry = () => {
    if (!selectedEntrada || aprovarEntradaMutation.isPending) {
      return
    }

    const sessionUsername = getStoredSessionUsername()

    if (!sessionUsername) {
      message.error('Sessao invalida', 'Nao foi possivel identificar o usuario aprovador da entrada.')
      return
    }

  aprovarEntradaMutation.mutate({
    entId: selectedEntrada.id,
    userAprov: sessionUsername,
  })
}

const handleRequestDelete = async (record: EntradaNaoAprovadaRecord) => {
  await message.confirmDestructive({
    title: 'Confirmar exclusao',
    subtitle: 'A entrada pendente e seus itens vinculados serao removidos.',
    description: 'Esta acao exclui a entrada de forma permanente. Confirme somente se tiver certeza.',
    highlightedLabel: 'Entrada',
    highlightedDescription: `${mask.documentNumber(record.documento)} | ${record.fornecedor}`,
    onConfirm: () => deleteEntradaMutation.mutateAsync(record.id),
  })
}

  const renderRowActions = (rowData: EntradaNaoAprovadaRecord, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" size="xs" startIcon={<VisibleIcon />} onClick={() => handleOpenDetails(rowData)}>
          Visualizar itens
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-aprovacao-view-${rowData.id}`} speaker={<Tooltip>Visualizar itens</Tooltip>}>
          <IconButton
            appearance="subtle"
            size="xs"
            circle
            className="boname-page__action-icon boname-page__action-icon--view"
            icon={<VisibleIcon />}
            aria-label="Visualizar itens"
            onClick={() => handleOpenDetails(rowData)}
          />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => void handleRequestDelete(rowData)}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-aprovacao-delete-${rowData.id}`} speaker={<Tooltip>Excluir entrada</Tooltip>}>
          <IconButton
            appearance="subtle"
            color="red"
            size="xs"
            circle
            className="boname-page__action-icon boname-page__action-icon--delete"
            icon={<TrashIcon />}
            aria-label="Excluir entrada"
            onClick={() => void handleRequestDelete(rowData)}
          />
        </Whisper>
      )}
    </HStack>
  )

  const renderModalItemActions = (rowData: EntradaItemRecord) => (
    isCompactLayout ? (
<Button
appearance="subtle"
size="sm"
        startIcon={<EditIcon />}
        disabled={atualizarItemMutation.isPending}
        onClick={() => handleOpenEditItem(rowData)}
      >
        Editar
      </Button>
    ) : (
      <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-aprovacao-item-edit-${rowData.id}`} speaker={<Tooltip>Editar item</Tooltip>}>
        <IconButton
          appearance="subtle"
          size="sm"
          circle
          className="boname-page__action-icon boname-page__action-icon--edit"
          icon={<EditIcon />}
          aria-label="Editar item"
          disabled={atualizarItemMutation.isPending}
          onClick={() => handleOpenEditItem(rowData)}
        />
      </Whisper>
    )
  )

  return (
    <section className="boname-page entradas-page entradas-page--merged-layout">
      <PageSection
        className="aprovacao-entradas-page__filters-section aprovacao-entradas-page__merged-section entradas-page__merged-section"
      >
        <div className="boname-page__form-grid aprovacao-entradas-page__filters-grid">
          <div className="boname-page__field aprovacao-entradas-page__filter-field">
            <label htmlFor="aprovacao-entrada-data-inicial">Data inicial</label>
            <DatePicker
              id="aprovacao-entrada-data-inicial"
              oneTap
              editable={false}
              format="dd/MM/yyyy"
              className={filterErrors.startDate ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={parseDateFromInput(filterValues.startDate)}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, startDate: value ? formatDateForInput(value) : '' }))
                setFilterErrors((current) => ({ ...current, startDate: undefined }))
              }}
            />
            {filterErrors.startDate ? <span role="alert">{filterErrors.startDate}</span> : null}
          </div>

          <div className="boname-page__field aprovacao-entradas-page__filter-field">
            <label htmlFor="aprovacao-entrada-data-final">Data final</label>
            <DatePicker
              id="aprovacao-entrada-data-final"
              oneTap
              editable={false}
              format="dd/MM/yyyy"
              className={filterErrors.endDate ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={parseDateFromInput(filterValues.endDate)}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, endDate: value ? formatDateForInput(value) : '' }))
                setFilterErrors((current) => ({ ...current, endDate: undefined }))
              }}
            />
            {filterErrors.endDate ? <span role="alert">{filterErrors.endDate}</span> : null}
          </div>

          <div className="boname-page__field aprovacao-entradas-page__filter-field">
            <label id="aprovacao-entrada-deposito-label">Deposito</label>
            <SelectPicker
              aria-labelledby="aprovacao-entrada-deposito-label"
              data={depositoOptions}
              searchable
              cleanable={false}
              placeholder="Selecione o deposito"
              className={filterErrors.depositoId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={filterValues.depositoId}
              loading={depositosQuery.isPending}
              onChange={(value) => {
                setFilterValues((current) => ({ ...current, depositoId: value == null ? null : Number(value) }))
                setFilterErrors((current) => ({ ...current, depositoId: undefined }))
              }}
            />
            {filterErrors.depositoId ? <span role="alert">{filterErrors.depositoId}</span> : null}
          </div>

          <div className="boname-page__field aprovacao-entradas-page__actions-field">
            <label className="aprovacao-entradas-page__actions-label">Acoes</label>
            <HStack spacing={10} wrap={false} className="boname-page__toolbar-actions aprovacao-entradas-page__actions-row">
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
        {depositosQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os depositos"
            description={depositosQuery.error instanceof Error ? depositosQuery.error.message : 'Erro ao carregar depositos ativos.'}
            action={
              <Button appearance="primary" onClick={() => void depositosQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!depositosQuery.isError && !hasSubmittedFilters ? (
          <DataState
            state="empty"
            title="Defina os filtros para pesquisar"
            description="Selecione o deposito, ajuste o periodo e clique em Pesquisar."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando entradas pendentes..."
            description="Consultando entradas de medicamentos nao aprovadas."
          />
        ) : null}

        {hasSubmittedFilters && listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as entradas"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar entradas nao aprovadas.'}
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
            title="Nenhuma entrada pendente encontrada"
            description="Nao ha entradas nao aprovadas para os filtros informados."
          />
        ) : null}

        {hasSubmittedFilters && !listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.documentNumber(rowData.documento)}</strong>
                          <p>{rowData.fornecedor}</p>
                        </div>
                        <StatusBadge tone="warning">Nao aprovada</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.id}</dd>
                        </div>
                        <div>
                          <dt>Data</dt>
                          <dd>{formatDateForDisplay(rowData.data)}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>Nao aprovada</dd>
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
                    fillHeight
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={70} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="id" />
                    </Column>

                    <Column width={130}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>
                        {(rowData: EntradaNaoAprovadaRecord) => formatDateForDisplay(rowData.data)}
                      </Cell>
                    </Column>

                    <Column width={190}>
                      <HeaderCell>Documento</HeaderCell>
                      <Cell>{(rowData: EntradaNaoAprovadaRecord) => mask.documentNumber(rowData.documento)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={260}>
                      <HeaderCell>Fornecedor</HeaderCell>
                      <Cell dataKey="fornecedor" />
                    </Column>

                    <Column width={140} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {() => <StatusBadge tone="warning">Nao aprovada</StatusBadge>}
                      </Cell>
                    </Column>

                    <Column width={112} fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>{(rowData: EntradaNaoAprovadaRecord) => renderRowActions(rowData)}</Cell>
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
        open={detailsModalOpen}
        backdrop="static"
        intent="view"
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal aprovacao-entradas-page__record-modal"
        title={selectedEntrada ? `Itens da entrada ${mask.documentNumber(selectedEntrada.documento)}` : 'Itens da entrada'}
        subtitle={selectedEntrada ? 'Revise os itens vinculados antes da aprovacao da entrada.' : 'Consulta dos itens vinculados a entrada selecionada.'}
        loading={detailsModalOpen && detalhesEntradaQuery.isPending}
        onClose={handleCloseDetails}
        size={isCompactLayout ? 'full' : 'lg'}
        footer={
          <>
            <Button appearance="subtle" disabled={atualizarItemMutation.isPending} onClick={handleCloseDetails}>
              Fechar
            </Button>
            <Button appearance="primary" loading={aprovarEntradaMutation.isPending} onClick={handleApproveEntry}>
              Aprovar entrada
            </Button>
          </>
        }
      >
        {detalhesEntradaQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os itens"
            description={detalhesEntradaQuery.error instanceof Error ? detalhesEntradaQuery.error.message : 'Erro ao carregar itens da entrada.'}
            action={
              <Button appearance="primary" onClick={() => void detalhesEntradaQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!detalhesEntradaQuery.isPending && !detalhesEntradaQuery.isError && modalItemsCount === 0 ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="A entrada selecionada nao retornou itens vinculados."
          />
        ) : null}

        {!detalhesEntradaQuery.isPending && !detalhesEntradaQuery.isError && modalItemsCount > 0 ? (
          <div className="aprovacao-entradas-page__modal-shell">
            <div className="aprovacao-entradas-page__modal-summary">
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Fornecedor</span>
                <strong>{selectedEntrada?.fornecedor}</strong>
              </div>
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Data da entrada</span>
                <strong>{selectedEntrada ? formatDateForDisplay(selectedEntrada.data) : '-'}</strong>
              </div>
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Status</span>
                <StatusBadge tone="warning">Nao aprovada</StatusBadge>
              </div>
            </div>

            <section className="aprovacao-entradas-page__modal-panel">
              <div className="aprovacao-entradas-page__modal-panel-header">
                <div className="aprovacao-entradas-page__modal-panel-copy">
                  <h3>Itens vinculados</h3>
                  <p>Confira lote, validade e quantidade antes de seguir com a aprovacao.</p>
                </div>
                <StatusBadge tone="info">{modalItemsCount} item{modalItemsCount > 1 ? 's' : ''}</StatusBadge>
              </div>

              <div ref={modalTableWrapRef} className="boname-page__table-wrap aprovacao-entradas-page__modal-table-wrap">
                <Table
                  key={`${selectedEntrada?.id ?? 'sem-entrada'}-${effectiveModalTableWidth}`}
                  data={paginatedModalItems}
                  height={modalTableHeight}
                  width={effectiveModalTableWidth || undefined}
                  fillHeight
                  bordered
                  rowHeight={50}
                  headerHeight={52}
                  autoHeight={false}
                >
                  <Column width={52} align="center">
                    <HeaderCell>ID</HeaderCell>
                    <Cell dataKey="id" />
                  </Column>

                  <Column flexGrow={1} minWidth={136}>
                    <HeaderCell>Medicamento</HeaderCell>
                    <Cell dataKey="medicacao" />
                  </Column>

                  <Column flexGrow={1} minWidth={136}>
                    <HeaderCell>Descricao comercial</HeaderCell>
                    <Cell>
                      {(rowData: EntradaItemRecord) => rowData['descricao comercial'] || '-'}
                    </Cell>
                  </Column>

                  <Column width={108}>
                    <HeaderCell>Lote</HeaderCell>
                    <Cell dataKey="lote" />
                  </Column>

                  <Column width={96}>
                    <HeaderCell>Validade</HeaderCell>
                    <Cell>
                      {(rowData: EntradaItemRecord) => formatDateForDisplay(rowData.validade)}
                    </Cell>
                  </Column>

                  <Column flexGrow={1} minWidth={72} align="center">
                    <HeaderCell>Qtde</HeaderCell>
                    <Cell dataKey="quantidade" />
                  </Column>

                  <Column width={isCompactLayout ? 110 : 82} align="center" fixed="right">
                    <HeaderCell>Acao</HeaderCell>
                    <Cell>{(rowData: EntradaItemRecord) => renderModalItemActions(rowData)}</Cell>
                  </Column>
                </Table>
              </div>

              <div className="aprovacao-entradas-page__modal-table-footer">
                <p>
                  Exibindo <strong>{modalPageLabelStart}</strong> a <strong>{modalPageLabelEnd}</strong> de <strong>{modalItemsCount}</strong> itens.
                </p>
                <Pagination
                  activePage={modalCurrentPage}
                  boundaryLinks
                  ellipsis
                  first
                  last
                  limit={MODAL_PAGE_SIZE}
                  layout={['pager']}
                  maxButtons={4}
                  next
                  prev
                  size={isCompactLayout ? 'sm' : 'md'}
                  total={modalItemsCount}
                  onChangePage={setModalActivePage}
                />
              </div>
            </section>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={editingItem !== null}
        backdrop="static"
        intent="edit"
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal"
        title="Editar item da entrada"
        subtitle={editingItem ? `Atualize lote, validade e quantidade de ${editingItem.medicacao}.` : 'Atualize os dados do item selecionado.'}
        onClose={handleCloseEditItem}
        size={isCompactLayout ? 'full' : 'sm'}
        footer={
          <>
            <Button appearance="subtle" disabled={atualizarItemMutation.isPending} onClick={handleCloseEditItem}>
              Cancelar
            </Button>
            <Button appearance="primary" loading={atualizarItemMutation.isPending} onClick={() => void handleSaveEditItem()}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Editar item da entrada">
            <div className="medicamentos-page__form-section-header">
              <h3>Dados do item</h3>
              <p>Revise os campos abaixo antes de continuar com a aprovacao da entrada.</p>
            </div>

            <div className="boname-page__form-grid entradas-page__item-modal-grid">
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="aprovacao-item-medicamento">Medicamento</label>
                <Input
                  id="aprovacao-item-medicamento"
                  size="sm"
                  readOnly
                  className="boname-page__control"
                  value={editingItem?.medicacao ?? ''}
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="aprovacao-item-lote">Lote</label>
                <Input
                  id="aprovacao-item-lote"
                  size="sm"
                  maxLength={MAX_LOTE_LENGTH}
                  className={editItemErrors.lote ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={editItemForm.lote}
                  onChange={(value) => {
                    setEditItemForm((current) => ({ ...current, lote: value.slice(0, MAX_LOTE_LENGTH) }))
                    setEditItemErrors((current) => ({ ...current, lote: undefined }))
                  }}
                />
                {editItemErrors.lote ? <span className="boname-page__field-error">{editItemErrors.lote}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="aprovacao-item-validade">Validade</label>
                <DatePicker
                  id="aprovacao-item-validade"
                  oneTap
                  editable={false}
                  format="dd/MM/yyyy"
                  className={editItemErrors.validade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={editItemForm.validade}
                  onChange={(value) => {
                    setEditItemForm((current) => ({ ...current, validade: value ?? null }))
                    setEditItemErrors((current) => ({ ...current, validade: undefined }))
                  }}
                />
                {editItemErrors.validade ? <span className="boname-page__field-error">{editItemErrors.validade}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="aprovacao-item-quantidade">Quantidade</label>
                <InputNumber
                  id="aprovacao-item-quantidade"
                  min={1}
                  size="sm"
                  controls={false}
                  className={editItemErrors.quantidade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={editItemForm.quantidade || null}
                  onChange={(value) => {
                    setEditItemForm((current) => ({ ...current, quantidade: Number(value || 0) }))
                    setEditItemErrors((current) => ({ ...current, quantidade: undefined }))
                  }}
                />
                {editItemErrors.quantidade ? <span className="boname-page__field-error">{editItemErrors.quantidade}</span> : null}
              </div>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default AprovacaoEntradasCrudPage
