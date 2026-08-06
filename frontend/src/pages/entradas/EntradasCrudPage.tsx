import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  DatePicker,
  HStack,
  IconButton,
  Input,
  InputNumber,
  Panel,
  Pagination,
  SelectPicker,
  Tooltip,
  Whisper,
  useMediaQuery,
} from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import PlusIcon from '@rsuite/icons/Plus'
import PrintIcon from '@rsuite/icons/legacy/Print'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { AppModal, DataState, PageSection } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { useMask } from '../../hooks/useMask'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

export interface EntradaListItem {
  id: number
  data: string
  documento: string
  fornecedor: string
  ent_pac_id?: number | null
  dt_aprovacao?: string | null
  user_aprovacao?: string | null
}

export interface EntradaFormValues {
  ent_id: number
  ent_date: string
  ent_doc: string
  ent_fornecido_por: string
  ent_dep_id: number
}

interface EntradaItemFormValues {
  ent_med_id: number
  ent_lote: string
  ent_lote_validade: string
  ent_qtde: number
}

interface EntradaDetalheItem extends EntradaItemFormValues {
  id?: number
  id_medicacao?: number
  ite_ent_id: number
  quantidade?: number
  med_descr?: string
  med_descr_coml?: string
  medicacao?: string
  ['descricao comercial']?: string
  lote?: string
  validade?: string
}

interface EntradaDetalheRecord {
  ent_id: number
  ent_date: string
  ent_doc: string
  ent_fornecido_por: string
  ent_pac_id?: number | null
  total_itens: number
  quantidade_total: number
  itens: EntradaDetalheItem[]
}

interface EntradaReciboAvailability {
  ent_id: number
  ent_doc: string
  ent_pac_id: number | null
}

interface DraftEntradaItem extends EntradaItemFormValues {
  draftId: string
  medicamentoLabel: string
}

interface MedicamentoOptionRecord {
  med_id: number
  med_descr: string
  med_descr_coml: string
  med_ativo: 0 | 1
}

interface DepositoOptionRecord {
  dep_id: number
  dep_descr: string
  dep_ativo: 0 | 1
}

interface SelectOption<TValue extends number> {
  label: string
  value: TValue
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type HeaderFormErrors = Partial<Record<keyof EntradaFormValues, string>>
type ItemFormErrors = Partial<Record<keyof EntradaItemFormValues, string>>
type FormMode = 'create' | 'view'

export interface EntradasCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
  historyOnly?: boolean
}

const PAGE_SIZE = 10
const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const MAX_DOC_LENGTH = 90
const MAX_FORNECEDOR_LENGTH = 255
const MAX_LOTE_LENGTH = 60

const DEFAULT_HEADER_VALUES: EntradaFormValues = {
  ent_id: 0,
  ent_date: formatDateForInput(new Date()),
  ent_doc: '',
  ent_fornecido_por: '',
  ent_dep_id: 0,
}

const DEFAULT_ITEM_VALUES: EntradaItemFormValues = {
  ent_med_id: 0,
  ent_lote: '',
  ent_lote_validade: '',
  ent_qtde: 0,
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
    return 'Data invalida'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatDateTimeForDisplay(value: Date | string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleString('pt-BR')
}

function normalizeSearchTerm(value: string): string {
  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? '*' : trimmedValue
}

function normalizeText(value: string, maxLength: number): string {
  return value.slice(0, maxLength)
}

function createDefaultFilterDates() {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    startDate: formatDateForInput(monthStart),
    endDate: formatDateForInput(today),
  }
}

function validateHeaderForm(values: EntradaFormValues): HeaderFormErrors {
  const errors: HeaderFormErrors = {}

  if (!values.ent_date) {
    errors.ent_date = 'Informe a data da entrada.'
  }

  if (!values.ent_doc.trim()) {
    errors.ent_doc = 'Informe o documento da entrada.'
  }

  if (!values.ent_fornecido_por.trim()) {
    errors.ent_fornecido_por = 'Informe o fornecedor.'
  }

  if (values.ent_dep_id <= 0) {
    errors.ent_dep_id = 'Selecione o deposito de destino.'
  }

  return errors
}

function validateItemForm(values: EntradaItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {}

  if (values.ent_med_id <= 0) {
    errors.ent_med_id = 'Selecione o medicamento.'
  }

  if (!values.ent_lote.trim()) {
    errors.ent_lote = 'Informe o lote.'
  }

  if (!values.ent_lote_validade) {
    errors.ent_lote_validade = 'Informe a validade do lote.'
  }

  if (!Number.isFinite(values.ent_qtde) || values.ent_qtde <= 0) {
    errors.ent_qtde = 'Informe uma quantidade maior que zero.'
  }

  return errors
}

