import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, Textarea, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { Table as AppTable, type TableColumn } from '../../components/Table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { useTablePagination } from '../../hook/useTablePagination'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

export interface DiagnosticoRecord {
  diag_id: number
  diag_descr: string
  diag_ativo: 0 | 1
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof DiagnosticoRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface DiagnosticosCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: DiagnosticoRecord = {
  diag_id: 0,
  diag_descr: '',
  diag_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const DIAGNOSTICO_DESCR_MAX_LENGTH = 255

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

function normalizeDiagnosticoDescription(value: string): string {
  return value.slice(0, DIAGNOSTICO_DESCR_MAX_LENGTH)
}

function normalizeDiagnosticoDescriptionForSave(value: string): string {
  return normalizeDiagnosticoDescription(value).trim().toLocaleUpperCase('pt-BR')
}

function validateForm(values: DiagnosticoRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.diag_descr.trim()) {
    errors.diag_descr = 'Informe a descricao do diagnostico.'
  } else if (values.diag_descr.length > DIAGNOSTICO_DESCR_MAX_LENGTH) {
    errors.diag_descr = `A descricao deve ter no maximo ${DIAGNOSTICO_DESCR_MAX_LENGTH} caracteres.`
  }

  return errors
}

async function requestDiagnosticos<T>(
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

async function listarDiagnosticos(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<DiagnosticoRecord[]> {
  return requestDiagnosticos<DiagnosticoRecord[]>(
    baseUrl,
    `/parametros/diagnosticos/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarDiagnostico(
  baseUrl: string,
  diagId: number,
  authToken?: string | null,
): Promise<DiagnosticoRecord> {
  return requestDiagnosticos<DiagnosticoRecord>(
    baseUrl,
    `/parametros/diagnosticos/buscar/${diagId}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarDiagnostico(
  baseUrl: string,
  values: DiagnosticoRecord,
  authToken?: string | null,
): Promise<void> {
  await requestDiagnosticos<unknown>(
    baseUrl,
    '/parametros/diagnosticos/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirDiagnostico(baseUrl: string, diagId: number, authToken?: string | null): Promise<void> {
  await requestDiagnosticos<unknown>(
    baseUrl,
    `/parametros/diagnosticos/excluir/${diagId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function DiagnosticosCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: DiagnosticosCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<DiagnosticoRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['diagnosticos-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarDiagnosticos(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: DiagnosticoRecord) => salvarDiagnostico(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Diagnostico salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['diagnosticos-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar Diagnostico', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (diagId: number) => excluirDiagnostico(apiBaseUrl, diagId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Diagnostico excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['diagnosticos-list'] })
    },
  })

  const records = listQuery.data ?? []
  const pagination = useTablePagination(records, { initialLimit: PAGE_SIZE })
  const hasData = records.length > 0
  const isReadOnly = modalMode === 'view'

  const handleSearch = () => {
    setSubmittedSearch(normalizeSearchTerm(searchValue))
    pagination.resetPage()
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: DiagnosticoRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarDiagnostico(apiBaseUrl, record.diag_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar Diagnostico', getErrorMessage(error, 'Falha ao carregar o diagnostico.'))
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
      diag_descr: normalizeDiagnosticoDescriptionForSave(formValues.diag_descr),
    })
  }

  const handleRequestDelete = async (record: DiagnosticoRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.diag_descr,
      onConfirm: () => deleteMutation.mutateAsync(record.diag_id),
      subtitle: 'A acao abaixo afeta diretamente o cadastro selecionado.',
      title: 'Confirmar exclusao',
    })
  }

  const tableLabelStart = hasData ? pagination.startIndex + 1 : 0
  const tableLabelEnd = hasData ? pagination.startIndex + pagination.paginatedData.length : 0

  const renderRowActions = (rowData: DiagnosticoRecord, compact = false) => (
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`diag-view-${rowData.diag_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`diag-edit-${rowData.diag_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`diag-delete-${rowData.diag_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  const diagnosticoColumns: TableColumn<DiagnosticoRecord>[] = [
    {
      align: 'center',
      header: 'ID',
      key: 'diag_id',
      size: 'xs',
    },
    {
      header: 'Descricao',
      key: 'diag_descr',
      size: 'fluid',
    },
    {
      align: 'center',
      header: 'Status',
      key: 'diag_ativo',
      render: (rowData) => (
        <StatusBadge tone={rowData.diag_ativo === 1 ? 'success' : 'danger'}>
          {rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      ),
      size: 'sm',
    },
    {
      align: 'center',
      header: 'Acoes',
      id: 'actions',
      key: 'diag_id',
      render: (rowData) => renderRowActions(rowData),
      size: 'actions',
    },
  ]

  return (
    <section className="boname-page diagnosticos-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar diagnostico por descricao"
              className="boname-page__search-input"
              placeholder="Buscar por descricao"
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
                Novo Diagnostico
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando Diagnosticos..."
            description="Consultando o endpoint `GET /parametros/diagnosticos/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar diagnosticos.'}
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
            title="Nenhum diagnostico encontrado"
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar diagnostico
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {pagination.paginatedData.map((rowData) => (
                    <Panel bordered key={rowData.diag_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.diag_descr}</strong>
                        </div>
                        <StatusBadge tone={rowData.diag_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.diag_id}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{rowData.diag_ativo === 1 ? 'Ativo' : 'Inativo'}</dd>
                        </div>
                      </dl>

                      {renderRowActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <AppTable columns={diagnosticoColumns} data={pagination.tableData} rowKey="diag_id" />
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de{' '}
                <strong>{records.length}</strong> registros.
              </p>
              <Pagination
                activePage={pagination.activePage}
                boundaryLinks
                ellipsis
                first
                last
                limit={pagination.limit}
                layout={['pager']}
                maxButtons={5}
                next
                prev
                size={isCompactLayout ? 'sm' : 'md'}
                total={pagination.total}
                onChangePage={pagination.onChangePage}
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
          modalMode === 'create' ? 'Novo Diagnostico' : modalMode === 'edit' ? 'Editar Diagnostico' : 'Visualizar Diagnostico'
        }
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura do cadastro selecionado.'
            : 'Preencha os dados cadastrais e confirme a gravacao.'
        }
        intentVisible={false}
        className="boname-page__record-modal"
        loading={isFormLoading}
        onClose={closeFormModal}
        size={isCompactLayout ? 'full' : 'md'}
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
          <section className="boname-page__form-panel" aria-label="Formulario de diagnostico">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="diagnostico-id">ID</label>
                <InputNumber
                  id="diagnostico-id"
                  min={0}
                  size="sm"
                  controls={false}
                  className={formErrors.diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.diag_id}
                  disabled
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, diag_id: Number(value || 0) }))
                  }}
                />
                {formErrors.diag_id ? <span role="alert">{formErrors.diag_id}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="diagnostico-descricao">Descricao</label>
                <Textarea
                  id="diagnostico-descricao"
                  rows={3}
                  maxLength={DIAGNOSTICO_DESCR_MAX_LENGTH}
                  className={formErrors.diag_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.diag_descr}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextDescription = normalizeDiagnosticoDescription(value)
                    setFormValues((current) =>
                      current.diag_descr === nextDescription ? current : { ...current, diag_descr: nextDescription },
                    )
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      diag_descr: normalizeDiagnosticoDescriptionForSave(current.diag_descr),
                    }))
                  }}
                />
                {formErrors.diag_descr ? <span role="alert">{formErrors.diag_descr}</span> : null}
              </div>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                <legend>Status do registro</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.diag_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.diag_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.diag_ativo === 1
                        ? 'Registro disponivel para uso nas integracoes.'
                        : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.diag_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, diag_ativo: 1 }))}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.diag_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.diag_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, diag_ativo: 0 }))}
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

export default DiagnosticosCrudPage
