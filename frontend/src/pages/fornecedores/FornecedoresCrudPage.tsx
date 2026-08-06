import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
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

export interface FornecedorRecord {
  for_ativo: 0 | 1
  for_bairro: string
  for_cidade: string
  for_cnpj: string
  for_email: string
  for_id: number
  for_logradouro: string
  for_nome_fantasia: string
  for_numero: string
  for_razao_social: string
  for_telefone: string
  for_uf: string
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof FornecedorRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface FornecedoresCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: FornecedorRecord = {
  for_ativo: 1,
  for_bairro: '',
  for_cidade: '',
  for_cnpj: '',
  for_email: '',
  for_id: 0,
  for_logradouro: '',
  for_nome_fantasia: '',
  for_numero: '',
  for_razao_social: '',
  for_telefone: '',
  for_uf: '',
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const MAX_LENGTHS = {
  bairro: 80,
  cidade: 80,
  cnpj: 14,
  email: 120,
  logradouro: 120,
  nomeFantasia: 80,
  numero: 10,
  razaoSocial: 120,
  telefone: 11,
  uf: 2,
} as const

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

function toTextValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeDigits(value: unknown, maxLength: number): string {
  return toTextValue(value).replace(/\D/g, '').slice(0, maxLength)
}

function normalizeUppercase(value: unknown, maxLength: number): string {
  return toTextValue(value).slice(0, maxLength)
}

function normalizeUppercaseForSave(value: unknown, maxLength: number): string {
  return normalizeUppercase(value, maxLength).trim().toLocaleUpperCase('pt-BR')
}

function normalizeEmail(value: unknown): string {
  return toTextValue(value).slice(0, MAX_LENGTHS.email)
}

function normalizeEmailForSave(value: string): string {
  return normalizeEmail(value).trim().toLocaleLowerCase('pt-BR')
}

function formatCnpj(value: unknown): string {
  const digits = normalizeDigits(value, MAX_LENGTHS.cnpj)

  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function formatTelefone(value: unknown): string {
  const digits = normalizeDigits(value, MAX_LENGTHS.telefone)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function isValidCnpj(value: unknown): boolean {
  const digits = normalizeDigits(value, MAX_LENGTHS.cnpj)

  if (digits.length !== MAX_LENGTHS.cnpj || /^(\d)\1{13}$/.test(digits)) {
    return false
  }

  let length = 12
  let numbers = digits.slice(0, length)
  let sum = 0
  let pos = length - 7

  for (let index = length; index >= 1; index -= 1) {
    sum += Number(numbers.charAt(length - index)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  if (result !== Number(digits.charAt(12))) {
    return false
  }

  length = 13
  numbers = digits.slice(0, length)
  sum = 0
  pos = length - 7

  for (let index = length; index >= 1; index -= 1) {
    sum += Number(numbers.charAt(length - index)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)

  return result === Number(digits.charAt(13))
}

function buildCityStateLabel(record: FornecedorRecord): string {
  const city = toTextValue(record.for_cidade).trim()
  const state = toTextValue(record.for_uf).trim()

  if (city && state) {
    return `${city} / ${state}`
  }

  return city || state || '-'
}

function validateForm(values: FornecedorRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.for_razao_social.trim()) {
    errors.for_razao_social = 'Informe a razao social.'
  }

  if (!values.for_nome_fantasia.trim()) {
    errors.for_nome_fantasia = 'Informe o nome fantasia.'
  }

  if (values.for_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.for_email.trim())) {
    errors.for_email = 'Informe um e-mail valido.'
  }

  if (values.for_cnpj.trim() && !isValidCnpj(values.for_cnpj)) {
    errors.for_cnpj = 'Informe um CNPJ valido.'
  }

  if (!values.for_telefone.trim()) {
    errors.for_telefone = 'Informe o telefone.'
  } else {
    const telefoneLength = normalizeDigits(values.for_telefone, MAX_LENGTHS.telefone).length

    if (telefoneLength < 10 || telefoneLength > MAX_LENGTHS.telefone) {
      errors.for_telefone = 'Informe um telefone com DDD valido.'
    }
  }

  if (values.for_ativo !== 0 && values.for_ativo !== 1) {
    errors.for_ativo = 'Informe o status do fornecedor.'
  }

  if (values.for_uf.trim() && values.for_uf.trim().length !== 2) {
    errors.for_uf = 'A UF deve conter 2 caracteres.'
  }

  return errors
}

function sanitizeFornecedorRecord(record: Partial<FornecedorRecord> | null | undefined): FornecedorRecord {
  return {
    for_ativo: Number(record?.for_ativo) === 1 ? 1 : 0,
    for_bairro: toTextValue(record?.for_bairro),
    for_cidade: toTextValue(record?.for_cidade),
    for_cnpj: normalizeDigits(record?.for_cnpj, MAX_LENGTHS.cnpj),
    for_email: toTextValue(record?.for_email),
    for_id: Number(record?.for_id || 0),
    for_logradouro: toTextValue(record?.for_logradouro),
    for_nome_fantasia: toTextValue(record?.for_nome_fantasia),
    for_numero: toTextValue(record?.for_numero),
    for_razao_social: toTextValue(record?.for_razao_social),
    for_telefone: normalizeDigits(record?.for_telefone, MAX_LENGTHS.telefone),
    for_uf: toTextValue(record?.for_uf),
  }
}

async function requestFornecedores<T>(
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

async function listarFornecedores(baseUrl: string, searchTerm: string, authToken?: string | null): Promise<FornecedorRecord[]> {
  const records = await requestFornecedores<FornecedorRecord[]>(
    baseUrl,
    `/parametros/fornecedores/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )

  return records.map((record) => sanitizeFornecedorRecord(record))
}

async function buscarFornecedor(baseUrl: string, forId: number, authToken?: string | null): Promise<FornecedorRecord> {
  const record = await requestFornecedores<FornecedorRecord>(
    baseUrl,
    `/parametros/fornecedores/buscar/${forId}`,
    { method: 'GET' },
    authToken,
  )

  return sanitizeFornecedorRecord(record)
}

async function salvarFornecedor(baseUrl: string, values: FornecedorRecord, authToken?: string | null): Promise<void> {
  await requestFornecedores<unknown>(
    baseUrl,
    '/parametros/fornecedores/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirFornecedor(baseUrl: string, forId: number, authToken?: string | null): Promise<void> {
  await requestFornecedores<unknown>(
    baseUrl,
    `/parametros/fornecedores/excluir/${forId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function FornecedoresCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: FornecedoresCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<FornecedorRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['fornecedores-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarFornecedores(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: FornecedorRecord) => salvarFornecedor(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Fornecedor salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['fornecedores-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar fornecedor', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (forId: number) => excluirFornecedor(apiBaseUrl, forId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Fornecedor excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['fornecedores-list'] })
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: FornecedorRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarFornecedor(apiBaseUrl, record.for_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar fornecedor', getErrorMessage(error, 'Falha ao carregar o fornecedor.'))
      setModalMode(null)
    } finally {
      if (formRequestIdRef.current === requestId) {
        setIsFormLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    const nextErrors = validateForm(formValues)
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
      ...formValues,
      for_bairro: normalizeUppercaseForSave(formValues.for_bairro, MAX_LENGTHS.bairro),
      for_cidade: normalizeUppercaseForSave(formValues.for_cidade, MAX_LENGTHS.cidade),
      for_cnpj: normalizeDigits(formValues.for_cnpj, MAX_LENGTHS.cnpj),
      for_email: normalizeEmailForSave(formValues.for_email),
      for_logradouro: normalizeUppercaseForSave(formValues.for_logradouro, MAX_LENGTHS.logradouro),
      for_nome_fantasia: normalizeUppercaseForSave(formValues.for_nome_fantasia, MAX_LENGTHS.nomeFantasia),
      for_numero: normalizeUppercaseForSave(formValues.for_numero, MAX_LENGTHS.numero),
      for_razao_social: normalizeUppercaseForSave(formValues.for_razao_social, MAX_LENGTHS.razaoSocial),
      for_telefone: normalizeDigits(formValues.for_telefone, MAX_LENGTHS.telefone),
      for_uf: normalizeUppercaseForSave(formValues.for_uf, MAX_LENGTHS.uf),
    })
  }

  const handleRequestDelete = async (record: FornecedorRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.for_razao_social,
      onConfirm: () => deleteMutation.mutateAsync(record.for_id),
      subtitle: 'A acao abaixo afeta diretamente o cadastro selecionado.',
      title: 'Confirmar exclusao',
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const renderRowActions = (rowData: FornecedorRecord, compact = false) => (
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`fornecedor-view-${rowData.for_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`fornecedor-edit-${rowData.for_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`fornecedor-delete-${rowData.for_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page fornecedores-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar fornecedor por razao social, nome fantasia ou CNPJ"
              className="boname-page__search-input"
              placeholder="Buscar por razao social, fantasia ou CNPJ"
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
                Novo Fornecedor
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando fornecedores..."
            description="Consultando o endpoint `GET /parametros/fornecedores/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar fornecedores.'}
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
            title="Nenhum fornecedor encontrado"
            description="Cadastre um novo fornecedor para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar fornecedor
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
                    <Panel bordered key={rowData.for_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.for_razao_social}</strong>
                          {rowData.for_nome_fantasia ? <p>{rowData.for_nome_fantasia}</p> : null}
                        </div>
                        <StatusBadge tone={rowData.for_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.for_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>CNPJ</dt>
                          <dd>{formatCnpj(rowData.for_cnpj) || '-'}</dd>
                        </div>
                        <div>
                          <dt>Cidade</dt>
                          <dd>{buildCityStateLabel(rowData)}</dd>
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
                      <Cell dataKey="for_id" />
                    </Column>

                    <Column flexGrow={1.3} minWidth={240}>
                      <HeaderCell>Razao social</HeaderCell>
                      <Cell dataKey="for_razao_social" />
                    </Column>

                    <Column flexGrow={1} minWidth={200}>
                      <HeaderCell>Nome fantasia</HeaderCell>
                      <Cell dataKey="for_nome_fantasia" />
                    </Column>

                    <Column width={160}>
                      <HeaderCell>CNPJ</HeaderCell>
                      <Cell>
                        {(rowData: FornecedorRecord) => formatCnpj(rowData.for_cnpj) || '-'}
                      </Cell>
                    </Column>

                    <Column width={150}>
                      <HeaderCell>Cidade / UF</HeaderCell>
                      <Cell>
                        {(rowData: FornecedorRecord) => buildCityStateLabel(rowData)}
                      </Cell>
                    </Column>

                    <Column width={104} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: FornecedorRecord) => (
                          <StatusBadge tone={rowData.for_ativo === 1 ? 'success' : 'danger'}>
                            {rowData.for_ativo === 1 ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: FornecedorRecord) => renderRowActions(rowData)}</Cell>
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
        title={modalMode === 'create' ? 'Novo Fornecedor' : modalMode === 'edit' ? 'Editar Fornecedor' : 'Visualizar Fornecedor'}
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura do cadastro selecionado.'
            : 'Preencha os dados cadastrais e confirme a gravacao.'
        }
        intentVisible={false}
        className="boname-page__record-modal"
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
          <section className="boname-page__form-panel" aria-label="Formulario de fornecedor">
            <div className="boname-page__form-grid fornecedores-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="fornecedor-id">ID</label>
                <InputNumber
                  id="fornecedor-id"
                  min={0}
                  size="sm"
                  controls={false}
                  className="boname-page__control"
                  value={formValues.for_id}
                  disabled
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, for_id: Number(value || 0) }))
                  }}
                />
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="fornecedor-razao-social">Razao social *</label>
                <Input
                  id="fornecedor-razao-social"
                  size="sm"
                  maxLength={MAX_LENGTHS.razaoSocial}
                  className={formErrors.for_razao_social ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.for_razao_social}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.razaoSocial)
                    setFormValues((current) => (current.for_razao_social === nextValue ? current : { ...current, for_razao_social: nextValue }))
                    setFormErrors((current) => ({ ...current, for_razao_social: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_razao_social: normalizeUppercaseForSave(current.for_razao_social, MAX_LENGTHS.razaoSocial),
                    }))
                  }}
                />
                {formErrors.for_razao_social ? <span role="alert">{formErrors.for_razao_social}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="fornecedor-nome-fantasia">Nome fantasia *</label>
                <Input
                  id="fornecedor-nome-fantasia"
                  size="sm"
                  maxLength={MAX_LENGTHS.nomeFantasia}
                  className={formErrors.for_nome_fantasia ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.for_nome_fantasia}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.nomeFantasia)
                    setFormValues((current) => (current.for_nome_fantasia === nextValue ? current : { ...current, for_nome_fantasia: nextValue }))
                    setFormErrors((current) => ({ ...current, for_nome_fantasia: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_nome_fantasia: normalizeUppercaseForSave(current.for_nome_fantasia, MAX_LENGTHS.nomeFantasia),
                    }))
                  }}
                />
                {formErrors.for_nome_fantasia ? <span role="alert">{formErrors.for_nome_fantasia}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="fornecedor-cnpj">CNPJ</label>
                <Input
                  id="fornecedor-cnpj"
                  size="sm"
                  inputMode="numeric"
                  maxLength={18}
                  className={formErrors.for_cnpj ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formatCnpj(formValues.for_cnpj)}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeDigits(value, MAX_LENGTHS.cnpj)
                    setFormValues((current) => (current.for_cnpj === nextValue ? current : { ...current, for_cnpj: nextValue }))
                    setFormErrors((current) => ({ ...current, for_cnpj: undefined }))
                  }}
                />
                {formErrors.for_cnpj ? <span role="alert">{formErrors.for_cnpj}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="fornecedor-telefone">Telefone *</label>
                <Input
                  id="fornecedor-telefone"
                  size="sm"
                  inputMode="numeric"
                  maxLength={15}
                  className={formErrors.for_telefone ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formatTelefone(formValues.for_telefone)}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeDigits(value, MAX_LENGTHS.telefone)
                    setFormValues((current) => (current.for_telefone === nextValue ? current : { ...current, for_telefone: nextValue }))
                    setFormErrors((current) => ({ ...current, for_telefone: undefined }))
                  }}
                />
                {formErrors.for_telefone ? <span role="alert">{formErrors.for_telefone}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="fornecedor-email">E-mail</label>
                <Input
                  id="fornecedor-email"
                  size="sm"
                  type="email"
                  maxLength={MAX_LENGTHS.email}
                  className={formErrors.for_email ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.for_email}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeEmail(value)
                    setFormValues((current) => (current.for_email === nextValue ? current : { ...current, for_email: nextValue }))
                    setFormErrors((current) => ({ ...current, for_email: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_email: normalizeEmailForSave(current.for_email),
                    }))
                  }}
                />
                {formErrors.for_email ? <span role="alert">{formErrors.for_email}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="fornecedor-logradouro">Logradouro</label>
                <Input
                  id="fornecedor-logradouro"
                  size="sm"
                  maxLength={MAX_LENGTHS.logradouro}
                  className="boname-page__control"
                  value={formValues.for_logradouro}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.logradouro)
                    setFormValues((current) => (current.for_logradouro === nextValue ? current : { ...current, for_logradouro: nextValue }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_logradouro: normalizeUppercaseForSave(current.for_logradouro, MAX_LENGTHS.logradouro),
                    }))
                  }}
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="fornecedor-numero">Numero</label>
                <Input
                  id="fornecedor-numero"
                  size="sm"
                  maxLength={MAX_LENGTHS.numero}
                  className="boname-page__control"
                  value={formValues.for_numero}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.numero)
                    setFormValues((current) => (current.for_numero === nextValue ? current : { ...current, for_numero: nextValue }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_numero: normalizeUppercaseForSave(current.for_numero, MAX_LENGTHS.numero),
                    }))
                  }}
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="fornecedor-uf">UF</label>
                <Input
                  id="fornecedor-uf"
                  size="sm"
                  maxLength={MAX_LENGTHS.uf}
                  className={formErrors.for_uf ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.for_uf}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.uf)
                    setFormValues((current) => (current.for_uf === nextValue ? current : { ...current, for_uf: nextValue }))
                    setFormErrors((current) => ({ ...current, for_uf: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_uf: normalizeUppercaseForSave(current.for_uf, MAX_LENGTHS.uf),
                    }))
                  }}
                />
                {formErrors.for_uf ? <span role="alert">{formErrors.for_uf}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="fornecedor-bairro">Bairro</label>
                <Input
                  id="fornecedor-bairro"
                  size="sm"
                  maxLength={MAX_LENGTHS.bairro}
                  className="boname-page__control"
                  value={formValues.for_bairro}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.bairro)
                    setFormValues((current) => (current.for_bairro === nextValue ? current : { ...current, for_bairro: nextValue }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_bairro: normalizeUppercaseForSave(current.for_bairro, MAX_LENGTHS.bairro),
                    }))
                  }}
                />
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="fornecedor-cidade">Cidade</label>
                <Input
                  id="fornecedor-cidade"
                  size="sm"
                  maxLength={MAX_LENGTHS.cidade}
                  className="boname-page__control"
                  value={formValues.for_cidade}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextValue = normalizeUppercase(value, MAX_LENGTHS.cidade)
                    setFormValues((current) => (current.for_cidade === nextValue ? current : { ...current, for_cidade: nextValue }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      for_cidade: normalizeUppercaseForSave(current.for_cidade, MAX_LENGTHS.cidade),
                    }))
                  }}
                />
              </div>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                <legend>Status do registro *</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.for_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.for_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.for_ativo === 1
                        ? 'Registro disponivel para uso operacional no sistema.'
                        : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.for_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => {
                          setFormValues((current) => ({ ...current, for_ativo: 1 }))
                          setFormErrors((current) => ({ ...current, for_ativo: undefined }))
                        }}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.for_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.for_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => {
                          setFormValues((current) => ({ ...current, for_ativo: 0 }))
                          setFormErrors((current) => ({ ...current, for_ativo: undefined }))
                        }}
                      >
                        Inativar
                      </Button>
                    </div>
                  ) : null}
                </div>
                {formErrors.for_ativo ? <span role="alert">{formErrors.for_ativo}</span> : null}
              </fieldset>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default FornecedoresCrudPage
