import { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import CheckIcon from '@rsuite/icons/Check'
import LockIcon from '@rsuite/icons/Lock'
import PlusIcon from '@rsuite/icons/Plus'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, DatePicker, HStack, IconButton, Input, InputGroup, InputNumber, Pagination, Panel, SelectPicker, Tooltip, Whisper, useMediaQuery } from 'rsuite'
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
  inv_med_tipo_codigo?: string | null
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

interface MedicamentoAtivoRecord {
  med_descr: string | null
  med_descr_coml: string | null
  med_id: number
  med_tipo_codigo: string | null
  med_und: string | null
}

interface NovoItemFormValues {
  medDescr: string
  medDescrComl: string
  medDtValidade: Date | null
  medId: number | null
  medLote: string
  medQtd: number | null
  medUnd: string
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
type NovoItemFormErrors = Partial<Record<'medDtValidade' | 'medId' | 'medLote' | 'medQtd', string>>

export interface ListarInventariosPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 10

function getEmptyNovoItemFormValues(): NovoItemFormValues {
  return {
    medDescr: '',
    medDescrComl: '',
    medDtValidade: null,
    medId: null,
    medLote: '',
    medQtd: null,
    medUnd: '',
  }
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

function formatDateForPayload(value: Date | null): string {
  if (!value) {
    return ''
  }

  return `${formatDateForInput(value)}T00:00:00`
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

function isInventarioAberto(value: number | string | null): boolean {
  return Number(value) === 0
}

function isInventarioFechado(value: number | string | null): boolean {
  return Number(value) === 1
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

async function listarMedicamentosAtivosInventario(
  baseUrl: string,
  searchText: string,
  medTipoCodigo: string,
  authToken?: string | null,
): Promise<MedicamentoAtivoRecord[]> {
  const pesq = searchText.trim() || '*'

  return requestInventarios<MedicamentoAtivoRecord[]>(
    baseUrl,
    `/parametros/medicamentos/listar/ativos/${encodeURIComponent(pesq)}/${encodeURIComponent(medTipoCodigo)}`,
    { method: 'GET' },
    authToken,
  )
}

async function adicionarItemInventario(
  baseUrl: string,
  invNum: string,
  values: NovoItemFormValues,
  authToken?: string | null,
): Promise<InventarioItemRecord> {
  return requestInventarios<InventarioItemRecord>(
    baseUrl,
    `/inventarios/adicionar-item/${encodeURIComponent(invNum)}`,
    {
      method: 'POST',
      body: JSON.stringify({
        med_dt_validade: formatDateForPayload(values.medDtValidade),
        med_id: values.medId ?? 0,
        med_lote: values.medLote.trim(),
        med_qtd: Number(values.medQtd ?? 0),
      }),
    },
    authToken,
  )
}

async function excluirItemInventario(
  baseUrl: string,
  invNum: string,
  itemId: number,
  authToken?: string | null,
): Promise<void> {
  await requestInventarios(
    baseUrl,
    `/inventarios/excluir-item/${encodeURIComponent(invNum)}/${itemId}`,
    { method: 'DELETE' },
    authToken,
  )
}

async function fecharInventario(
  baseUrl: string,
  invNum: string,
  authToken?: string | null,
): Promise<void> {
  await requestInventarios(
    baseUrl,
    `/inventario/fechar/${encodeURIComponent(invNum)}`,
    { method: 'PATCH' },
    authToken,
  )
}

function validateNovoItemForm(values: NovoItemFormValues): NovoItemFormErrors {
  const errors: NovoItemFormErrors = {}

  if (!values.medId) {
    errors.medId = 'Pesquise e selecione o medicamento.'
  }

  if (!values.medLote.trim()) {
    errors.medLote = 'Informe o lote.'
  }

  if (!values.medDtValidade) {
    errors.medDtValidade = 'Informe a data de validade.'
  }

  if (values.medQtd === null || values.medQtd < 0) {
    errors.medQtd = 'Informe a quantidade.'
  }

  return errors
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
  const [novoItemModalOpen, setNovoItemModalOpen] = useState(false)
  const [medicamentoSearchModalOpen, setMedicamentoSearchModalOpen] = useState(false)
  const [medicamentoSearchText, setMedicamentoSearchText] = useState('')
  const [submittedMedicamentoSearchText, setSubmittedMedicamentoSearchText] = useState('*')
  const [novoItemFormValues, setNovoItemFormValues] = useState<NovoItemFormValues>(getEmptyNovoItemFormValues)
  const [novoItemFormErrors, setNovoItemFormErrors] = useState<NovoItemFormErrors>({})
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

  const detalhe = detalheQuery.data
  const medTipoCodigo = detalhe?.inventario.inv_med_tipo_codigo?.trim() ?? ''
  const isDigitacaoInventarioFechado = isInventarioFechado(detalhe?.inventario.inv_status ?? selectedInventario?.inv_status ?? null)
  const digitacaoDepositoDescricao = detalhe?.inventario.dep_descr || selectedInventario?.dep_descr || '-'

  const medicamentosAtivosQuery = useQuery({
    queryKey: [
      'listar-inventarios-medicamentos-ativos',
      apiBaseUrl,
      submittedMedicamentoSearchText,
      medTipoCodigo,
      resolvedAuthToken,
    ],
    queryFn: () => listarMedicamentosAtivosInventario(
      apiBaseUrl,
      submittedMedicamentoSearchText,
      medTipoCodigo,
      resolvedAuthToken,
    ),
    enabled: medicamentoSearchModalOpen && Boolean(medTipoCodigo),
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

  const addNovoItemMutation = useMutation({
    mutationFn: async () => {
      const invNum = detalhe?.inventario.inv_num?.trim()

      if (!invNum) {
        throw new Error('Numero do inventario nao informado.')
      }

      return adicionarItemInventario(
        apiBaseUrl,
        invNum,
        novoItemFormValues,
        resolvedAuthToken,
      )
    },
    onSuccess: async () => {
      setNovoItemModalOpen(false)
      setMedicamentoSearchModalOpen(false)
      setMedicamentoSearchText('')
      setSubmittedMedicamentoSearchText('*')
      setNovoItemFormValues(getEmptyNovoItemFormValues())
      setNovoItemFormErrors({})
      await detalheQuery.refetch()
      await message.success('Item adicionado', 'O item foi adicionado ao inventario.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel adicionar o item', getErrorMessage(error))
    },
  })

  const deleteInventarioItemMutation = useMutation({
    mutationFn: async (item: InventarioItemRecord) => {
      const invNum = detalhe?.inventario.inv_num?.trim()

      if (!invNum) {
        throw new Error('Numero do inventario nao informado.')
      }

      await excluirItemInventario(
        apiBaseUrl,
        invNum,
        item.iti_id,
        resolvedAuthToken,
      )

      return item
    },
    onSuccess: async (item) => {
      setDigitacaoValues((current) => {
        const nextValues = { ...current }
        delete nextValues[item.iti_id]
        return nextValues
      })
      await detalheQuery.refetch()
      await message.success('Item excluido', 'O item foi excluido do inventario.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel excluir o item', getErrorMessage(error))
    },
  })

  const closeInventarioMutation = useMutation({
    mutationFn: async (inventario: InventarioRecord) => {
      const invNum = inventario.inv_num?.trim()

      if (!invNum) {
        throw new Error('Numero do inventario nao informado.')
      }

      await fecharInventario(apiBaseUrl, invNum, resolvedAuthToken)

      return inventario
    },
    onSuccess: async (inventario) => {
      await listQuery.refetch()
      await message.success('Inventario fechado', `Inventario ${maskInventarioNumero(inventario.inv_num)} fechado com sucesso.`)
    },
    onError: async (error) => {
      await message.error('Nao foi possivel fechar o inventario', getErrorMessage(error))
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
  const detalheItens = detalhe?.itens ?? []
  const hasDetalheItens = detalheItens.length > 0
  const medicamentosAtivos = medicamentosAtivosQuery.data ?? []
  const hasMedicamentosAtivos = medicamentosAtivos.length > 0

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
    setNovoItemModalOpen(false)
    setMedicamentoSearchModalOpen(false)
    setMedicamentoSearchText('')
    setSubmittedMedicamentoSearchText('*')
    setNovoItemFormValues(getEmptyNovoItemFormValues())
    setNovoItemFormErrors({})
  }

  const handleOpenNovoItem = () => {
    if (isDigitacaoInventarioFechado) {
      void message.warning('Inventario fechado', 'Nao e possivel adicionar itens em inventario fechado.')
      return
    }

    setMedicamentoSearchModalOpen(false)
    setMedicamentoSearchText('')
    setSubmittedMedicamentoSearchText('*')
    setNovoItemFormValues(getEmptyNovoItemFormValues())
    setNovoItemFormErrors({})
    setNovoItemModalOpen(true)
  }

  const handleCloseNovoItem = () => {
    setNovoItemModalOpen(false)
    setMedicamentoSearchModalOpen(false)
    setMedicamentoSearchText('')
    setSubmittedMedicamentoSearchText('*')
    setNovoItemFormValues(getEmptyNovoItemFormValues())
    setNovoItemFormErrors({})
  }

  const handleOpenMedicamentoSearch = () => {
    setMedicamentoSearchText('')
    setSubmittedMedicamentoSearchText('*')
    setMedicamentoSearchModalOpen(true)
  }

  const handleSubmitMedicamentoSearch = () => {
    setSubmittedMedicamentoSearchText(medicamentoSearchText.trim() || '*')
  }

  const handleSelectMedicamento = (medicamento: MedicamentoAtivoRecord) => {
    setNovoItemFormValues((current) => ({
      ...current,
      medDescr: medicamento.med_descr ?? '',
      medDescrComl: medicamento.med_descr_coml ?? '',
      medId: Number(medicamento.med_id),
      medUnd: medicamento.med_und ?? '',
    }))
    setNovoItemFormErrors((current) => ({ ...current, medId: undefined }))
    setMedicamentoSearchModalOpen(false)
  }

  const handleAddNovoItem = async () => {
    const errors = validateNovoItemForm(novoItemFormValues)
    setNovoItemFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      await message.warning('Revise o item', 'Preencha os dados obrigatorios do item.')
      return
    }

    addNovoItemMutation.mutate()
  }

  const handleRequestDeleteInventarioItem = async (item: InventarioItemRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o item do inventario de forma permanente.',
      highlightedDescription: `${item.iti_med_id ?? item.iti_id} - ${item.med_descr || item.iti_lote || 'Item do inventario'}`,
      onConfirm: async () => {
        await deleteInventarioItemMutation.mutateAsync(item)
      },
      subtitle: 'A acao abaixo afeta diretamente o inventario em digitacao.',
      title: 'Confirmar exclusao',
    })
  }

  const handleRequestCloseInventario = async (inventario: InventarioRecord) => {
    if (!isInventarioAberto(inventario.inv_status)) {
      await message.warning('Inventario fechado', 'Este inventario ja esta fechado.')
      return
    }

    const confirmed = await message.confirmAction({
      confirmText: 'Fechar inventario',
      description: 'Esta acao fecha o inventario e atualiza o estoque conforme as quantidades inventariadas.',
      highlightedDescription: maskInventarioNumero(inventario.inv_num),
      highlightedLabel: 'Inventario',
      intentLabel: 'Fechamento',
      onConfirm: async () => undefined,
      subtitle: 'Confirme somente apos concluir a digitacao.',
      title: 'Confirmar fechamento',
    })

    if (!confirmed) {
      return
    }

    await closeInventarioMutation.mutateAsync(inventario)
  }

  const renderRowActions = (rowData: InventarioRecord, compact = false) => {
    const isClosingCurrentRow = closeInventarioMutation.isPending && closeInventarioMutation.variables?.inv_id === rowData.inv_id
    const isOpen = isInventarioAberto(rowData.inv_status)
    const closeLabel = isOpen ? 'Fechar inventario' : 'Inventario ja fechado'

    return (
      <HStack
        spacing={8}
        wrap={compact}
        className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
      >
        {compact ? (
          <Button
            appearance="primary"
            startIcon={<VisibleIcon />}
            disabled={isClosingCurrentRow}
            onClick={() => handleOpenDigitacao(rowData)}
          >
            Digitar
          </Button>
        ) : (
          <Whisper
            placement="top"
            trigger={['hover', 'focus']}
            controlId={`inventario-digitacao-${rowData.inv_id}`}
            speaker={<Tooltip>Digitar inventario</Tooltip>}
          >
            <IconButton
              aria-label="Digitar inventario"
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--view"
              icon={<VisibleIcon />}
              disabled={isClosingCurrentRow}
              onClick={() => handleOpenDigitacao(rowData)}
            />
          </Whisper>
        )}

        {compact ? (
          <Button
            appearance="subtle"
            color="green"
            size="xs"
            startIcon={<LockIcon />}
            disabled={!isOpen || closeInventarioMutation.isPending}
            loading={isClosingCurrentRow}
            onClick={() => { void handleRequestCloseInventario(rowData) }}
          >
            Fechar
          </Button>
        ) : (
          <Whisper
            placement="top"
            trigger={['hover', 'focus']}
            controlId={`inventario-close-${rowData.inv_id}`}
            speaker={<Tooltip>{closeLabel}</Tooltip>}
          >
            <IconButton
              aria-label="Fechar inventario"
              appearance="subtle"
              color="green"
              size="xs"
              circle
              className="boname-page__action-icon listar-inventarios-page__action-icon--close"
              icon={<LockIcon />}
              disabled={!isOpen || closeInventarioMutation.isPending}
              loading={isClosingCurrentRow}
              onClick={() => { void handleRequestCloseInventario(rowData) }}
            />
          </Whisper>
        )}
      </HStack>
    )
  }

  const handleSaveDigitacao = () => {
    const invNum = detalhe?.inventario.inv_num?.trim()

    if (isDigitacaoInventarioFechado) {
      void message.warning('Inventario fechado', 'Nao e possivel salvar digitacao de inventario fechado.')
      return
    }

    if (!invNum || detalheItens.length === 0) {
      void message.warning('Digitacao indisponivel', 'Nenhum item do inventario esta disponivel para salvar.')
      return
    }

    if (detalheItens.some((item) => !item.iti_med_id)) {
      void message.error('Nao foi possivel salvar a digitacao', 'Ha item sem medicamento informado.')
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

                    <Column width={128} align="center" fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell style={{ padding: 0 }}>
                        {(rowData: InventarioRecord) => renderRowActions(rowData)}
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
        footer={!isDigitacaoInventarioFechado ? (
          <HStack spacing={10} justifyContent="flex-end">
            <Button
              appearance="ghost"
              disabled={detalheQuery.isPending || detalheQuery.isError || !medTipoCodigo}
              startIcon={<PlusIcon />}
              onClick={handleOpenNovoItem}
            >
              Novo Item
            </Button>
            <Button
              appearance="primary"
              disabled={!hasDetalheItens || detalheQuery.isPending || saveDigitacaoMutation.isPending}
              loading={saveDigitacaoMutation.isPending}
              onClick={handleSaveDigitacao}
            >
              Salvar Digitacao
            </Button>
          </HStack>
        ) : null}
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
                <dd>{digitacaoDepositoDescricao}</dd>
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
                          disabled={isDigitacaoInventarioFechado}
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

                  <Column width={88} align="center" fixed="right" verticalAlign="middle">
                    <HeaderCell>Acao</HeaderCell>
                    <Cell style={{ padding: 0 }}>
                      {(rowData: InventarioItemRecord) => (
                        <Whisper
                          placement="top"
                          trigger={['hover', 'focus']}
                          controlId={`inventario-item-delete-${rowData.iti_id}`}
                          speaker={<Tooltip>Excluir</Tooltip>}
                        >
                          <IconButton
                            appearance="subtle"
                            color="red"
                            size="xs"
                            aria-label="Excluir item"
                            circle
                            className="boname-page__action-icon boname-page__action-icon--delete"
                            disabled={isDigitacaoInventarioFechado || deleteInventarioItemMutation.isPending || saveDigitacaoMutation.isPending}
                            icon={<TrashIcon />}
                            onClick={() => { void handleRequestDeleteInventarioItem(rowData) }}
                          />
                        </Whisper>
                      )}
                    </Cell>
                  </Column>
                </Table>
              </div>
            )}
          </div>
        ) : null}
      </AppModal>

      <AppModal
        className="boname-page__record-modal listar-inventarios-page__novo-item-modal"
        intent="create"
        open={novoItemModalOpen}
        overflow
        size="lg"
        title="Novo Item"
        intentVisible={false}
        onClose={handleCloseNovoItem}
        footer={
          <HStack spacing={10} justifyContent="flex-end">
            <Button
              appearance="subtle"
              disabled={addNovoItemMutation.isPending}
              onClick={handleCloseNovoItem}
            >
              Fechar
            </Button>
            <Button
              appearance="primary"
              disabled={addNovoItemMutation.isPending}
              loading={addNovoItemMutation.isPending}
              onClick={() => void handleAddNovoItem()}
            >
              Adicionar
            </Button>
          </HStack>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulario do item do inventario">
            <div className="boname-page__form-grid medicamentos-page__form-grid">
              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Medicamento do item">
                <div className="medicamentos-page__form-section-header">
                  <h3>Medicamento</h3>
                </div>
                <div className="medicamentos-page__form-subgrid">
                  <div className="boname-page__field">
                    <label htmlFor="listar-inventarios-novo-item-med-id">ID</label>
                    <InputGroup inside size="sm" className={novoItemFormErrors.medId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}>
                      <Input
                        id="listar-inventarios-novo-item-med-id"
                        disabled
                        value={novoItemFormValues.medId ? String(novoItemFormValues.medId) : ''}
                      />
                      <InputGroup.Button
                        aria-label="Pesquisar medicamento"
                        disabled={!medTipoCodigo}
                        onClick={handleOpenMedicamentoSearch}
                      >
                        <SearchIcon />
                      </InputGroup.Button>
                    </InputGroup>
                    {novoItemFormErrors.medId ? <span role="alert">{novoItemFormErrors.medId}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="listar-inventarios-novo-item-med-und">Unidade</label>
                    <Input
                      id="listar-inventarios-novo-item-med-und"
                      size="sm"
                      className="boname-page__control"
                      disabled
                      value={novoItemFormValues.medUnd}
                    />
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="listar-inventarios-novo-item-med-descr">Descricao</label>
                    <Input
                      id="listar-inventarios-novo-item-med-descr"
                      size="sm"
                      className="boname-page__control"
                      disabled
                      value={novoItemFormValues.medDescr}
                    />
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="listar-inventarios-novo-item-med-descr-coml">Descr Coml</label>
                    <Input
                      id="listar-inventarios-novo-item-med-descr-coml"
                      size="sm"
                      className="boname-page__control"
                      disabled
                      value={novoItemFormValues.medDescrComl}
                    />
                  </div>
                </div>
              </section>

              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Dados do item">
                <div className="medicamentos-page__form-section-header">
                  <h3>Dados do item</h3>
                </div>
                <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--metrics listar-inventarios-page__novo-item-metrics">
                  <div className="boname-page__field">
                    <label htmlFor="listar-inventarios-novo-item-med-lote">Lote</label>
                    <Input
                      id="listar-inventarios-novo-item-med-lote"
                      size="sm"
                      className={novoItemFormErrors.medLote ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={novoItemFormValues.medLote}
                      onChange={(value) => {
                        setNovoItemFormValues((current) => ({ ...current, medLote: value }))
                        setNovoItemFormErrors((current) => ({ ...current, medLote: undefined }))
                      }}
                    />
                    {novoItemFormErrors.medLote ? <span role="alert">{novoItemFormErrors.medLote}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label id="listar-inventarios-novo-item-med-validade-label">Data de Validade</label>
                    <DatePicker
                      aria-labelledby="listar-inventarios-novo-item-med-validade-label"
                      size="sm"
                      className={novoItemFormErrors.medDtValidade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      format="dd/MM/yyyy"
                      oneTap
                      value={novoItemFormValues.medDtValidade}
                      onChange={(value) => {
                        setNovoItemFormValues((current) => ({ ...current, medDtValidade: value }))
                        setNovoItemFormErrors((current) => ({ ...current, medDtValidade: undefined }))
                      }}
                    />
                    {novoItemFormErrors.medDtValidade ? <span role="alert">{novoItemFormErrors.medDtValidade}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="listar-inventarios-novo-item-med-qtd">Quantidade</label>
                    <InputNumber
                      id="listar-inventarios-novo-item-med-qtd"
                      size="sm"
                      className={novoItemFormErrors.medQtd ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      controls={false}
                      min={0}
                      value={novoItemFormValues.medQtd}
                      onChange={(value) => {
                        setNovoItemFormValues((current) => ({
                          ...current,
                          medQtd: value === null || value === undefined ? null : Number(value),
                        }))
                        setNovoItemFormErrors((current) => ({ ...current, medQtd: undefined }))
                      }}
                    />
                    {novoItemFormErrors.medQtd ? <span role="alert">{novoItemFormErrors.medQtd}</span> : null}
                  </div>
                </div>
              </section>
            </div>
          </section>

          {!medTipoCodigo ? (
            <DataState
              state="empty"
              title="Tipo de medicamento indisponivel"
              description="Nao foi possivel identificar o tipo do inventario selecionado."
            />
          ) : null}
        </div>
      </AppModal>

      <AppModal
        className="boname-page__record-modal listar-inventarios-page__pesquisa-medicamento-modal"
        intent="view"
        open={medicamentoSearchModalOpen}
        overflow
        size="lg"
        title="Pesquisar medicamentos"
        intentVisible={false}
        onClose={() => setMedicamentoSearchModalOpen(false)}
        footer={
          <Button appearance="subtle" onClick={() => setMedicamentoSearchModalOpen(false)}>
            Fechar
          </Button>
        }
      >
        <div className="listar-inventarios-page__pesquisa-medicamento-content">
          <div className="boname-page__field listar-inventarios-page__novo-item-search">
            <label htmlFor="listar-inventarios-pesquisa-medicamento">Pesquisar medicamento</label>
            <InputGroup inside className="boname-page__control">
              <Input
                id="listar-inventarios-pesquisa-medicamento"
                value={medicamentoSearchText}
                onChange={setMedicamentoSearchText}
                onPressEnter={handleSubmitMedicamentoSearch}
              />
              <InputGroup.Button aria-label="Pesquisar medicamento" onClick={handleSubmitMedicamentoSearch}>
                <SearchIcon />
              </InputGroup.Button>
            </InputGroup>
          </div>

          {medTipoCodigo && medicamentosAtivosQuery.isPending ? (
            <DataState
              state="loading"
              title="Carregando medicamentos..."
              description="Buscando medicamentos ativos para o tipo do inventario."
            />
          ) : null}

          {medTipoCodigo && medicamentosAtivosQuery.isError ? (
            <DataState
              state="error"
              title="Nao foi possivel listar os medicamentos"
              description={getErrorMessage(medicamentosAtivosQuery.error, 'Erro ao listar medicamentos ativos.')}
              action={
                <Button appearance="primary" onClick={() => void medicamentosAtivosQuery.refetch()}>
                  Tentar novamente
                </Button>
              }
            />
          ) : null}

          {medTipoCodigo && !medicamentosAtivosQuery.isPending && !medicamentosAtivosQuery.isError && !hasMedicamentosAtivos ? (
            <DataState
              state="empty"
              title="Nenhum medicamento encontrado"
              description="Nao ha medicamentos ativos disponiveis para adicionar."
            />
          ) : null}

          {medTipoCodigo && !medicamentosAtivosQuery.isPending && !medicamentosAtivosQuery.isError && hasMedicamentosAtivos ? (
            <div className="boname-page__table-wrap listar-inventarios-page__novo-item-table">
              <Table
                autoHeight={false}
                bordered
                data={medicamentosAtivos}
                height={360}
                headerHeight={52}
                rowHeight={56}
                virtualized
              >
                <Column width={76} align="center" fixed>
                  <HeaderCell>ID</HeaderCell>
                  <Cell dataKey="med_id" />
                </Column>

                <Column flexGrow={1.2} minWidth={220}>
                  <HeaderCell>Descricao</HeaderCell>
                  <Cell>{(rowData: MedicamentoAtivoRecord) => rowData.med_descr || '-'}</Cell>
                </Column>

                <Column flexGrow={1.1} minWidth={220}>
                  <HeaderCell>Descr Coml</HeaderCell>
                  <Cell>{(rowData: MedicamentoAtivoRecord) => rowData.med_descr_coml || '-'}</Cell>
                </Column>

                <Column width={110} align="center">
                  <HeaderCell>Unidade</HeaderCell>
                  <Cell>{(rowData: MedicamentoAtivoRecord) => rowData.med_und || '-'}</Cell>
                </Column>

                <Column width={88} align="center" fixed="right">
                  <HeaderCell>Acoes</HeaderCell>
                  <Cell style={{ padding: 0 }}>
                    {(rowData: MedicamentoAtivoRecord) => (
                      <Whisper
                        placement="top"
                        trigger={['hover', 'focus']}
                        controlId={`inventario-medicamento-select-${rowData.med_id}`}
                        speaker={<Tooltip>Selecionar</Tooltip>}
                      >
                        <IconButton
                          appearance="subtle"
                          size="xs"
                          aria-label="Selecionar medicamento"
                          circle
                          className="boname-page__action-icon boname-page__action-icon--view"
                          icon={<CheckIcon />}
                          onClick={() => handleSelectMedicamento(rowData)}
                        />
                      </Whisper>
                    )}
                  </Cell>
                </Column>
              </Table>
            </div>
          ) : null}
        </div>
      </AppModal>
    </section>
  )
}

export default ListarInventariosPage