async function requestEntradas<T>(
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

async function listarEntradas(
  baseUrl: string,
  searchTerm: string,
  startDate: string,
  endDate: string,
  authToken?: string | null,
): Promise<EntradaListItem[]> {
  return requestEntradas<EntradaListItem[]>(
    baseUrl,
    `/entradas/listar/${encodeURIComponent(searchTerm)}/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarItensEntrada(
  baseUrl: string,
  entId: number,
  authToken?: string | null,
): Promise<EntradaDetalheItem[]> {
  const data = await requestEntradas<EntradaDetalheItem[]>(
    baseUrl,
    `/entradas/itens/${entId}`,
    { method: 'GET' },
    authToken,
  )

  return (data ?? []).map((item) => ({
    ...item,
    ent_med_id: Number(item.ent_med_id || item.id_medicacao || 0),
    ent_lote: String(item.ent_lote || item.lote || ''),
    ent_lote_validade: String(item.ent_lote_validade || item.validade || '').slice(0, 10),
    ent_qtde: Number(item.ent_qtde || item.quantidade || 0),
    ite_ent_id: Number(item.ite_ent_id || item.id || 0),
    med_descr: item.med_descr || item.medicacao || '',
    med_descr_coml: item.med_descr_coml || item['descricao comercial'] || '',
  }))
}

async function buscarEntradaReciboAvailability(
  baseUrl: string,
  entId: number,
  authToken?: string | null,
): Promise<EntradaReciboAvailability> {
  const data = await requestEntradas<EntradaReciboAvailability & { itens?: EntradaDetalheItem[] }>(
    baseUrl,
    `/entradas/buscar/${entId}`,
    { method: 'GET' },
    authToken,
  )

  return {
    ent_id: Number(data.ent_id || entId),
    ent_doc: String(data.ent_doc || ''),
    ent_pac_id: data.ent_pac_id == null ? null : Number(data.ent_pac_id),
  }
}

async function requestEntradasBlob(
  baseUrl: string,
  path: string,
  authToken?: string | null,
): Promise<Blob> {
  const headers = new Headers()

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    let message = `Falha ao processar a requisicao (${response.status}).`

    try {
      const payload = (await response.json()) as ApiResponse<unknown>
      if (payload?.msg) {
        message = payload.msg
      }
    } catch {
      // O backend de impressao responde com PDF em caso de sucesso.
    }

    throw new Error(message)
  }

  return await response.blob()
}

async function imprimirReciboEntrada(
  baseUrl: string,
  entId: number,
  authToken?: string | null,
): Promise<Blob> {
  return requestEntradasBlob(baseUrl, `/demandas-especificas/imprimir-recibo/${entId}`, authToken)
}

async function salvarEntrada(
  baseUrl: string,
  headerValues: EntradaFormValues,
  items: DraftEntradaItem[],
  authToken?: string | null,
): Promise<{ ent_id: number; total_itens: number }> {
  return requestEntradas<{ ent_id: number; total_itens: number }>(
    baseUrl,
    '/entradas/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        ent_id: headerValues.ent_id,
        ent_date: headerValues.ent_date,
        ent_doc: normalizeText(headerValues.ent_doc, MAX_DOC_LENGTH).trim().toLocaleUpperCase('pt-BR'),
        ent_fornecido_por: normalizeText(headerValues.ent_fornecido_por, MAX_FORNECEDOR_LENGTH).trim().toLocaleUpperCase('pt-BR'),
        ent_dep_id: headerValues.ent_dep_id,
        itens: items.map((item) => ({
          ent_med_id: item.ent_med_id,
          ent_lote: normalizeText(item.ent_lote, MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR'),
          ent_lote_validade: item.ent_lote_validade,
          ent_qtde: item.ent_qtde,
        })),
      }),
    },
    authToken,
  )
}

async function listarMedicamentosOptions(
  baseUrl: string,
  authToken?: string | null,
): Promise<MedicamentoOptionRecord[]> {
  return requestEntradas<MedicamentoOptionRecord[]>(
    baseUrl,
    '/parametros/medicamentos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarDepositosOptions(
  baseUrl: string,
  authToken?: string | null,
): Promise<DepositoOptionRecord[]> {
  return requestEntradas<DepositoOptionRecord[]>(
    baseUrl,
    '/parametros/depositos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

export function EntradasCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
  historyOnly = false,
}: EntradasCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const mask = useMask()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const draftIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [filterDates, setFilterDates] = useState(createDefaultFilterDates)
  const [submittedDates, setSubmittedDates] = useState(createDefaultFilterDates)
  const [activePage, setActivePage] = useState(1)
  const [pageMode, setPageMode] = useState<FormMode>('create')
  const [headerValues, setHeaderValues] = useState<EntradaFormValues>(DEFAULT_HEADER_VALUES)
  const [itemValues, setItemValues] = useState<EntradaItemFormValues>(DEFAULT_ITEM_VALUES)
  const [headerErrors, setHeaderErrors] = useState<HeaderFormErrors>({})
  const [itemErrors, setItemErrors] = useState<ItemFormErrors>({})
  const [draftItems, setDraftItems] = useState<DraftEntradaItem[]>([])
  const [selectedEntry, setSelectedEntry] = useState<EntradaDetalheRecord | null>(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [historyDetailsModalOpen, setHistoryDetailsModalOpen] = useState(false)

  const listQuery = useQuery({
    queryKey: ['entradas-list', apiBaseUrl, submittedSearch, submittedDates.startDate, submittedDates.endDate, resolvedAuthToken],
    queryFn: () => listarEntradas(apiBaseUrl, submittedSearch, submittedDates.startDate, submittedDates.endDate, resolvedAuthToken),
  })

  const medicamentosQuery = useQuery({
    queryKey: ['entradas-medicamentos-options', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarMedicamentosOptions(apiBaseUrl, resolvedAuthToken),
  })

  const depositosQuery = useQuery({
    queryKey: ['entradas-depositos-options', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarDepositosOptions(apiBaseUrl, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: () => salvarEntrada(apiBaseUrl, headerValues, draftItems, resolvedAuthToken),
    onSuccess: async (data) => {
      message.success('Entrada salva', `Entrada ${data.ent_id} registrada com ${data.total_itens} item(ns).`)
      resetCreateMode()
      await queryClient.invalidateQueries({ queryKey: ['entradas-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar entrada', getErrorMessage(error))
    },
  })

  const printReceiptMutation = useMutation({
    mutationFn: async ({ entId, entDoc }: { entId: number; entDoc: string }) => {
      const pdfBlob = await imprimirReciboEntrada(apiBaseUrl, entId, resolvedAuthToken)
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!openedWindow) {
        const anchor = document.createElement('a')
        anchor.href = pdfUrl
        anchor.download = `${(entDoc || `recibo-entrada-${entId}`).trim() || `recibo-entrada-${entId}`}.pdf`
        anchor.click()
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 60_000)
    },
    onError: (error: Error) => {
      message.error('Erro ao imprimir recibo', getErrorMessage(error))
    },
  })

  const medicamentoOptions: SelectOption<number>[] = (medicamentosQuery.data ?? [])
    .filter((item) => item.med_ativo === 1)
    .map((item) => ({
      label: item.med_descr_coml ? `${item.med_descr} · ${item.med_descr_coml}` : item.med_descr,
      value: item.med_id,
    }))

  const depositoOptions: SelectOption<number>[] = (depositosQuery.data ?? [])
    .filter((item) => item.dep_ativo === 1)
    .map((item) => ({
      label: item.dep_descr,
      value: item.dep_id,
    }))

  const records = listQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const paginatedRecordIds = paginatedRecords.map((rowData) => rowData.id)
  const hasData = records.length > 0
  const draftQuantityTotal = draftItems.reduce((total, item) => total + item.ent_qtde, 0)
  const tableHeight = Math.min(Math.max(paginatedRecords.length * 54 + 104, 260), 560)
  const draftTableHeight = Math.min(Math.max(draftItems.length * 54 + 104, 220), 420)
  const detailTableHeight = Math.min(Math.max((selectedEntry?.itens.length ?? 0) * 54 + 104, 220), 420)
  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0
  const selectedMedicamentoLabel = medicamentoOptions.find((item) => item.value === itemValues.ent_med_id)?.label ?? ''
  const selectedDepositoLabel = depositoOptions.find((item) => item.value === headerValues.ent_dep_id)?.label ?? ''
  const latestDraftItem = draftItems[draftItems.length - 1] ?? null

  const receiptAvailabilityQuery = useQuery({
    queryKey: ['entradas-history-receipt-availability', apiBaseUrl, resolvedAuthToken, ...paginatedRecordIds],
    enabled: paginatedRecordIds.length > 0,
    queryFn: async () => Promise.all(
      paginatedRecords.map((rowData) => buscarEntradaReciboAvailability(apiBaseUrl, rowData.id, resolvedAuthToken)),
    ),
  })

  const receiptAvailabilityMap = new Map(
    (receiptAvailabilityQuery.data ?? []).map((item) => [item.ent_id, item.ent_pac_id]),
  )

  const handleSearch = () => {
    setSubmittedSearch(normalizeSearchTerm(searchValue))
    setSubmittedDates(filterDates)
    setActivePage(1)
  }

  function resetCreateMode() {
    formRequestIdRef.current += 1
    setPageMode('create')
    setSelectedEntry(null)
    setHeaderValues({
      ...DEFAULT_HEADER_VALUES,
      ent_date: formatDateForInput(new Date()),
    })
    setItemValues(DEFAULT_ITEM_VALUES)
    setHeaderErrors({})
    setItemErrors({})
    setDraftItems([])
    setIsFormLoading(false)
  }

  const handleClearDrafts = () => {
    setDraftItems([])
  }

  const handleResetItemComposer = () => {
    setItemValues(DEFAULT_ITEM_VALUES)
    setItemErrors({})
  }

  const handleOpenView = async (record: EntradaListItem) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    if (historyOnly) {
      setHistoryDetailsModalOpen(true)
      setSelectedEntry(null)
    } else {
      setPageMode('view')
    }
    setIsFormLoading(true)
    setHeaderErrors({})
    setItemErrors({})

    try {
      const detailItems = await buscarItensEntrada(apiBaseUrl, record.id, resolvedAuthToken)

      if (formRequestIdRef.current !== requestId) {
        return
      }

      setSelectedEntry({
        ent_id: record.id,
        ent_date: String(record.data).slice(0, 10),
        ent_doc: record.documento,
        ent_fornecido_por: record.fornecedor,
        itens: detailItems,
        total_itens: detailItems.length,
        quantidade_total: detailItems.reduce((total, item) => total + Number(item.ent_qtde || 0), 0),
      })
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar entrada', getErrorMessage(error))
      if (historyOnly) {
        setHistoryDetailsModalOpen(false)
        setSelectedEntry(null)
      } else {
        resetCreateMode()
      }
    } finally {
      if (formRequestIdRef.current === requestId) {
        setIsFormLoading(false)
      }
    }
  }

  const handleCloseHistoryDetails = () => {
    formRequestIdRef.current += 1
    setHistoryDetailsModalOpen(false)
    setSelectedEntry(null)
    setIsFormLoading(false)
  }

  const handleAddDraftItem = () => {
    const nextErrors = validateItemForm(itemValues)
    setItemErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      message.warning('Item incompleto', 'Revise os campos obrigatorios do item antes de adiciona-lo.')
      return
    }

    if (!selectedMedicamentoLabel) {
      message.warning('Medicamento invalido', 'Selecione um medicamento valido antes de adicionar o item.')
      return
    }

    if (draftItems.some((item) => item.ent_med_id === itemValues.ent_med_id)) {
      message.warning('Medicamento duplicado', 'O mesmo medicamento nao pode ser repetido na mesma entrada.')
      return
    }

    draftIdRef.current += 1

    setDraftItems((current) => [
      ...current,
      {
        ...itemValues,
        draftId: String(draftIdRef.current),
        medicamentoLabel: selectedMedicamentoLabel,
      },
    ])
    setItemValues(DEFAULT_ITEM_VALUES)
    setItemErrors({})
  }

  const handleRemoveDraftItem = (draftId: string) => {
    setDraftItems((current) => current.filter((item) => item.draftId !== draftId))
  }

  const handleSaveEntry = async () => {
    const nextHeaderErrors = validateHeaderForm(headerValues)
    setHeaderErrors(nextHeaderErrors)

    if (Object.keys(nextHeaderErrors).length > 0) {
      message.warning('Cabeçalho incompleto', 'Preencha os dados principais da entrada antes de salvar.')
      return
    }

    if (draftItems.length === 0) {
      message.warning('Nenhum item adicionado', 'Adicione pelo menos um item antes de salvar a entrada.')
      return
    }

    await saveMutation.mutateAsync()
  }

  const renderHistoryActions = (rowData: EntradaListItem, compact = false) => {
    const entPacId = receiptAvailabilityMap.get(rowData.id)
    const canPrintReceipt = entPacId != null
    const isPrintingCurrentRow = printReceiptMutation.isPending && printReceiptMutation.variables?.entId === rowData.id

    return (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button
          appearance="subtle"
          size="xs"
          aria-label="Imprimir recibo"
          startIcon={<PrintIcon />}
          disabled={!canPrintReceipt || receiptAvailabilityQuery.isFetching}
          loading={isPrintingCurrentRow}
          onClick={() => {
            void printReceiptMutation.mutateAsync({
              entId: rowData.id,
              entDoc: rowData.documento,
            })
          }}
        >
          Recibo
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-print-${rowData.id}`} speaker={<Tooltip>Imprimir recibo</Tooltip>}>
          <IconButton
            appearance="subtle"
            size="xs"
            aria-label="Imprimir recibo"
            circle
            className="boname-page__action-icon"
            icon={<PrintIcon />}
            disabled={!canPrintReceipt || receiptAvailabilityQuery.isFetching}
            loading={isPrintingCurrentRow}
            onClick={() => {
              void printReceiptMutation.mutateAsync({
                entId: rowData.id,
                entDoc: rowData.documento,
              })
            }}
          />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Visualizar entrada" startIcon={<VisibleIcon />} onClick={() => { void handleOpenView(rowData) }}>
          Visualizar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-view-${rowData.id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar entrada" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenView(rowData) }} />
        </Whisper>
      )}
    </HStack>
    )
  }

  const renderDraftActions = (rowData: DraftEntradaItem, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" color="red" size="xs" aria-label="Remover item" startIcon={<TrashIcon />} onClick={() => handleRemoveDraftItem(rowData.draftId)}>
          Remover
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-draft-delete-${rowData.draftId}`} speaker={<Tooltip>Remover item</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Remover item" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => handleRemoveDraftItem(rowData.draftId)} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className={`boname-page entradas-page ${historyOnly ? 'entradas-page--history-only' : ''}`.trim()}>
      {!historyOnly ? (
        <>
          <PageSection
            className="boname-page__table-section entradas-page__form-section"
            title={pageMode === 'view' ? 'Visualizacao da entrada' : 'Lancar entrada de medicamentos'}
            description={
              pageMode === 'view'
                ? 'Consulta do cabeçalho da entrada e dos itens vinculados ao registro.'
                : 'Monte o cabeçalho da entrada, adicione os itens e grave tudo em `tb_entradas` + `tb_itens_entradas`.'
            }
            actions={
              <HStack spacing={10} wrap className="entradas-page__header-actions">
                {pageMode === 'view' ? (
                  <Button appearance="primary" onClick={resetCreateMode}>
                    Voltar para cadastro
                  </Button>
                ) : (
                  <Button appearance="subtle" onClick={resetCreateMode}>
                    Limpar formulario
                  </Button>
                )}
              </HStack>
            }
          >
            {isFormLoading ? (
              <DataState
                state="loading"
                title="Carregando entrada..."
                description="Buscando o cabeçalho e os itens associados a entrada selecionada."
              />
            ) : pageMode === 'view' && selectedEntry ? (
              <div className="entradas-page__form-layout">
                <div className="boname-page__form-grid entradas-page__form-grid">
                  <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Cabecalho da entrada">
                    <div className="medicamentos-page__form-section-header">
                      <h3>Cabecalho da entrada</h3>
                      <p>Dados persistidos em `tb_entradas`.</p>
                    </div>
                    <div className="medicamentos-page__form-subgrid">
                      <div className="boname-page__field">
                        <label htmlFor="entrada-view-id">ID</label>
                        <Input id="entrada-view-id" size="sm" className="boname-page__control" value={String(selectedEntry.ent_id)} disabled />
                      </div>
                      <div className="boname-page__field">
                        <label htmlFor="entrada-view-data">Data da entrada</label>
                        <Input id="entrada-view-data" size="sm" className="boname-page__control" value={formatDateForDisplay(selectedEntry.ent_date)} disabled />
                      </div>
                      <div className="boname-page__field">
                        <label htmlFor="entrada-view-doc">Documento</label>
                        <Input id="entrada-view-doc" size="sm" className="boname-page__control" value={mask.documentNumber(selectedEntry.ent_doc)} disabled />
                      </div>
                      <div className="boname-page__field">
                        <label htmlFor="entrada-view-fornecedor">Fornecedor</label>
                        <Input id="entrada-view-fornecedor" size="sm" className="boname-page__control" value={selectedEntry.ent_fornecido_por} disabled />
                      </div>
                    </div>
                  </section>

                  <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Itens da entrada">
                    <div className="medicamentos-page__form-section-header">
                      <h3>Itens da entrada</h3>
                      <p>Detalhamento persistido em `tb_itens_entradas`.</p>
                    </div>

                    {selectedEntry.itens.length === 0 ? (
                      <DataState
                        state="empty"
                        title="Nenhum item registrado"
                        description="Esta entrada nao possui itens vinculados na tabela de detalhe."
                      />
                    ) : isCompactLayout ? (
                      <div className="boname-page__card-list">
                        {selectedEntry.itens.map((item) => (
                          <Panel bordered key={`${item.ite_ent_id}-${item.ent_med_id}-${item.ent_lote}`} className="boname-page__record-card">
                            <div className="boname-page__record-card-top">
                              <div>
                                <strong>{item.med_descr || `Medicamento ${item.ent_med_id}`}</strong>
                                <p>{item.med_descr_coml || 'Detalhe do item'}</p>
                              </div>
                              <span>{formatDateForDisplay(item.ent_lote_validade)}</span>
                            </div>

                            <dl className="boname-page__record-meta">
                              <div>
                                <dt>Quantidade</dt>
                                <dd>{item.ent_qtde}</dd>
                              </div>
                              <div>
                                <dt>Lote</dt>
                                <dd>{item.ent_lote}</dd>
                              </div>
                            </dl>
                          </Panel>
                        ))}
                      </div>
                    ) : (
                      <div className="boname-page__table-wrap">
                        <Table data={selectedEntry.itens} height={detailTableHeight} fillHeight bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                          <Column flexGrow={1} minWidth={220}>
                            <HeaderCell>Medicamento</HeaderCell>
                            <Cell>{(rowData: EntradaDetalheItem) => rowData.med_descr || `Medicamento ${rowData.ent_med_id}`}</Cell>
                          </Column>
                          <Column width={220}>
                            <HeaderCell>Descricao comercial</HeaderCell>
                            <Cell>{(rowData: EntradaDetalheItem) => rowData.med_descr_coml || '-'}</Cell>
                          </Column>
                          <Column width={120} align="center">
                            <HeaderCell>Quantidade</HeaderCell>
                            <Cell dataKey="ent_qtde" />
                          </Column>
                          <Column width={140}>
                            <HeaderCell>Lote</HeaderCell>
                            <Cell dataKey="ent_lote" />
                          </Column>
                          <Column width={130} align="center">
                            <HeaderCell>Validade</HeaderCell>
                            <Cell>{(rowData: EntradaDetalheItem) => formatDateForDisplay(rowData.ent_lote_validade)}</Cell>
                          </Column>
                        </Table>
                      </div>
                    )}
                  </section>
                </div>

                <aside className="entradas-page__draft-summary" aria-label="Resumo da entrada">
                  <h3>Resumo operacional</h3>
                  <dl className="boname-page__record-meta entradas-page__summary-grid">
                    <div>
                      <dt>Total de itens</dt>
                      <dd>{selectedEntry.total_itens}</dd>
                    </div>
                    <div>
                      <dt>Quantidade total</dt>
                      <dd>{selectedEntry.quantidade_total}</dd>
                    </div>
                    <div>
                      <dt>Observacao</dt>
                      <dd>O deposito nao fica persistido neste schema.</dd>
                    </div>
                  </dl>
                </aside>
              </div>
            ) : (
              <div className="entradas-page__workspace">
                <section className="entradas-page__hero" aria-label="Resumo da digitacao">
                  <div className="entradas-page__hero-copy">
                    <span className="entradas-page__hero-kicker">Fluxo operacional</span>
                    <h3>Monte o cabeçalho, componha os itens e acompanhe a grade em tempo real.</h3>
                    <p>
                      O depósito reflete o estoque e os itens adicionados ficam prontos para gravação única em
                      `tb_entradas` + `tb_itens_entradas`.
                    </p>
                  </div>
                  <dl className="entradas-page__hero-metrics boname-page__record-meta">
                    <div>
                      <dt>Itens preparados</dt>
                      <dd>{draftItems.length}</dd>
                    </div>
                    <div>
                      <dt>Quantidade total</dt>
                      <dd>{draftQuantityTotal}</dd>
                    </div>
                    <div>
                      <dt>Depósito</dt>
                      <dd>{selectedDepositoLabel || 'Nao selecionado'}</dd>
                    </div>
                    <div>
                      <dt>Ultimo item</dt>
                      <dd>{latestDraftItem?.medicamentoLabel || 'Aguardando adicao'}</dd>
                    </div>
                  </dl>
                </section>

                <div className="entradas-page__composer-layout">
                  <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Cabecalho da entrada">
                <div className="medicamentos-page__form-section-header">
                  <h3>Cabecalho da entrada</h3>
                  <p>Dados gravados em `tb_entradas` e deposito usado para refletir o saldo em estoque.</p>
                </div>
                <div className="medicamentos-page__form-subgrid">
                  <div className="boname-page__field">
                    <label htmlFor="entrada-id">ID</label>
                    <Input id="entrada-id" size="sm" className="boname-page__control" value={String(headerValues.ent_id)} disabled />
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-data">Data da entrada</label>
                    <DatePicker
                      oneTap
                      editable={false}
                      format="dd/MM/yyyy"
                      block
                      className={headerErrors.ent_date ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={parseDateFromInput(headerValues.ent_date)}
                      onChange={(value) => {
                        setHeaderValues((current) => ({
                          ...current,
                          ent_date: value ? formatDateForInput(value) : '',
                        }))
                      }}
                    />
                    {headerErrors.ent_date ? <span className="boname-page__field-error">{headerErrors.ent_date}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-documento">Documento</label>
                    <Input
                      id="entrada-documento"
                      size="sm"
                      maxLength={MAX_DOC_LENGTH}
                      className={headerErrors.ent_doc ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={headerValues.ent_doc}
                      onChange={(value) => {
                        setHeaderValues((current) => ({
                          ...current,
                          ent_doc: normalizeText(mask.documentNumber(value), MAX_DOC_LENGTH),
                        }))
                      }}
                    />
                    {headerErrors.ent_doc ? <span className="boname-page__field-error">{headerErrors.ent_doc}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-fornecedor">Fornecedor</label>
                    <Input
                      id="entrada-fornecedor"
                      size="sm"
                      maxLength={MAX_FORNECEDOR_LENGTH}
                      className={headerErrors.ent_fornecido_por ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={headerValues.ent_fornecido_por}
                      onChange={(value) => {
                        setHeaderValues((current) => ({
                          ...current,
                          ent_fornecido_por: normalizeText(value, MAX_FORNECEDOR_LENGTH),
                        }))
                      }}
                    />
                    {headerErrors.ent_fornecido_por ? <span className="boname-page__field-error">{headerErrors.ent_fornecido_por}</span> : null}
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="entrada-deposito">Deposito de destino</label>
                    <SelectPicker
                      block
                      data={depositoOptions}
                      cleanable={false}
                      placeholder="Selecione o deposito"
                      className={headerErrors.ent_dep_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={headerValues.ent_dep_id > 0 ? headerValues.ent_dep_id : null}
                      loading={depositosQuery.isPending}
                      onChange={(value) => {
                        setHeaderValues((current) => ({
                          ...current,
                          ent_dep_id: Number(value || 0),
                        }))
                      }}
                    />
                    {headerErrors.ent_dep_id ? <span className="boname-page__field-error">{headerErrors.ent_dep_id}</span> : null}
                  </div>
                </div>
              </section>

              <section className="medicamentos-page__form-section boname-page__field--full entradas-page__composer-card" aria-label="Compositor de item">
                <div className="medicamentos-page__form-section-header">
                  <h3>Adicionar item</h3>
                  <p>Cada item sera persistido em `tb_itens_entradas` e refletido no estoque do deposito escolhido.</p>
                </div>
                <div className="medicamentos-page__form-subgrid">
                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="entrada-medicamento">Medicamento</label>
                    <SelectPicker
                      block
                      data={medicamentoOptions}
                      cleanable={false}
                      placeholder="Selecione o medicamento"
                      className={itemErrors.ent_med_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={itemValues.ent_med_id > 0 ? itemValues.ent_med_id : null}
                      loading={medicamentosQuery.isPending}
                      onChange={(value) => {
                        setItemValues((current) => ({
                          ...current,
                          ent_med_id: Number(value || 0),
                        }))
                      }}
                    />
                    {itemErrors.ent_med_id ? <span className="boname-page__field-error">{itemErrors.ent_med_id}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-lote">Lote</label>
                    <Input
                      id="entrada-lote"
                      size="sm"
                      maxLength={MAX_LOTE_LENGTH}
                      className={itemErrors.ent_lote ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={itemValues.ent_lote}
                      onChange={(value) => {
                        setItemValues((current) => ({
                          ...current,
                          ent_lote: normalizeText(value, MAX_LOTE_LENGTH),
                        }))
                      }}
                    />
                    {itemErrors.ent_lote ? <span className="boname-page__field-error">{itemErrors.ent_lote}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-validade">Validade do lote</label>
                    <DatePicker
                      oneTap
                      editable={false}
                      format="dd/MM/yyyy"
                      block
                      className={itemErrors.ent_lote_validade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={parseDateFromInput(itemValues.ent_lote_validade)}
                      onChange={(value) => {
                        setItemValues((current) => ({
                          ...current,
                          ent_lote_validade: value ? formatDateForInput(value) : '',
                        }))
                      }}
                    />
                    {itemErrors.ent_lote_validade ? <span className="boname-page__field-error">{itemErrors.ent_lote_validade}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="entrada-quantidade">Quantidade</label>
                    <InputNumber
                      id="entrada-quantidade"
                      min={1}
                      size="sm"
                      className={itemErrors.ent_qtde ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={itemValues.ent_qtde}
                      onChange={(value) => {
                        setItemValues((current) => ({
                          ...current,
                          ent_qtde: Number(value || 0),
                        }))
                      }}
                    />
                    {itemErrors.ent_qtde ? <span className="boname-page__field-error">{itemErrors.ent_qtde}</span> : null}
                  </div>
                </div>
                <HStack spacing={10} wrap className="entradas-page__composer-actions">
                  <Button appearance="subtle" onClick={handleResetItemComposer}>
                    Limpar item
                  </Button>
                  <Button
                    appearance="primary"
                    startIcon={<PlusIcon />}
                    disabled={medicamentosQuery.isPending || isFormLoading}
                    onClick={handleAddDraftItem}
                  >
                    Adicionar item a grade
                  </Button>
                </HStack>
              </section>
                </div>
              </div>
            )}
          </PageSection>

          {pageMode === 'create' ? (
        <PageSection
          className="boname-page__table-section entradas-page__draft-section"
          title="Grade de itens da entrada"
          description="A cada adicao, a grade consolida os medicamentos que serao persistidos com o cabecalho."
          actions={
            <HStack spacing={10} wrap className="entradas-page__draft-actions">
              <Button appearance="ghost" color="red" disabled={draftItems.length === 0 || saveMutation.isPending} onClick={handleClearDrafts}>
                Limpar itens
              </Button>
              <Button appearance="primary" color="green" loading={saveMutation.isPending} disabled={isFormLoading} onClick={() => { void handleSaveEntry() }}>
                Salvar entrada
              </Button>
            </HStack>
          }
        >
          <div className="entradas-page__draft-overview">
            <dl className="boname-page__record-meta entradas-page__draft-metrics">
              <div>
                <dt>Itens</dt>
                <dd>{draftItems.length}</dd>
              </div>
              <div>
                <dt>Quantidade total</dt>
                <dd>{draftQuantityTotal}</dd>
              </div>
              <div>
                <dt>Medicamento em foco</dt>
                <dd>{selectedMedicamentoLabel || latestDraftItem?.medicamentoLabel || 'Nao selecionado'}</dd>
              </div>
            </dl>
          </div>
          {draftItems.length === 0 ? (
            <div className="entradas-page__draft-empty" aria-label="Grade de itens vazia">
              <div className="entradas-page__draft-empty-head">
                <span>Medicamento</span>
                <span>Quantidade</span>
                <span>Lote</span>
                <span>Validade</span>
                <span>Acoes</span>
              </div>
              <div className="entradas-page__draft-empty-body">
                <strong>Nenhum item adicionado</strong>
                <p>Use o compositor acima para alimentar a grade antes de salvar a entrada.</p>
              </div>
            </div>
          ) : (
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {draftItems.map((rowData) => (
                    <Panel bordered key={rowData.draftId} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.medicamentoLabel}</strong>
                          <p>{selectedDepositoLabel || 'Deposito nao informado'}</p>
                        </div>
                        <span>{formatDateForDisplay(rowData.ent_lote_validade)}</span>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Quantidade</dt>
                          <dd>{rowData.ent_qtde}</dd>
                        </div>
                        <div>
                          <dt>Lote</dt>
                          <dd>{rowData.ent_lote}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{formatDateForDisplay(rowData.ent_lote_validade)}</dd>
                        </div>
                      </dl>

                      {renderDraftActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table data={draftItems} height={draftTableHeight} fillHeight bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                    <Column flexGrow={1} minWidth={220}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>{(rowData: DraftEntradaItem) => rowData.medicamentoLabel}</Cell>
                    </Column>
                    <Column width={120} align="center">
                      <HeaderCell>Quantidade</HeaderCell>
                      <Cell dataKey="ent_qtde" />
                    </Column>
                    <Column width={140}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell dataKey="ent_lote" />
                    </Column>
                    <Column width={130} align="center">
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: DraftEntradaItem) => formatDateForDisplay(rowData.ent_lote_validade)}</Cell>
                    </Column>
                    <Column width={108} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: DraftEntradaItem) => renderDraftActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>
          )}
        </PageSection>
          ) : null}
        </>
      ) : null}

      <PageSection
        className="boname-page__table-section entradas-page__history-section"
        title={historyOnly ? undefined : 'Historico de entradas'}
        description={historyOnly ? undefined : 'Consulte as entradas já registradas e abra o detalhamento do cabeçalho com seus itens.'}
        actions={
          <div className="boname-page__toolbar entradas-page__history-toolbar">
            <div className="entradas-page__history-toolbar-main">
              <div className="boname-page__field entradas-page__history-search-field">
                <label htmlFor="entradas-history-search">Buscar entradas</label>
                <Input
                  id="entradas-history-search"
                  aria-label="Buscar entrada por documento, fornecedor ou medicamento"
                  className="boname-page__search-input boname-page__control"
                  placeholder="Buscar por documento, fornecedor ou medicamento"
                  value={searchValue}
                  onChange={setSearchValue}
                  onPressEnter={handleSearch}
                />
              </div>
              <div className="boname-page__toolbar-filters entradas-page__history-filters">
                <div className="boname-page__field">
                  <label htmlFor="entradas-history-start-date">Data inicial</label>
                  <DatePicker
                    id="entradas-history-start-date"
                    oneTap
                    editable={false}
                    format="dd/MM/yyyy"
                    className="boname-page__control"
                    placeholder="Selecione a data inicial"
                    value={parseDateFromInput(filterDates.startDate)}
                    onChange={(value) => {
                      setFilterDates((current) => ({
                        ...current,
                        startDate: value ? formatDateForInput(value) : '',
                      }))
                    }}
                  />
                </div>
                <div className="boname-page__field">
                  <label htmlFor="entradas-history-end-date">Data final</label>
                  <DatePicker
                    id="entradas-history-end-date"
                    oneTap
                    editable={false}
                    format="dd/MM/yyyy"
                    className="boname-page__control"
                    placeholder="Selecione a data final"
                    value={parseDateFromInput(filterDates.endDate)}
                    onChange={(value) => {
                      setFilterDates((current) => ({
                        ...current,
                        endDate: value ? formatDateForInput(value) : '',
                      }))
                    }}
                  />
                </div>
              </div>
            </div>
            <HStack spacing={10} wrap className="boname-page__toolbar-actions">
              <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleSearch}>
                Buscar
              </Button>
              <Button
                appearance="ghost"
                startIcon={<ReloadIcon />}
                loading={listQuery.isFetching && !listQuery.isPending}
                onClick={() => {
                  void listQuery.refetch()
                }}
              >
                Atualizar
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando entradas..."
            description="Consultando o endpoint `GET /entradas/listar/:pesq/:data_inicio/:data_fim`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as entradas"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar entradas.'}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasData ? (
          <DataState
            state="empty"
            title="Nenhuma entrada encontrada"
            description="Ajuste os filtros ou registre uma nova movimentacao na secao principal da pagina."
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
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
                        <span>{formatDateForDisplay(rowData.data)}</span>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.id}</dd>
                        </div>
                        <div>
                          <dt>Documento</dt>
                          <dd>{mask.documentNumber(rowData.documento)}</dd>
                        </div>
                        <div>
                          <dt>Fornecedor</dt>
                          <dd>{rowData.fornecedor}</dd>
                        </div>
                      </dl>

                      {renderHistoryActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table data={paginatedRecords} height={tableHeight} fillHeight virtualized bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                    <Column width={64} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="id" />
                    </Column>

                    <Column width={118} align="center">
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: EntradaListItem) => formatDateForDisplay(rowData.data)}</Cell>
                    </Column>

                    <Column width={160}>
                      <HeaderCell>Documento</HeaderCell>
                      <Cell>{(rowData: EntradaListItem) => mask.documentNumber(rowData.documento)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={220}>
                      <HeaderCell>Fornecedor</HeaderCell>
                      <Cell dataKey="fornecedor" />
                    </Column>

                    <Column width={170} align="center">
                      <HeaderCell>Dt Aprovacao</HeaderCell>
                      <Cell>{(rowData: EntradaListItem) => formatDateTimeForDisplay(rowData.dt_aprovacao)}</Cell>
                    </Column>

                    <Column width={150}>
                      <HeaderCell>User Aprovacao</HeaderCell>
                      <Cell>{(rowData: EntradaListItem) => rowData.user_aprovacao || '-'}</Cell>
                    </Column>

                    <Column width={108} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: EntradaListItem) => renderHistoryActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de{' '}
                <strong>{records.length}</strong> registros.
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

      {historyOnly ? (
        <AppModal
          open={historyDetailsModalOpen}
          backdrop="static"
          intent="view"
          intentVisible={false}
          className="boname-page__record-modal entradas-page__record-modal entradas-page__history-record-modal"
          title={selectedEntry ? `Itens da entrada ${mask.documentNumber(selectedEntry.ent_doc)}` : 'Itens da entrada'}
          subtitle={selectedEntry ? 'Visualizacao dos itens e dados principais da entrada selecionada.' : 'Consulta dos itens vinculados a entrada selecionada.'}
          loading={historyDetailsModalOpen && isFormLoading}
          onClose={handleCloseHistoryDetails}
          size={isCompactLayout ? 'full' : 'lg'}
          footer={(
            <Button appearance="primary" onClick={handleCloseHistoryDetails}>
              Fechar
            </Button>
          )}
        >
          {selectedEntry && !isFormLoading ? (
            <div className="boname-page__modal-shell">
              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Itens da entrada">
                <div className="medicamentos-page__form-section-header">
                  <h3>Itens da entrada</h3>
                  <p>Visualizacao detalhada dos itens vinculados ao registro.</p>
                </div>

                {selectedEntry.itens.length === 0 ? (
                  <DataState
                    state="empty"
                    title="Nenhum item registrado"
                    description="A entrada selecionada nao retornou itens vinculados."
                  />
                ) : isCompactLayout ? (
                  <div className="boname-page__card-list">
                    {selectedEntry.itens.map((item) => (
                      <Panel bordered key={`${item.ite_ent_id}-${item.ent_med_id}-${item.ent_lote}`} className="boname-page__record-card">
                        <div className="boname-page__record-card-top">
                          <div>
                            <strong>{item.med_descr || `Medicamento ${item.ent_med_id}`}</strong>
                            <p>{item.med_descr_coml || 'Detalhe do item'}</p>
                          </div>
                          <span>{formatDateForDisplay(item.ent_lote_validade)}</span>
                        </div>

                        <dl className="boname-page__record-meta">
                          <div>
                            <dt>Quantidade</dt>
                            <dd>{item.ent_qtde}</dd>
                          </div>
                          <div>
                            <dt>Lote</dt>
                            <dd>{item.ent_lote}</dd>
                          </div>
                        </dl>
                      </Panel>
                    ))}
                  </div>
                ) : (
                  <div className="boname-page__table-wrap">
                    <Table data={selectedEntry.itens} height={detailTableHeight} fillHeight bordered wordWrap rowHeight={54} headerHeight={52} autoHeight={false}>
                      <Column flexGrow={1} minWidth={220}>
                        <HeaderCell>Medicamento</HeaderCell>
                        <Cell>{(rowData: EntradaDetalheItem) => rowData.med_descr || `Medicamento ${rowData.ent_med_id}`}</Cell>
                      </Column>
                      <Column width={220}>
                        <HeaderCell>Descricao comercial</HeaderCell>
                        <Cell>{(rowData: EntradaDetalheItem) => rowData.med_descr_coml || '-'}</Cell>
                      </Column>
                      <Column width={120} align="center">
                        <HeaderCell>Quantidade</HeaderCell>
                        <Cell dataKey="ent_qtde" />
                      </Column>
                      <Column width={140}>
                        <HeaderCell>Lote</HeaderCell>
                        <Cell dataKey="ent_lote" />
                      </Column>
                      <Column width={130} align="center">
                        <HeaderCell>Validade</HeaderCell>
                        <Cell>{(rowData: EntradaDetalheItem) => formatDateForDisplay(rowData.ent_lote_validade)}</Cell>
                      </Column>
                    </Table>
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </AppModal>
      ) : null}
    </section>
  )
}

export default EntradasCrudPage
