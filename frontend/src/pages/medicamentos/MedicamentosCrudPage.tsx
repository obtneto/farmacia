import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  HStack,
  IconButton,
  Input,
  InputNumber,
  Pagination,
  Panel,
  SelectPicker,
  Textarea,
  Tooltip,
  useMediaQuery,
  Whisper,
} from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

export interface MedicamentoRecord {
  med_id: number
  med_descr: string
  med_descr_coml: string
  med_und: string
  med_tipo_codigo: string
  med_tipo_med: string
  med_max: number
  med_min: number
  med_ui_cx: number
  med_bona_codigo: string | null
  med_alert: number
  med_diag_id: number | null
  med_ativo: 0 | 1
}

interface TipoMedicamentoRecord {
  tipo_id: number
  tipo_codigo: string
  tipo_descr: string
  tipo_ativo: 0 | 1
  tipo_vincul?: string | null
}

interface BonameRecord {
  bona_id: number
  bona_codigo: string
  bona_descr: string
  bona_ativo: 0 | 1
}

interface DiagnosticoRecord {
  diag_id: number
  diag_descr: string
  diag_ativo: 0 | 1
}

interface SelectOption<TValue extends number | string> {
  label: string
  value: TValue
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof MedicamentoRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface MedicamentosCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: MedicamentoRecord = {
  med_id: 0,
  med_descr: '',
  med_descr_coml: '',
  med_und: '',
  med_tipo_codigo: '',
  med_tipo_med: '',
  med_max: 0,
  med_min: 0,
  med_ui_cx: 0,
  med_bona_codigo: null,
  med_alert: 0,
  med_diag_id: null,
  med_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const MED_DESCR_MAX_LENGTH = 150
const MED_DESCR_COML_MAX_LENGTH = 150
const MED_UND_MAX_LENGTH = 50
const MED_TIPO_MED_MAX_LENGTH = 90
const CATEGORIA_OPTIONS: Array<SelectOption<string>> = [
  { label: 'CONTROLADO', value: 'CONTROLADO' },
  { label: 'NÃO CONTROLADO', value: 'NÃO CONTROLADO' },
]

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

function normalizeSearchTerm(value: string): string {
  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? '*' : trimmedValue
}

function normalizeText(value: string, maxLength: number): string {
  return value.slice(0, maxLength)
}

function normalizeTextForSave(value: string, maxLength: number): string {
  return normalizeText(value, maxLength).trim().toLocaleUpperCase('pt-BR')
}

function validateForm(values: MedicamentoRecord, requiresVinculo: boolean): FormErrors {
  const errors: FormErrors = {}

  if (!values.med_descr.trim()) {
    errors.med_descr = 'Informe a descricao do medicamento.'
  }

  if (!values.med_descr_coml.trim()) {
    errors.med_descr_coml = 'Informe a descricao comercial.'
  }

  if (!values.med_und.trim()) {
    errors.med_und = 'Informe a unidade.'
  }

  if (!values.med_tipo_codigo.trim()) {
    errors.med_tipo_codigo = 'Selecione o tipo de medicamento.'
  }

  if (!values.med_tipo_med.trim()) {
    errors.med_tipo_med = 'Informe a categoria do medicamento.'
  }

  if (!isPositiveNumber(values.med_max)) {
    errors.med_max = 'Informe um estoque maximo maior que zero.'
  }

  if (!isPositiveNumber(values.med_min)) {
    errors.med_min = 'Informe um estoque minimo maior que zero.'
  }

  if (!isPositiveNumber(values.med_alert)) {
    errors.med_alert = 'Informe um alerta maior que zero.'
  }

  if (requiresVinculo && !isPositiveNumber(values.med_ui_cx)) {
    errors.med_ui_cx = 'Informe UI por caixa maior que zero.'
  }

  if (requiresVinculo && normalizeNullableId(values.med_diag_id) === null) {
    errors.med_diag_id = 'Selecione o diagnostico.'
  }

  if (requiresVinculo && normalizeNullableCode(values.med_bona_codigo) === null) {
    errors.med_bona_codigo = 'Selecione o Boname.'
  }

  return errors
}

function normalizeNullableCode(value: string | null | undefined): string | null {
  const normalizedValue = String(value ?? '').trim().toLocaleUpperCase('pt-BR')
  return normalizedValue ? normalizedValue : null
}

function normalizeNullableId(value: number | null | undefined): number | null {
  const normalizedValue = Number(value)
  return Number.isFinite(normalizedValue) && normalizedValue > 0 ? normalizedValue : null
}

function normalizeLinkedFields(values: MedicamentoRecord): MedicamentoRecord {
  if (values.med_diag_id === null && values.med_bona_codigo === null && values.med_ui_cx === 0) {
    return values
  }

  return {
    ...values,
    med_diag_id: null,
    med_bona_codigo: null,
    med_ui_cx: 0,
  }
}

function isPositiveNumber(value: number | null | undefined): boolean {
  const normalizedValue = Number(value)
  return Number.isFinite(normalizedValue) && normalizedValue > 0
}

async function requestMedicamentos<T>(
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

async function listarMedicamentos(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<MedicamentoRecord[]> {
  return requestMedicamentos<MedicamentoRecord[]>(
    baseUrl,
    `/parametros/medicamentos/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarMedicamento(
  baseUrl: string,
  medId: number,
  authToken?: string | null,
): Promise<MedicamentoRecord> {
  const data = await requestMedicamentos<MedicamentoRecord>(
    baseUrl,
    `/parametros/medicamentos/buscar/${medId}`,
    { method: 'GET' },
    authToken,
  )

  return {
    ...data,
    med_bona_codigo: normalizeNullableCode(data.med_bona_codigo),
    med_diag_id: normalizeNullableId(data.med_diag_id),
  }
}

async function listarTiposMedicamentos(baseUrl: string, authToken?: string | null): Promise<TipoMedicamentoRecord[]> {
  return requestMedicamentos<TipoMedicamentoRecord[]>(
    baseUrl,
    '/parametros/tipos_medicamentos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function buscarTipoMedicamentoPorCodigo(
  baseUrl: string,
  tipoCodigo: string,
  authToken?: string | null,
): Promise<TipoMedicamentoRecord> {
  return requestMedicamentos<TipoMedicamentoRecord>(
    baseUrl,
    `/parametros/tipos_medicamentos/buscar-codigo/${encodeURIComponent(tipoCodigo)}`,
    { method: 'GET' },
    authToken,
  )
}

async function listarBonames(baseUrl: string, authToken?: string | null): Promise<BonameRecord[]> {
  return requestMedicamentos<BonameRecord[]>(
    baseUrl,
    '/parametros/boname/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarDiagnosticos(baseUrl: string, authToken?: string | null): Promise<DiagnosticoRecord[]> {
  return requestMedicamentos<DiagnosticoRecord[]>(
    baseUrl,
    '/parametros/diagnosticos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function salvarMedicamento(baseUrl: string, values: MedicamentoRecord, authToken?: string | null): Promise<void> {
  await requestMedicamentos<unknown>(
    baseUrl,
    '/parametros/medicamentos/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirMedicamento(baseUrl: string, medId: number, authToken?: string | null): Promise<void> {
  await requestMedicamentos<unknown>(
    baseUrl,
    `/parametros/medicamentos/excluir/${medId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function MedicamentosCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: MedicamentosCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<MedicamentoRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['medicamentos-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarMedicamentos(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['tipos-medicamentos-modal', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarTiposMedicamentos(apiBaseUrl, resolvedAuthToken),
    enabled: modalMode !== null,
  })

  const tipoMedicamentoSelecionadoQuery = useQuery({
    queryKey: ['tipo-medicamento-selecionado', apiBaseUrl, formValues.med_tipo_codigo, resolvedAuthToken],
    queryFn: () => buscarTipoMedicamentoPorCodigo(apiBaseUrl, formValues.med_tipo_codigo.trim(), resolvedAuthToken),
    enabled: modalMode !== null && formValues.med_tipo_codigo.trim().length > 0,
  })

  const tipoSelecionadoExigeVinculo = tipoMedicamentoSelecionadoQuery.data?.tipo_vincul === 'S'
  const shouldClearLinkedFields =
    !tipoSelecionadoExigeVinculo && (!formValues.med_tipo_codigo.trim() || !tipoMedicamentoSelecionadoQuery.isPending)
  const effectiveFormValues = shouldClearLinkedFields ? normalizeLinkedFields(formValues) : formValues

  const bonamesQuery = useQuery({
    queryKey: ['bonames-modal', apiBaseUrl, formValues.med_tipo_codigo, resolvedAuthToken],
    queryFn: () => listarBonames(apiBaseUrl, resolvedAuthToken),
    enabled: modalMode !== null && tipoSelecionadoExigeVinculo,
  })

  const diagnosticosQuery = useQuery({
    queryKey: ['diagnosticos-modal', apiBaseUrl, formValues.med_tipo_codigo, resolvedAuthToken],
    queryFn: () => listarDiagnosticos(apiBaseUrl, resolvedAuthToken),
    enabled: modalMode !== null && tipoSelecionadoExigeVinculo,
  })

  const saveMutation = useMutation({
    mutationFn: (values: MedicamentoRecord) => salvarMedicamento(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Medicamento salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['medicamentos-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar medicamento', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (medId: number) => excluirMedicamento(apiBaseUrl, medId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Medicamento excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['medicamentos-list'] })
    },
  })

  const records = listQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = records.slice(pageStart, pageStart + PAGE_SIZE)
  const hasData = records.length > 0
  const isReadOnly = modalMode === 'view'
  const tableHeight = Math.min(Math.max(paginatedRecords.length * 54 + 104, 260), 560)

  const handleSearch = () => {
    setSubmittedSearch(normalizeSearchTerm(searchValue))
    setActivePage(1)
  }

  const closeFormModal = () => {
    formRequestIdRef.current += 1
    setModalMode(null)
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenCreate = () => {
    formRequestIdRef.current += 1
    setModalMode('create')
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
    setIsFormLoading(false)
  }

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: MedicamentoRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarMedicamento(apiBaseUrl, record.med_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar medicamento', getErrorMessage(error, 'Falha ao carregar o medicamento.'))
      setModalMode(null)
    } finally {
      if (formRequestIdRef.current === requestId) {
        setIsFormLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    const nextErrors = validateForm(effectiveFormValues, tipoSelecionadoExigeVinculo)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Campos obrigatorios',
        text: 'Revise os campos destacados antes de salvar o registro.',
      })
      return
    }

    await saveMutation.mutateAsync({
      ...effectiveFormValues,
      med_descr: normalizeTextForSave(effectiveFormValues.med_descr, MED_DESCR_MAX_LENGTH),
      med_descr_coml: normalizeTextForSave(effectiveFormValues.med_descr_coml, MED_DESCR_COML_MAX_LENGTH),
      med_und: normalizeTextForSave(effectiveFormValues.med_und, MED_UND_MAX_LENGTH),
      med_tipo_med: normalizeTextForSave(effectiveFormValues.med_tipo_med, MED_TIPO_MED_MAX_LENGTH),
      med_tipo_codigo: effectiveFormValues.med_tipo_codigo.trim().toLocaleUpperCase('pt-BR'),
      med_bona_codigo: normalizeNullableCode(effectiveFormValues.med_bona_codigo),
      med_diag_id: normalizeNullableId(effectiveFormValues.med_diag_id),
    })
  }

  const handleRequestDelete = async (record: MedicamentoRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.med_descr,
      onConfirm: () => deleteMutation.mutateAsync(record.med_id),
      subtitle: 'A acao abaixo afeta diretamente o cadastro selecionado.',
      title: 'Confirmar exclusao',
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const tipoOptions: Array<SelectOption<string>> = (tiposMedicamentosQuery.data ?? []).map((tipo) => ({
    label: `${tipo.tipo_codigo} - ${tipo.tipo_descr}`,
    value: tipo.tipo_codigo,
  }))

  const bonameOptions: Array<SelectOption<string>> = (bonamesQuery.data ?? []).map((boname) => ({
    label: `${boname.bona_codigo} - ${boname.bona_descr}`,
    value: boname.bona_codigo,
  }))

  const diagnosticoOptions: Array<SelectOption<number>> = (diagnosticosQuery.data ?? []).map((diagnostico) => ({
    label: diagnostico.diag_descr,
    value: diagnostico.diag_id,
  }))

  const diagnosticoSelectDisabled =
    isReadOnly || !tipoSelecionadoExigeVinculo || tipoMedicamentoSelecionadoQuery.isPending
  const bonameSelectDisabled =
    isReadOnly || !tipoSelecionadoExigeVinculo || tipoMedicamentoSelecionadoQuery.isPending
  const uiPorCaixaDisabled =
    isReadOnly || !tipoSelecionadoExigeVinculo || tipoMedicamentoSelecionadoQuery.isPending
  const diagnosticoSelectLoading = !diagnosticoSelectDisabled && diagnosticosQuery.isFetching
  const bonameSelectLoading = !bonameSelectDisabled && bonamesQuery.isFetching

  const renderRowActions = (rowData: MedicamentoRecord, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Visualizar registro" startIcon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }}>
          Visualizar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`med-view-${rowData.med_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`med-edit-${rowData.med_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`med-delete-${rowData.med_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page medicamentos-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar medicamento por descricao"
              className="boname-page__search-input"
              placeholder="Buscar por descricao, comercial ou Boname"
              value={searchValue}
              onChange={setSearchValue}
              onPressEnter={handleSearch}
            />
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
              <Button appearance="primary" color="green" startIcon={<PlusIcon />} onClick={handleOpenCreate}>
                Novo medicamento
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando medicamentos..."
            description="Consultando o endpoint `GET /parametros/medicamentos/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar medicamentos.'}
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
            title="Nenhum medicamento encontrado"
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar medicamento
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.med_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.med_descr}</strong>
                          <p>{rowData.med_descr_coml}</p>
                        </div>
                        <StatusBadge tone={rowData.med_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.med_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.med_id}</dd>
                        </div>
                        <div>
                          <dt>Unidade</dt>
                          <dd>{rowData.med_und}</dd>
                        </div>
                        <div>
                          <dt>Tipo</dt>
                          <dd>{rowData.med_tipo_codigo}</dd>
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
                    <Column width={64} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="med_id" />
                    </Column>

                    <Column flexGrow={1} minWidth={220}>
                      <HeaderCell>Descricao</HeaderCell>
                      <Cell dataKey="med_descr" />
                    </Column>

                    <Column flexGrow={1} minWidth={220}>
                      <HeaderCell>Descricao comercial</HeaderCell>
                      <Cell dataKey="med_descr_coml" />
                    </Column>

                    <Column width={90} align="center">
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell dataKey="med_und" />
                    </Column>

                    <Column width={96} align="center">
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell dataKey="med_tipo_codigo" />
                    </Column>

                    <Column width={104} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: MedicamentoRecord) => (
                          <StatusBadge tone={rowData.med_ativo === 1 ? 'success' : 'danger'}>
                            {rowData.med_ativo === 1 ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: MedicamentoRecord) => renderRowActions(rowData)}</Cell>
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

      <AppModal
        open={modalMode !== null}
        backdrop="static"
        intent={modalMode === 'create' ? 'create' : modalMode === 'edit' ? 'edit' : 'view'}
        title={
          modalMode === 'create'
            ? 'Novo medicamento'
            : modalMode === 'edit'
              ? 'Editar medicamento'
              : 'Visualizar medicamento'
        }
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura do cadastro selecionado.'
            : 'Preencha os dados cadastrais e confirme a gravacao.'
        }
        intentVisible={false}
        className="boname-page__record-modal medicamentos-page__record-modal"
        loading={isFormLoading}
        onClose={closeFormModal}
        size={isCompactLayout ? 'full' : 'lg'}
        footer={
          modalMode === 'view' ? (
            <Button appearance="primary" onClick={closeFormModal}>
              Fechar
            </Button>
          ) : (
            <>
              <Button appearance="subtle" onClick={closeFormModal}>
                Cancelar
              </Button>
              <Button appearance="primary" loading={saveMutation.isPending} disabled={isFormLoading} onClick={() => void handleSubmit()}>
                Salvar
              </Button>
            </>
          )
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulario de medicamentos">
            <div className="boname-page__form-grid medicamentos-page__form-grid">
              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Identificacao do medicamento">
                <div className="medicamentos-page__form-section-header">
                  <h3>Identificacao</h3>
                  <p>Organize primeiro os dados principais do medicamento para facilitar consulta e manutencao.</p>
                </div>
                <div className="medicamentos-page__form-subgrid">
                  <div className="boname-page__field">
                    <label htmlFor="medicamento-id">ID</label>
                    <Input
                      id="medicamento-id"
                      size="sm"
                      className="boname-page__control"
                      value={String(formValues.med_id)}
                      disabled
                    />
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="medicamento-unidade">Unidade</label>
                    <Input
                      id="medicamento-unidade"
                      size="sm"
                      maxLength={MED_UND_MAX_LENGTH}
                      className={formErrors.med_und ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_und}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        const nextValue = normalizeText(value, MED_UND_MAX_LENGTH)
                        setFormValues((current) => (current.med_und === nextValue ? current : { ...current, med_und: nextValue }))
                        setFormErrors((current) => ({ ...current, med_und: undefined }))
                      }}
                      onBlur={() => {
                        setFormValues((current) => ({
                          ...current,
                          med_und: normalizeTextForSave(current.med_und, MED_UND_MAX_LENGTH),
                        }))
                      }}
                    />
                    {formErrors.med_und ? <span role="alert">{formErrors.med_und}</span> : null}
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="medicamento-descricao">Descricao</label>
                    <Textarea
                      id="medicamento-descricao"
                      rows={3}
                      maxLength={MED_DESCR_MAX_LENGTH}
                      className={formErrors.med_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_descr}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        const nextValue = normalizeText(value, MED_DESCR_MAX_LENGTH)
                        setFormValues((current) => (current.med_descr === nextValue ? current : { ...current, med_descr: nextValue }))
                        setFormErrors((current) => ({ ...current, med_descr: undefined }))
                      }}
                      onBlur={() => {
                        setFormValues((current) => ({
                          ...current,
                          med_descr: normalizeTextForSave(current.med_descr, MED_DESCR_MAX_LENGTH),
                        }))
                      }}
                    />
                    {formErrors.med_descr ? <span role="alert">{formErrors.med_descr}</span> : null}
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label htmlFor="medicamento-descricao-comercial">Descricao comercial</label>
                    <Textarea
                      id="medicamento-descricao-comercial"
                      rows={3}
                      maxLength={MED_DESCR_COML_MAX_LENGTH}
                      className={formErrors.med_descr_coml ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_descr_coml}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        const nextValue = normalizeText(value, MED_DESCR_COML_MAX_LENGTH)
                        setFormValues((current) => (current.med_descr_coml === nextValue ? current : { ...current, med_descr_coml: nextValue }))
                        setFormErrors((current) => ({ ...current, med_descr_coml: undefined }))
                      }}
                      onBlur={() => {
                        setFormValues((current) => ({
                          ...current,
                          med_descr_coml: normalizeTextForSave(current.med_descr_coml, MED_DESCR_COML_MAX_LENGTH),
                        }))
                      }}
                    />
                    {formErrors.med_descr_coml ? <span role="alert">{formErrors.med_descr_coml}</span> : null}
                  </div>
                </div>
              </section>

              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Classificacao do medicamento">
                <div className="medicamentos-page__form-section-header">
                  <h3>Classificacao e diagnostico</h3>
                  <p>Agrupe categoria, tipo e diagnostico no mesmo bloco para leitura operacional mais rapida.</p>
                </div>
                <div className="medicamentos-page__form-subgrid">
                  <div className="boname-page__field">
                    <label id="medicamento-tipo-med-label">Categoria</label>
                    <SelectPicker
                      aria-label="Categoria"
                      aria-labelledby="medicamento-tipo-med-label"
                      block
                      cleanable={false}
                      data={CATEGORIA_OPTIONS}
                      name="med_tipo_med"
                      placeholder="Selecione a categoria"
                      searchable={false}
                      className={formErrors.med_tipo_med ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_tipo_med || null}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        const nextValue = String(value || '')
                        setFormValues((current) => (current.med_tipo_med === nextValue ? current : { ...current, med_tipo_med: nextValue }))
                        setFormErrors((current) => ({ ...current, med_tipo_med: undefined }))
                      }}
                    />
                    {formErrors.med_tipo_med ? <span role="alert">{formErrors.med_tipo_med}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label id="medicamento-tipo-label">Tipo de medicamento</label>
                    <SelectPicker
                      aria-label="Tipo de medicamento"
                      aria-labelledby="medicamento-tipo-label"
                      block
                      cleanable={false}
                      data={tipoOptions}
                      loading={tiposMedicamentosQuery.isPending}
                      name="med_tipo_codigo"
                      placeholder="Selecione o tipo"
                      searchable
                      className={formErrors.med_tipo_codigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_tipo_codigo || null}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        const nextTipoCodigo = String(value || '').trim().toLocaleUpperCase('pt-BR')
                        setFormValues((current) => ({
                          ...current,
                          med_tipo_codigo: nextTipoCodigo,
                          med_diag_id: null,
                          med_bona_codigo: null,
                          med_ui_cx: 0,
                        }))
                        setFormErrors((current) => ({
                          ...current,
                          med_tipo_codigo: undefined,
                          med_diag_id: undefined,
                          med_bona_codigo: undefined,
                          med_ui_cx: undefined,
                        }))
                      }}
                    />
                    {formErrors.med_tipo_codigo ? <span role="alert">{formErrors.med_tipo_codigo}</span> : null}
                    {tiposMedicamentosQuery.isError ? <span role="alert">Falha ao carregar os tipos de medicamentos.</span> : null}
                    {tipoMedicamentoSelecionadoQuery.isError ? <span role="alert">Falha ao validar o vinculo do tipo de medicamento.</span> : null}
                  </div>

                  <div className="boname-page__field boname-page__field--full">
                    <label id="medicamento-diagnostico-label">Diagnostico</label>
                    <SelectPicker
                      aria-label="Diagnostico"
                      aria-labelledby="medicamento-diagnostico-label"
                      block
                      cleanable={false}
                      data={tipoSelecionadoExigeVinculo ? diagnosticoOptions : []}
                      loading={diagnosticoSelectLoading}
                      name="med_diag_id"
                      placeholder="Selecione o diagnostico"
                      searchable
                      className={formErrors.med_diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={effectiveFormValues.med_diag_id}
                      disabled={diagnosticoSelectDisabled}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_diag_id: normalizeNullableId(value as number | null | undefined) }))
                        setFormErrors((current) => ({ ...current, med_diag_id: undefined }))
                      }}
                    />
                    {formErrors.med_diag_id ? <span role="alert">{formErrors.med_diag_id}</span> : null}
                    {diagnosticosQuery.isError ? <span role="alert">Falha ao carregar os diagnosticos.</span> : null}
                  </div>
                </div>
              </section>

              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Vinculo de Boname">
                <div className="medicamentos-page__form-section-header">
                  <h3>Vinculo Boname</h3>
                  <p>Este select fica isolado para destacar a associacao principal do medicamento com o cadastro Boname.</p>
                </div>
                <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--single">
                  <div className="boname-page__field boname-page__field--full">
                    <label id="medicamento-boname-label">Boname</label>
                    <SelectPicker
                      aria-label="Boname"
                      aria-labelledby="medicamento-boname-label"
                      block
                      cleanable={false}
                      data={tipoSelecionadoExigeVinculo ? bonameOptions : []}
                      loading={bonameSelectLoading}
                      name="med_bona_codigo"
                      placeholder="Selecione o Boname"
                      searchable
                      className={formErrors.med_bona_codigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={effectiveFormValues.med_bona_codigo}
                      disabled={bonameSelectDisabled}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_bona_codigo: normalizeNullableCode(value as string | null | undefined) }))
                        setFormErrors((current) => ({ ...current, med_bona_codigo: undefined }))
                      }}
                    />
                    {formErrors.med_bona_codigo ? <span role="alert">{formErrors.med_bona_codigo}</span> : null}
                    {bonamesQuery.isError ? <span role="alert">Falha ao carregar os Bonames.</span> : null}
                  </div>
                </div>
              </section>

              <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Parametros de estoque">
                <div className="medicamentos-page__form-section-header">
                  <h3>Parametros de estoque</h3>
                  <p>Deixe os limites e indicadores no mesmo grupo para leitura numerica objetiva.</p>
                </div>
                <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--metrics">
                  <div className="boname-page__field">
                    <label htmlFor="medicamento-maximo">Estoque maximo</label>
                    <InputNumber
                      id="medicamento-maximo"
                      min={0}
                      controls={false}
                      className={formErrors.med_max ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_max}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_max: Number(value || 0) }))
                        setFormErrors((current) => ({ ...current, med_max: undefined }))
                      }}
                    />
                    {formErrors.med_max ? <span role="alert">{formErrors.med_max}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="medicamento-minimo">Estoque minimo</label>
                    <InputNumber
                      id="medicamento-minimo"
                      min={0}
                      controls={false}
                      className={formErrors.med_min ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_min}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_min: Number(value || 0) }))
                        setFormErrors((current) => ({ ...current, med_min: undefined }))
                      }}
                    />
                    {formErrors.med_min ? <span role="alert">{formErrors.med_min}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="medicamento-ui-cx">UI por caixa</label>
                    <InputNumber
                      id="medicamento-ui-cx"
                      min={0}
                      controls={false}
                      className={formErrors.med_ui_cx ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={effectiveFormValues.med_ui_cx}
                      disabled={uiPorCaixaDisabled}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_ui_cx: Number(value || 0) }))
                        setFormErrors((current) => ({ ...current, med_ui_cx: undefined }))
                      }}
                    />
                    {formErrors.med_ui_cx ? <span role="alert">{formErrors.med_ui_cx}</span> : null}
                  </div>

                  <div className="boname-page__field">
                    <label htmlFor="medicamento-alerta">Alerta</label>
                    <InputNumber
                      id="medicamento-alerta"
                      min={0}
                      controls={false}
                      className={formErrors.med_alert ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                      value={formValues.med_alert}
                      disabled={isReadOnly}
                      onChange={(value) => {
                        setFormValues((current) => ({ ...current, med_alert: Number(value || 0) }))
                        setFormErrors((current) => ({ ...current, med_alert: undefined }))
                      }}
                    />
                    {formErrors.med_alert ? <span role="alert">{formErrors.med_alert}</span> : null}
                  </div>
                </div>
              </section>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset medicamentos-page__status-fieldset">
                <legend>Status do registro</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.med_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.med_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.med_ativo === 1
                        ? 'Registro disponivel para uso operacional no sistema.'
                        : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.med_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, med_ativo: 1 }))}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.med_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.med_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, med_ativo: 0 }))}
                      >
                        Inativar
                      </Button>
                    </div>
                  ) : null}
                </div>
              </fieldset>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default MedicamentosCrudPage
