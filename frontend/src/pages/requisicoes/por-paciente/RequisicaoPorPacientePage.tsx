import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import CheckIcon from '@rsuite/icons/Check'
import CloseIcon from '@rsuite/icons/Close'
import PlusIcon from '@rsuite/icons/Plus'
import PrintIcon from '@rsuite/icons/legacy/Print'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import TrashIcon from '@rsuite/icons/Trash'
import { Button, Checkbox, DatePicker, HStack, IconButton, Input, InputNumber, Pagination, SelectPicker, Tabs, Textarea, Tooltip, Whisper, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, ReferenceNotification, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { maskDate, useMask } from '../../../hooks/useMask'
import { getApiBaseUrl } from '../../../lib/api-base-url'
import '../../boname/BonameCrudPage.css'

type ApiResponse<T> = {
  data: T
  err: number
  msg: string
  status: number
}

type SelectOption<TValue extends number | string = number> = {
  label: string
  value: TValue
}

type HeaderForm = {
  pacienteId: number | null
  pacienteNome: string
  tipoRequisicaoId: number
  localId: number | null
  depositoId: number | null
  data: string
  observacao: string
}

type HeaderErrors = Partial<Record<keyof HeaderForm, string>>

type PacienteRecord = {
  cpf?: string | null
  dt_nascimento?: string | null
  nom_paciente?: string | null
  nom_social?: string | null
  num_paciente: number
}

type LocalRecord = {
  local_descr: string | null
  local_id: number
}

type DepositoRecord = {
  dep_descr: string
  dep_id: number
}

type TipoMedicamentoRecord = {
  tipo_ativo: 0 | 1
  tipo_codigo: string
  tipo_descr: string
  tipo_id: number
}

type EstoqueMedicamentoRecord = {
  alerta_validade: number | null
  descricao: string | null
  descricao_comercial: string | null
  id: number
  lote: string | null
  med_id?: number | null
  medicamento_id?: number | null
  saldo_disponivel: number
  unidade: string | null
  validade: Date | string | null
}

const EMPTY_ESTOQUE_MEDICAMENTOS: EstoqueMedicamentoRecord[] = []

type RequisicaoItem = {
  draftId: string
  medicamentoId: number
  descricao: string
  lote: string
  quantidade: number
  validade: Date | string | null
}

type RequisicaoItemsTabKey = 'itens' | 'observacao'

type SalvarRequisicaoResponse = {
  req_id?: number | null
  req_num?: string | null
}

const API_BASE_URL = getApiBaseUrl()
const PAGE_SIZE = 10
const MAX_OBSERVACAO_LENGTH = 500
const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const TIPO_REQUISICAO_OPTIONS: SelectOption<number>[] = [{ label: 'Dispensacao', value: 1 }]

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
      || ''
    ).trim()
  } catch {
    return ''
  }
}

function buildUrl(path: string): string {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateForApi(value: string): string {
  return value ? `${value}T00:00:00` : ''
}

function formatDateValueForApi(value: Date | string | null): string | null {
  if (!value) {
    return null
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return `${formatDateForInput(parsedDate)}T00:00:00`
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
    return { label: maskDate(parsedDate), tone: 'danger' }
  }

  if (normalizedAlertDays > 0 && diffInDays <= normalizedAlertDays) {
    return { label: maskDate(parsedDate), tone: 'warning' }
  }

  return { label: maskDate(parsedDate), tone: 'success' }
}

function renderValidityBadge(value: Date | string | null, alertDays: number | null) {
  const validityBadge = resolveValidityBadge(value, alertDays)

  return <StatusBadge tone={validityBadge.tone}>{validityBadge.label}</StatusBadge>
}

async function requestRequisicao<T>(path: string, init: RequestInit, authToken?: string | null): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // Respostas sem JSON sao tratadas abaixo.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function requestRequisicaoBlob(path: string, authToken?: string | null): Promise<Blob> {
  const headers = new Headers()

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(path), {
    headers,
    method: 'GET',
  })

  if (!response.ok) {
    let errorMessage = `Falha ao processar requisicao (${response.status}).`

    try {
      const payload = (await response.json()) as Partial<ApiResponse<unknown>>
      errorMessage = payload.msg || errorMessage
    } catch {
      // Respostas PDF ou vazias nao possuem JSON de erro.
    }

    throw new Error(errorMessage)
  }

  return response.blob()
}

function validateHeaderForm(values: HeaderForm): HeaderErrors {
  const errors: HeaderErrors = {}

  if (!values.pacienteId || values.pacienteId <= 0) {
    errors.pacienteId = 'Selecione o paciente.'
  }

  if (!values.pacienteNome.trim()) {
    errors.pacienteNome = 'Informe um paciente valido.'
  }

  if (!values.localId || values.localId <= 0) {
    errors.localId = 'Selecione o local.'
  }

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito.'
  }

  return errors
}

function getItemDraftId(record: EstoqueMedicamentoRecord): string {
  return `${record.id}-${record.lote || 'sem-lote'}`
}

function getMedicamentoId(record: EstoqueMedicamentoRecord): number {
  return Number(record.med_id ?? record.medicamento_id ?? 0)
}

function toOptions<TRecord, TValue extends number | string>(
  records: TRecord[],
  getValue: (record: TRecord) => TValue,
  getLabel: (record: TRecord) => string,
): SelectOption<TValue>[] {
  return records
    .map((record) => ({
      label: getLabel(record),
      value: getValue(record),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))
}

function normalizeText(value: string, maxLength: number): string {
  return value.slice(0, maxLength)
}

async function listarPacientes(pesquisa: string, authToken?: string | null): Promise<PacienteRecord[]> {
  return requestRequisicao<PacienteRecord[]>(
    `/pacientes/listar_pacientes/${encodeURIComponent(pesquisa.trim() || '*')}`,
    { method: 'GET' },
    authToken,
  )
}

async function listarLocais(pesquisa: string, authToken?: string | null): Promise<LocalRecord[]> {
  return requestRequisicao<LocalRecord[]>(
    `/parametros/locais/listar_ativos/${encodeURIComponent(pesquisa.trim() || '*')}`,
    { method: 'GET' },
    authToken,
  )
}

async function listarDepositos(authToken?: string | null): Promise<DepositoRecord[]> {
  return requestRequisicao<DepositoRecord[]>('/parametros/depositos/listar-ativos/*', { method: 'GET' }, authToken)
}

async function listarTiposMedicamentos(authToken?: string | null): Promise<TipoMedicamentoRecord[]> {
  return requestRequisicao<TipoMedicamentoRecord[]>('/parametros/tipos_medicamentos/listar-ativos/*', { method: 'GET' }, authToken)
}

async function listarEstoqueMedicamentos(depositoId: number, tipoCodigo: string, authToken?: string | null): Promise<EstoqueMedicamentoRecord[]> {
  return requestRequisicao<EstoqueMedicamentoRecord[]>(
    `/estoque/listar/*/${depositoId}/${encodeURIComponent(tipoCodigo)}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarRequisicao(headerForm: HeaderForm, itens: RequisicaoItem[], authToken?: string | null): Promise<SalvarRequisicaoResponse> {
  return requestRequisicao<SalvarRequisicaoResponse>(
    '/requisicoes/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        data: formatDateForApi(headerForm.data),
        dep_id: headerForm.depositoId ?? 0,
        itens: itens.map((item) => ({
          lote: item.lote,
          med_id: item.medicamentoId,
          qtde: item.quantidade,
          validade: formatDateValueForApi(item.validade),
        })),
        local_id: headerForm.localId ?? 0,
        observacao: normalizeText(headerForm.observacao, MAX_OBSERVACAO_LENGTH).trim(),
        pac_id: headerForm.pacienteId ?? 0,
        req_id: 0,
        solicitado_por: getStoredSessionUsername(),
        tipo_req_id: headerForm.tipoRequisicaoId,
      }),
    },
    authToken,
  )
}

async function imprimirComprovanteRequisicao(reqId: number, authToken?: string | null): Promise<Blob> {
  return requestRequisicaoBlob(`/requisicoes/imprimir/${reqId}`, authToken)
}

export function RequisicaoPorPacientePage() {
  const [isCompactLayout] = useMediaQuery('(max-width: 960px)')
  const message = useMessage()
  const mask = useMask()
  const resolvedAuthToken = getStoredToken()
  const [headerForm, setHeaderForm] = useState<HeaderForm>(() => ({
    data: formatDateForInput(new Date()),
    depositoId: null,
    localId: null,
    pacienteId: null,
    pacienteNome: '',
    observacao: '',
    tipoRequisicaoId: 1,
  }))
  const [headerErrors, setHeaderErrors] = useState<HeaderErrors>({})
  const [itens, setItens] = useState<RequisicaoItem[]>([])
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [pacienteModalOpen, setPacienteModalOpen] = useState(false)
  const [pacienteSearchValue, setPacienteSearchValue] = useState('')
  const [submittedPacienteSearch, setSubmittedPacienteSearch] = useState<string | null>(null)
  const [pacienteLookupPage, setPacienteLookupPage] = useState(1)
  const [pacienteLookupTableInstance, setPacienteLookupTableInstance] = useState(0)
  const [medicamentoModalOpen, setMedicamentoModalOpen] = useState(false)
  const [medicamentoSearchValue, setMedicamentoSearchValue] = useState('')
  const [selectedTipoMedicamentoCodigo, setSelectedTipoMedicamentoCodigo] = useState<string | null>(null)
  const [checkedMedicamentos, setCheckedMedicamentos] = useState<Record<string, boolean>>({})
  const [quantidades, setQuantidades] = useState<Record<string, number>>({})
  const [activeItemsTab, setActiveItemsTab] = useState<RequisicaoItemsTabKey>('itens')
  const [lastSavedRequisicao, setLastSavedRequisicao] = useState<{ reqId: number, reqNum: string } | null>(null)

  const locaisQuery = useQuery({
    queryKey: ['requisicao-paciente-locais', localSearchValue, resolvedAuthToken],
    queryFn: () => listarLocais(localSearchValue, resolvedAuthToken),
  })

  const depositosQuery = useQuery({
    queryKey: ['requisicao-paciente-depositos', resolvedAuthToken],
    queryFn: () => listarDepositos(resolvedAuthToken),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['requisicao-paciente-tipos-medicamentos', resolvedAuthToken],
    queryFn: () => listarTiposMedicamentos(resolvedAuthToken),
  })

  const pacientesQuery = useQuery({
    queryKey: ['requisicao-paciente-pacientes', submittedPacienteSearch, resolvedAuthToken],
    queryFn: () => listarPacientes(submittedPacienteSearch ?? '*', resolvedAuthToken),
    enabled: submittedPacienteSearch !== null,
  })

  const estoqueMedicamentosQuery = useQuery({
    queryKey: ['requisicao-paciente-estoque-medicamentos', headerForm.depositoId, selectedTipoMedicamentoCodigo, resolvedAuthToken],
    queryFn: () => listarEstoqueMedicamentos(headerForm.depositoId ?? 0, selectedTipoMedicamentoCodigo ?? '', resolvedAuthToken),
    enabled: medicamentoModalOpen && Boolean(headerForm.depositoId && selectedTipoMedicamentoCodigo),
  })

  const saveMutation = useMutation({
    mutationFn: () => salvarRequisicao(headerForm, itens, resolvedAuthToken),
    onSuccess: (data) => {
      const requisicaoNumero = data.req_num?.trim()
      const requisicaoNumeroMascarado = mask.requisitionNumber(requisicaoNumero)
      const requisicaoId = Number(data.req_id || 0)

      setLastSavedRequisicao(requisicaoId > 0 ? {
        reqId: requisicaoId,
        reqNum: requisicaoNumeroMascarado || requisicaoNumero || String(requisicaoId),
      } : null)

      if (requisicaoNumero) {
        message.notify({
          icon: 'success',
          persistent: true,
          text: (
            <ReferenceNotification
              body={`Requisicao registrada com ${itens.length} item(ns).`}
              hint="Anote este numero antes de fechar a mensagem."
              label="Numero da requisicao"
              value={requisicaoNumeroMascarado || requisicaoNumero}
            />
          ),
          title: 'Requisicao salva',
        })
      } else {
        message.success('Requisicao salva', 'Registro criado com sucesso.')
      }

      setHeaderForm({
        data: formatDateForInput(new Date()),
        depositoId: null,
        localId: null,
        pacienteId: null,
        pacienteNome: '',
        observacao: '',
        tipoRequisicaoId: 1,
      })
      setHeaderErrors({})
      setItens([])
      handleCloseMedicamentoModal()
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar requisicao', getErrorMessage(error))
    },
  })

  const printMutation = useMutation({
    mutationFn: async () => {
      if (!lastSavedRequisicao?.reqId) {
        throw new Error('Nenhuma requisicao disponivel para impressao.')
      }

      const pdfBlob = await imprimirComprovanteRequisicao(lastSavedRequisicao.reqId, resolvedAuthToken)
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!openedWindow) {
        const anchor = document.createElement('a')
        anchor.href = pdfUrl
        anchor.download = `comprovante-requisicao-${lastSavedRequisicao.reqNum}.pdf`
        anchor.click()
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 60_000)
    },
    onError: (error: Error) => {
      message.error('Erro ao imprimir requisicao', getErrorMessage(error))
    },
  })

  const localOptions = toOptions(locaisQuery.data ?? [], (record) => record.local_id, (record) => record.local_descr || 'Local sem descricao')
  const depositoOptions = toOptions(depositosQuery.data ?? [], (record) => record.dep_id, (record) => record.dep_descr)
  const tipoMedicamentoOptions = toOptions(
    (tiposMedicamentosQuery.data ?? []).filter((record) => Number(record.tipo_ativo) === 1),
    (record) => record.tipo_codigo,
    (record) => `${record.tipo_descr} (${record.tipo_codigo})`,
  )

  const pacientes = pacientesQuery.data ?? []
  const currentPacienteLookupPage = Math.min(pacienteLookupPage, Math.max(1, Math.ceil(pacientes.length / PAGE_SIZE)))
  const pacienteLookupPageStart = (currentPacienteLookupPage - 1) * PAGE_SIZE
  const paginatedPacientes = pacientes.slice(pacienteLookupPageStart, pacienteLookupPageStart + PAGE_SIZE)
  const pacienteLookupTableHeight = Math.min(Math.max(paginatedPacientes.length * 54 + 112, 280), 560)
  const estoqueMedicamentos = estoqueMedicamentosQuery.data ?? EMPTY_ESTOQUE_MEDICAMENTOS
  const hasBootstrapError = locaisQuery.isError || depositosQuery.isError
  const tableHeight = isCompactLayout ? 320 : 360
  const filteredEstoqueMedicamentos = useMemo(() => {
    const normalizedSearch = medicamentoSearchValue.trim().toLocaleLowerCase('pt-BR')

    if (!normalizedSearch) {
      return estoqueMedicamentos
    }

    return estoqueMedicamentos.filter((record) => {
      const searchableText = [
        record.descricao,
        record.descricao_comercial,
        record.lote,
      ].join(' ').toLocaleLowerCase('pt-BR')

      return searchableText.includes(normalizedSearch)
    })
  }, [estoqueMedicamentos, medicamentoSearchValue])
  const selectedModalItems = useMemo(
    () => estoqueMedicamentos.filter((record) => checkedMedicamentos[getItemDraftId(record)]),
    [checkedMedicamentos, estoqueMedicamentos],
  )

  const handleSearchPaciente = () => {
    setPacienteLookupPage(1)
    setPacienteLookupTableInstance((current) => current + 1)
    setSubmittedPacienteSearch(pacienteSearchValue.trim() || '*')
  }

  const handleRefreshPacientes = () => {
    if (submittedPacienteSearch === null) {
      handleSearchPaciente()
      return
    }

    setPacienteLookupPage(1)
    setPacienteLookupTableInstance((current) => current + 1)
    void pacientesQuery.refetch()
  }

  const handleSelectPaciente = (record: PacienteRecord) => {
    setHeaderForm((current) => ({
      ...current,
      pacienteId: Number(record.num_paciente),
      pacienteNome: String(record.nom_paciente || '').trim(),
    }))
    setHeaderErrors((current) => ({
      ...current,
      pacienteId: undefined,
      pacienteNome: undefined,
    }))
    setPacienteModalOpen(false)
    setPacienteLookupPage(1)
  }

  const handleOpenMedicamentoModal = () => {
    if (!headerForm.depositoId) {
      setHeaderErrors((current) => ({ ...current, depositoId: 'Selecione o deposito.' }))
      message.warning('Deposito obrigatorio', 'Selecione o deposito antes de incluir medicamentos.')
      return
    }

    setMedicamentoModalOpen(true)
  }

  const handleCloseMedicamentoModal = () => {
    setMedicamentoModalOpen(false)
    setMedicamentoSearchValue('')
    setSelectedTipoMedicamentoCodigo(null)
    setCheckedMedicamentos({})
    setQuantidades({})
  }

  const handleAddModalItem = (record: EstoqueMedicamentoRecord) => {
    const draftId = getItemDraftId(record)
    const quantidade = Number(quantidades[draftId] || 0)

    if (itens.some((item) => item.draftId === draftId)) {
      message.warning('Item ja adicionado', 'Este item ja foi adicionado a requisicao.')
      return
    }

    if (quantidade <= 0) {
      message.warning('Quantidade obrigatoria', 'Informe uma quantidade maior que zero.')
      return
    }

    if (quantidade > Number(record.saldo_disponivel || 0)) {
      message.warning('Quantidade invalida', 'A quantidade digitada nao pode ser maior que o saldo disponivel.')
      return
    }

    setItens((current) => {
      const nextItem: RequisicaoItem = {
        descricao: record.descricao || 'Medicamento sem descricao',
        draftId,
        lote: record.lote || '',
        medicamentoId: getMedicamentoId(record),
        quantidade,
        validade: record.validade,
      }
      const index = current.findIndex((item) => item.draftId === draftId)

      if (index < 0) {
        return [...current, nextItem]
      }

      return current.map((item) => (item.draftId === draftId ? nextItem : item))
    })
    setCheckedMedicamentos((current) => ({ ...current, [draftId]: false }))
  }

  const handleChangeMedicamentoQuantidade = (record: EstoqueMedicamentoRecord, value: number | string | null) => {
    const draftId = getItemDraftId(record)
    const quantidade = Number(value || 0)
    const saldoDisponivel = Number(record.saldo_disponivel || 0)

    if (quantidade > saldoDisponivel) {
      setQuantidades((current) => ({ ...current, [draftId]: 0 }))
      message.warning('Saldo Insuficiente', 'A quantidade digitada e maior que o saldo disponivel.')
      return
    }

    setQuantidades((current) => ({ ...current, [draftId]: quantidade }))
  }

  const handleAddCheckedItems = () => {
    if (selectedModalItems.length === 0) {
      message.warning('Nenhum medicamento selecionado', 'Marque pelo menos um item para adicionar.')
      return
    }

    for (const record of selectedModalItems) {
      const draftId = getItemDraftId(record)
      const quantidade = Number(quantidades[draftId] || 0)

      if (itens.some((item) => item.draftId === draftId)) {
        message.warning('Item ja adicionado', 'Este item ja foi adicionado a requisicao.')
        return
      }

      if (quantidade <= 0 || quantidade > Number(record.saldo_disponivel || 0)) {
        message.warning('Quantidade invalida', 'Revise as quantidades dos itens selecionados.')
        return
      }
    }

    for (const record of selectedModalItems) {
      handleAddModalItem(record)
    }
  }

  const handleDeleteItem = (draftId: string) => {
    setItens((current) => current.filter((item) => item.draftId !== draftId))
  }

  const handleSave = () => {
    if (!getStoredSessionUsername()) {
      message.error('Sessao invalida', 'Nao foi possivel identificar o solicitante.')
      return
    }

    const nextErrors = validateHeaderForm(headerForm)
    setHeaderErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      message.warning('Dados incompletos', 'Revise os dados da requisicao.')
      return
    }

    if (itens.length === 0) {
      message.warning('Nenhum item adicionado', 'Inclua pelo menos um medicamento.')
      return
    }

    saveMutation.mutate()
  }

  const renderItemActions = (rowData: RequisicaoItem, compact = false) => (
    <HStack spacing={8} className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`}>
      {compact ? (
        <Button appearance="subtle" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => handleDeleteItem(rowData.draftId)}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton
            appearance="subtle"
            color="red"
            size="xs"
            aria-label="Excluir item"
            circle
            className="boname-page__action-icon boname-page__action-icon--delete"
            icon={<TrashIcon />}
            onClick={() => handleDeleteItem(rowData.draftId)}
          />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page entradas-page entrada-demandas-page requisicao-paciente-page entradas-page--merged-layout">
      {hasBootstrapError ? (
        <PageSection className="boname-page__table-section entradas-page__draft-section">
          <DataState
            state="error"
            title="Falha ao carregar dados auxiliares"
            description="Nao foi possivel carregar locais ou depositos."
            action={(
              <HStack spacing={10} wrap>
                <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void locaisQuery.refetch()}>
                  Recarregar locais
                </Button>
                <Button appearance="ghost" onClick={() => void depositosQuery.refetch()}>
                  Recarregar depositos
                </Button>
              </HStack>
            )}
          />
        </PageSection>
      ) : null}

      <PageSection className="entradas-page__header-section entradas-page__merged-section">
        <div className="boname-page__form-grid entradas-page__form-grid">
          <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Dados da requisicao">
            <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--metrics entrada-demandas-page__entry-grid requisicao-paciente-page__header-grid">
              <div className="boname-page__field requisicao-paciente-page__field--patient-id">
                <label htmlFor="requisicao-paciente-id">ID Paciente</label>
                <InputNumber
                  id="requisicao-paciente-id"
                  min={0}
                  size="sm"
                  controls={false}
                  disabled
                  className={headerErrors.pacienteId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.pacienteId}
                />
                {headerErrors.pacienteId ? <span className="boname-page__field-error">{headerErrors.pacienteId}</span> : null}
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--patient-search">
                <label className="estoque-page__actions-label">Pesquisar</label>
                <IconButton
                  aria-label="Pesquisar paciente"
                  appearance="primary"
                  icon={<SearchIcon />}
                  size="sm"
                  onClick={() => setPacienteModalOpen(true)}
                />
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--patient-name">
                <label htmlFor="requisicao-paciente-nome">Nome do paciente</label>
                <Input
                  id="requisicao-paciente-nome"
                  size="sm"
                  disabled
                  className={headerErrors.pacienteNome ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.pacienteNome}
                />
                {headerErrors.pacienteNome ? <span className="boname-page__field-error">{headerErrors.pacienteNome}</span> : null}
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--request-type">
                <label id="requisicao-paciente-tipo-label">Tipo requisicao</label>
                <SelectPicker
                  aria-labelledby="requisicao-paciente-tipo-label"
                  block
                  cleanable={false}
                  searchable={false}
                  data={TIPO_REQUISICAO_OPTIONS}
                  className="boname-page__control boname-page__control--compact"
                  value={headerForm.tipoRequisicaoId}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, tipoRequisicaoId: value == null ? 1 : Number(value) }))
                  }}
                />
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--local">
                <label id="requisicao-paciente-local-label">Local</label>
                <SelectPicker
                  aria-labelledby="requisicao-paciente-local-label"
                  block
                  cleanable={false}
                  data={localOptions}
                  loading={locaisQuery.isPending}
                  placeholder="Selecione o local"
                  className={headerErrors.localId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.localId}
                  onSearch={(searchKeyword) => {
                    setLocalSearchValue(searchKeyword)
                  }}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, localId: value == null ? null : Number(value) }))
                    setHeaderErrors((current) => ({ ...current, localId: undefined }))
                  }}
                />
                {headerErrors.localId ? <span className="boname-page__field-error">{headerErrors.localId}</span> : null}
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--deposito">
                <label id="requisicao-paciente-deposito-label">Deposito</label>
                <SelectPicker
                  aria-labelledby="requisicao-paciente-deposito-label"
                  block
                  cleanable={false}
                  data={depositoOptions}
                  loading={depositosQuery.isPending}
                  placeholder="Selecione o deposito"
                  className={headerErrors.depositoId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.depositoId}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, depositoId: value == null ? null : Number(value) }))
                    setHeaderErrors((current) => ({ ...current, depositoId: undefined }))
                    handleCloseMedicamentoModal()
                    setItens([])
                  }}
                />
                {headerErrors.depositoId ? <span className="boname-page__field-error">{headerErrors.depositoId}</span> : null}
              </div>

              <div className="boname-page__field requisicao-paciente-page__field--date">
                <label htmlFor="requisicao-paciente-data">Data</label>
                <DatePicker
                  id="requisicao-paciente-data"
                  block
                  disabled
                  format="dd/MM/yyyy"
                  size="sm"
                  className="boname-page__control boname-page__control--compact requisicao-paciente-page__date-control"
                  value={new Date(`${headerForm.data}T00:00:00`)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="boname-page__table-content entradas-page__draft-content requisicao-paciente-page__items-tabs">
          <Tabs
            activeKey={activeItemsTab}
            appearance="tabs"
            onSelect={(eventKey) => {
              setActiveItemsTab(eventKey === 'observacao' ? 'observacao' : 'itens')
            }}
          >
            <Tabs.Tab eventKey="itens" title="Itens">
              {activeItemsTab !== 'itens' ? null : itens.length === 0 ? (
                <DataState
                  state="empty"
                  title="Nenhum item adicionado"
                  description="Use o botao Incluir item para selecionar medicacoes do estoque."
                />
              ) : isCompactLayout ? (
                <div className="boname-page__card-list">
                  {itens.map((rowData) => (
                    <div key={rowData.draftId} className="boname-page__record-card rs-panel rs-panel-bordered">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.descricao}</strong>
                          <p>Lote: {rowData.lote || '-'}</p>
                        </div>
                        <StatusBadge tone="info">{mask.number(rowData.quantidade)}</StatusBadge>
                      </div>
                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Codigo</dt>
                          <dd>{rowData.medicamentoId}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{mask.date(rowData.validade)}</dd>
                        </div>
                      </dl>
                      {renderItemActions(rowData, true)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table key={`requisicao-itens-${itens.length}`} data={itens} height={tableHeight} fillHeight bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                    <Column width={120} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="medicamentoId" />
                    </Column>
                    <Column flexGrow={1.5} minWidth={260}>
                      <HeaderCell>Descricao medicamento</HeaderCell>
                      <Cell dataKey="descricao" />
                    </Column>
                    <Column width={140}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell dataKey="lote" />
                    </Column>
                    <Column width={130} align="center">
                      <HeaderCell>Quantidade</HeaderCell>
                      <Cell>{(rowData: RequisicaoItem) => mask.number(rowData.quantidade)}</Cell>
                    </Column>
                    <Column width={150} align="center">
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: RequisicaoItem) => mask.date(rowData.validade)}</Cell>
                    </Column>
                    <Column width={120} fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>{(rowData: RequisicaoItem) => renderItemActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </Tabs.Tab>
            <Tabs.Tab eventKey="observacao" title="Observacao">
              {activeItemsTab === 'observacao' ? (
                <div className="boname-page__field boname-page__field--full requisicao-paciente-page__observacao-field">
                  <label htmlFor="requisicao-paciente-observacao">Observacao da requisicao</label>
                  <Textarea
                    id="requisicao-paciente-observacao"
                    rows={8}
                    maxLength={MAX_OBSERVACAO_LENGTH}
                    className="boname-page__control requisicao-paciente-page__observacao-control"
                    placeholder="Descreva observacoes relevantes para a requisicao"
                    value={headerForm.observacao}
                    onChange={(value) => {
                      setHeaderForm((current) => ({ ...current, observacao: normalizeText(value, MAX_OBSERVACAO_LENGTH) }))
                    }}
                  />
                </div>
              ) : null}
            </Tabs.Tab>
          </Tabs>
        </div>

        <div className="boname-page__table-footer">
          <HStack spacing={10} wrap className="boname-page__toolbar-actions">
            <Button appearance="primary" startIcon={<PlusIcon />} disabled={saveMutation.isPending} onClick={handleOpenMedicamentoModal}>
              Incluir item
            </Button>
            <Button
              appearance="ghost"
              disabled={!lastSavedRequisicao || saveMutation.isPending}
              loading={printMutation.isPending}
              startIcon={<PrintIcon />}
              onClick={() => printMutation.mutate()}
            >
              Imprimir
            </Button>
            <Button appearance="ghost" loading={saveMutation.isPending} onClick={handleSave}>
              Salvar requisicao
            </Button>
          </HStack>
        </div>
      </PageSection>

      <AppModal
        open={pacienteModalOpen}
        onClose={() => setPacienteModalOpen(false)}
        title="Pesquisar Paciente"
        intent="view"
        intentVisible={false}
        size={isCompactLayout ? 'full' : 'lg'}
        className="boname-page__record-modal demandas-especificas-page__patient-lookup-modal requisicao-paciente-page__patient-modal"
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel demandas-especificas-page__patient-lookup-panel" aria-label="Pesquisa de pacientes">
            <div className="demandas-especificas-page__patient-lookup-controls">
              <div className="demandas-especificas-page__patient-lookup-toolbar">
                <Input
                  aria-label="Pesquisar paciente"
                  className="boname-page__search-input demandas-especificas-page__patient-lookup-input"
                  placeholder="Nome, nome usual, CPF ou numero do paciente"
                  value={pacienteSearchValue}
                  onChange={setPacienteSearchValue}
                  onPressEnter={handleSearchPaciente}
                />
                <div className="demandas-especificas-page__patient-lookup-actions">
                  <Button
                    appearance="primary"
                    className="demandas-especificas-page__patient-lookup-button"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchPaciente}
                  >
                    Buscar
                  </Button>
                  <Button
                    appearance="ghost"
                    className="demandas-especificas-page__patient-lookup-button"
                    startIcon={<ReloadIcon />}
                    loading={pacientesQuery.isFetching && !pacientesQuery.isPending}
                    onClick={handleRefreshPacientes}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
              <small className="demandas-especificas-page__patient-lookup-hint">Pressione Enter ou clique em Buscar para atualizar a listagem.</small>
            </div>

            {submittedPacienteSearch === null ? (
              <DataState
                state="empty"
                title="Informe um filtro para iniciar"
                description="Digite um termo e clique em Buscar para consultar os pacientes."
              />
            ) : pacientesQuery.isPending ? (
              <DataState
                state="loading"
                title="Carregando pacientes"
                description="Consultando os pacientes do ambulatorio."
              />
            ) : pacientesQuery.isError ? (
              <DataState
                state="error"
                title="Falha ao carregar pacientes"
                description={
                  pacientesQuery.error instanceof Error
                    ? pacientesQuery.error.message
                    : 'Nao foi possivel consultar os pacientes.'
                }
                action={
                  <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void pacientesQuery.refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : pacientes.length === 0 ? (
              <DataState
                state="empty"
                title="Nenhum paciente encontrado"
                description="Ajuste o termo pesquisado e tente novamente."
              />
            ) : (
              <>
                <div className="boname-page__table-wrap demandas-especificas-page__patient-lookup-table-wrap demandas-especificas-page__modal-table-wrap requisicao-paciente-page__modal-table-wrap">
                  <Table
                    key={pacienteLookupTableInstance}
                    data={paginatedPacientes}
                    height={pacienteLookupTableHeight}
                    fillHeight
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={104} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="num_paciente" />
                    </Column>
                    <Column flexGrow={1.6} minWidth={260}>
                      <HeaderCell>Paciente</HeaderCell>
                      <Cell>{(rowData: PacienteRecord) => mask.text(rowData.nom_paciente)}</Cell>
                    </Column>
                    <Column flexGrow={1.2} minWidth={220}>
                      <HeaderCell>Nome usual</HeaderCell>
                      <Cell>{(rowData: PacienteRecord) => mask.text(rowData.nom_social)}</Cell>
                    </Column>
                    <Column width={140}>
                      <HeaderCell>Nascimento</HeaderCell>
                      <Cell>{(rowData: PacienteRecord) => mask.date(rowData.dt_nascimento ?? null)}</Cell>
                    </Column>
                    <Column width={150}>
                      <HeaderCell>CPF</HeaderCell>
                      <Cell>{(rowData: PacienteRecord) => mask.cpf(rowData.cpf)}</Cell>
                    </Column>
                    <Column width={120}>
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>
                        {(rowData: PacienteRecord) => (
                          <HStack justifyContent="center" className="boname-page__row-actions boname-page__row-actions--table">
                            <IconButton
                              appearance="subtle"
                              aria-label={`Selecionar paciente ${mask.text(rowData.nom_paciente)}`}
                              circle
                              className="boname-page__action-icon boname-page__action-icon--view"
                              icon={<CheckIcon />}
                              size="xs"
                              onClick={() => handleSelectPaciente(rowData)}
                            />
                          </HStack>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>
                <div className="boname-page__table-footer">
                  <p>
                    Exibindo <strong>{pacienteLookupPageStart + 1}</strong> a{' '}
                    <strong>{Math.min(pacienteLookupPageStart + paginatedPacientes.length, pacientes.length)}</strong> de{' '}
                    <strong>{pacientes.length}</strong> pacientes.
                  </p>
                  {pacientes.length > PAGE_SIZE ? (
                    <Pagination
                      activePage={currentPacienteLookupPage}
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
                      total={pacientes.length}
                      onChangePage={setPacienteLookupPage}
                    />
                  ) : null}
                </div>
              </>
            )}
          </section>
        </div>
      </AppModal>

      <AppModal
        open={medicamentoModalOpen}
        onClose={handleCloseMedicamentoModal}
        title="Selecao de medicacoes"
        subtitle="Informe o tipo, confira o saldo e adicione os itens."
        intent="create"
        intentVisible={false}
        size="lg"
        className="boname-page__record-modal entrada-demandas-page__item-record-modal requisicao-paciente-page__medicamento-modal"
        footer={(
          <>
            <Button appearance="subtle" startIcon={<CloseIcon />} onClick={handleCloseMedicamentoModal}>
              Cancelar
            </Button>
            <Button appearance="primary" startIcon={<PlusIcon />} onClick={handleAddCheckedItems}>
              Adicionar
            </Button>
          </>
        )}
      >
        <div className="boname-page__modal-shell">
          <div className="boname-page__form-grid entradas-page__item-modal-grid">
            <div className="boname-page__field">
              <label htmlFor="requisicao-paciente-medicamento-search">Pesquisar</label>
              <Input
                id="requisicao-paciente-medicamento-search"
                aria-label="Pesquisar por descricao e lote"
                className="boname-page__control"
                placeholder="Pesquisar por descricao e lote"
                value={medicamentoSearchValue}
                onChange={setMedicamentoSearchValue}
              />
            </div>

            <div className="boname-page__field">
              <label id="requisicao-paciente-tipo-medicamento-label">Tipo de medicamento</label>
              <SelectPicker
                aria-labelledby="requisicao-paciente-tipo-medicamento-label"
                block
                cleanable={false}
                data={tipoMedicamentoOptions}
                loading={tiposMedicamentosQuery.isPending}
                placeholder="Selecione o tipo"
                className="boname-page__control"
                value={selectedTipoMedicamentoCodigo}
                onChange={(value) => {
                  setSelectedTipoMedicamentoCodigo(typeof value === 'string' ? value : null)
                  setMedicamentoSearchValue('')
                  setCheckedMedicamentos({})
                  setQuantidades({})
                }}
              />
            </div>
          </div>

          {!selectedTipoMedicamentoCodigo ? (
            <DataState state="empty" title="Selecione o tipo" description="O estoque sera listado depois da selecao do tipo de medicamento." />
          ) : estoqueMedicamentosQuery.isPending ? (
            <DataState state="loading" title="Carregando medicamentos" description="Consultando saldo disponivel do deposito selecionado." />
          ) : estoqueMedicamentosQuery.isError ? (
            <DataState
              state="error"
              title="Falha ao carregar medicamentos"
              description={estoqueMedicamentosQuery.error instanceof Error ? estoqueMedicamentosQuery.error.message : 'Nao foi possivel listar medicamentos.'}
            />
          ) : estoqueMedicamentos.length === 0 ? (
            <DataState state="empty" title="Nenhum medicamento encontrado" description="Nao ha saldo disponivel para o tipo selecionado." />
          ) : filteredEstoqueMedicamentos.length === 0 ? (
            <DataState state="empty" title="Nenhum medicamento encontrado" description="Ajuste a pesquisa por descricao ou lote." />
          ) : (
            <div className="boname-page__table-wrap requisicao-paciente-page__modal-table-wrap">
              <Table data={filteredEstoqueMedicamentos} height={420} fillHeight bordered rowHeight={58} headerHeight={52} autoHeight={false}>
                <Column width={56} align="center">
                  <HeaderCell>Sel.</HeaderCell>
                  <Cell>
                    {(rowData: EstoqueMedicamentoRecord) => {
                      const draftId = getItemDraftId(rowData)

                      return (
                        <Checkbox
                          aria-label="Selecionar medicamento"
                          checked={Boolean(checkedMedicamentos[draftId])}
                          onChange={(_, checked) => {
                            setCheckedMedicamentos((current) => ({ ...current, [draftId]: checked }))
                          }}
                        />
                      )
                    }}
                  </Cell>
                </Column>
                <Column width={72} align="center">
                  <HeaderCell>ID</HeaderCell>
                  <Cell>{(rowData: EstoqueMedicamentoRecord) => getMedicamentoId(rowData)}</Cell>
                </Column>
                <Column flexGrow={1} minWidth={230}>
                  <HeaderCell>Descricao</HeaderCell>
                  <Cell dataKey="descricao" />
                </Column>
                <Column width={72} align="center">
                  <HeaderCell>Unidade</HeaderCell>
                  <Cell dataKey="unidade" />
                </Column>
                <Column width={120}>
                  <HeaderCell>Lote</HeaderCell>
                  <Cell dataKey="lote" />
                </Column>
                <Column width={108} align="center">
                  <HeaderCell>Saldo</HeaderCell>
                  <Cell>{(rowData: EstoqueMedicamentoRecord) => mask.number(rowData.saldo_disponivel)}</Cell>
                </Column>
                <Column width={124} align="center">
                  <HeaderCell>Quantidade</HeaderCell>
                  <Cell>
                    {(rowData: EstoqueMedicamentoRecord) => {
                      const draftId = getItemDraftId(rowData)

                      return (
                        <InputNumber
                          aria-label="Quantidade digitada"
                          controls={false}
                          min={0}
                          max={Number(rowData.saldo_disponivel || 0)}
                          size="sm"
                          className="requisicao-paciente-page__quantity-input"
                          value={quantidades[draftId] ?? 0}
                          onChange={(value) => {
                            handleChangeMedicamentoQuantidade(rowData, value)
                          }}
                        />
                      )
                    }}
                  </Cell>
                </Column>
                <Column width={104} align="center">
                  <HeaderCell>Validade</HeaderCell>
                  <Cell>{(rowData: EstoqueMedicamentoRecord) => renderValidityBadge(rowData.validade, rowData.alerta_validade)}</Cell>
                </Column>
              </Table>
            </div>
          )}
        </div>
      </AppModal>
    </section>
  )
}

export default RequisicaoPorPacientePage
