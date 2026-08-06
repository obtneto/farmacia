import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, Pagination, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
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

export interface TipoMedicamentoRecord {
  tipo_id: number
  tipo_codigo: string
  tipo_descr: string
  tipo_ativo: 0 | 1
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof TipoMedicamentoRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface TiposMedicamentosCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: TipoMedicamentoRecord = {
  tipo_id: 0,
  tipo_codigo: '',
  tipo_descr: '',
  tipo_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const TIPO_CODIGO_MAX_LENGTH = 3
const TIPO_DESCR_MAX_LENGTH = 150

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

function normalizeCodigo(value: string): string {
  return value.slice(0, TIPO_CODIGO_MAX_LENGTH).toLocaleUpperCase('pt-BR')
}

function normalizeDescricao(value: string): string {
  return value.slice(0, TIPO_DESCR_MAX_LENGTH)
}

function normalizeDescricaoForSave(value: string): string {
  return normalizeDescricao(value).trim().toLocaleUpperCase('pt-BR')
}

function validateForm(values: TipoMedicamentoRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.tipo_codigo.trim()) {
    errors.tipo_codigo = 'Informe o codigo do tipo de medicamento.'
  } else if (values.tipo_codigo.length > TIPO_CODIGO_MAX_LENGTH) {
    errors.tipo_codigo = `O codigo deve ter no maximo ${TIPO_CODIGO_MAX_LENGTH} caracteres.`
  }

  if (!values.tipo_descr.trim()) {
    errors.tipo_descr = 'Informe a descricao do tipo de medicamento.'
  } else if (values.tipo_descr.length > TIPO_DESCR_MAX_LENGTH) {
    errors.tipo_descr = `A descricao deve ter no maximo ${TIPO_DESCR_MAX_LENGTH} caracteres.`
  }

  return errors
}

async function requestTiposMedicamentos<T>(
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

async function listarTiposMedicamentos(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<TipoMedicamentoRecord[]> {
  return requestTiposMedicamentos<TipoMedicamentoRecord[]>(
    baseUrl,
    `/parametros/tipos_medicamentos/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarTipoMedicamento(
  baseUrl: string,
  tipoId: number,
  authToken?: string | null,
): Promise<TipoMedicamentoRecord> {
  return requestTiposMedicamentos<TipoMedicamentoRecord>(
    baseUrl,
    `/parametros/tipos_medicamentos/buscar/${tipoId}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarTipoMedicamento(
  baseUrl: string,
  values: TipoMedicamentoRecord,
  authToken?: string | null,
): Promise<void> {
  await requestTiposMedicamentos<unknown>(
    baseUrl,
    '/parametros/tipos_medicamentos/salvar',
    {
      method: 'POST',
      body: JSON.stringify(values),
    },
    authToken,
  )
}

async function excluirTipoMedicamento(
  baseUrl: string,
  tipoId: number,
  authToken?: string | null,
): Promise<void> {
  await requestTiposMedicamentos<unknown>(
    baseUrl,
    `/parametros/tipos_medicamentos/excluir/${tipoId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function TiposMedicamentosCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: TiposMedicamentosCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<TipoMedicamentoRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['tipos-medicamentos-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarTiposMedicamentos(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: TipoMedicamentoRecord) => salvarTipoMedicamento(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Tipo de medicamento salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['tipos-medicamentos-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar tipo de medicamento', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (tipoId: number) => excluirTipoMedicamento(apiBaseUrl, tipoId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Tipo de medicamento excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['tipos-medicamentos-list'] })
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: TipoMedicamentoRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarTipoMedicamento(apiBaseUrl, record.tipo_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar tipo de medicamento', getErrorMessage(error, 'Falha ao carregar o registro.'))
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
      tipo_codigo: normalizeCodigo(formValues.tipo_codigo),
      tipo_descr: normalizeDescricaoForSave(formValues.tipo_descr),
    })
  }

  const handleRequestDelete = async (record: TipoMedicamentoRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.tipo_descr,
      onConfirm: () => deleteMutation.mutateAsync(record.tipo_id),
      subtitle: 'A acao abaixo afeta diretamente o cadastro selecionado.',
      title: 'Confirmar exclusao',
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const renderRowActions = (rowData: TipoMedicamentoRecord, compact = false) => (
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-view-${rowData.tipo_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-edit-${rowData.tipo_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-delete-${rowData.tipo_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page tipos-medicamentos-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar tipo de medicamento por descricao"
              className="boname-page__search-input"
              placeholder="Buscar por descricao ou codigo"
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
                Novo tipo de medicamento
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando tipos de medicamentos..."
            description="Consultando o endpoint `GET /parametros/tipos_medicamentos/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar tipos de medicamentos.'}
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
            title="Nenhum tipo de medicamento encontrado"
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar tipo de medicamento
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
                    <Panel bordered key={rowData.tipo_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.tipo_descr}</strong>
                          <p>{rowData.tipo_codigo}</p>
                        </div>
                        <StatusBadge tone={rowData.tipo_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.tipo_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.tipo_id}</dd>
                        </div>
                        <div>
                          <dt>Codigo</dt>
                          <dd>{rowData.tipo_codigo}</dd>
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
                      <Cell dataKey="tipo_id" />
                    </Column>

                    <Column width={88} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="tipo_codigo" />
                    </Column>

                    <Column flexGrow={1} minWidth={200}>
                      <HeaderCell>Descricao</HeaderCell>
                      <Cell dataKey="tipo_descr" />
                    </Column>

                    <Column width={104} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: TipoMedicamentoRecord) => (
                          <StatusBadge tone={rowData.tipo_ativo === 1 ? 'success' : 'danger'}>
                            {rowData.tipo_ativo === 1 ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: TipoMedicamentoRecord) => renderRowActions(rowData)}</Cell>
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
            ? 'Novo tipo de medicamento'
            : modalMode === 'edit'
              ? 'Editar tipo de medicamento'
              : 'Visualizar tipo de medicamento'
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
          <section className="boname-page__form-panel" aria-label="Formulario de tipos de medicamentos">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="tipo-medicamento-id">ID</label>
                <Input
                  id="tipo-medicamento-id"
                  size="sm"
                  className="boname-page__control"
                  value={String(formValues.tipo_id)}
                  disabled
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="tipo-medicamento-codigo">Codigo</label>
                <Input
                  id="tipo-medicamento-codigo"
                  size="sm"
                  maxLength={TIPO_CODIGO_MAX_LENGTH}
                  className={formErrors.tipo_codigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.tipo_codigo}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextCodigo = normalizeCodigo(value)
                    setFormValues((current) => (current.tipo_codigo === nextCodigo ? current : { ...current, tipo_codigo: nextCodigo }))
                    setFormErrors((current) => ({ ...current, tipo_codigo: undefined }))
                  }}
                />
                {formErrors.tipo_codigo ? <span role="alert">{formErrors.tipo_codigo}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="tipo-medicamento-descricao">Descricao</label>
                <Input
                  id="tipo-medicamento-descricao"
                  size="sm"
                  maxLength={TIPO_DESCR_MAX_LENGTH}
                  className={formErrors.tipo_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.tipo_descr}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextDescription = normalizeDescricao(value)
                    setFormValues((current) =>
                      current.tipo_descr === nextDescription ? current : { ...current, tipo_descr: nextDescription },
                    )
                    setFormErrors((current) => ({ ...current, tipo_descr: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      tipo_descr: normalizeDescricaoForSave(current.tipo_descr),
                    }))
                  }}
                />
                {formErrors.tipo_descr ? <span role="alert">{formErrors.tipo_descr}</span> : null}
              </div>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                <legend>Status do registro</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.tipo_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.tipo_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.tipo_ativo === 1
                        ? 'Registro disponivel para uso operacional no sistema.'
                        : 'Registro mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.tipo_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, tipo_ativo: 1 }))}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.tipo_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.tipo_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, tipo_ativo: 0 }))}
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

export default TiposMedicamentosCrudPage
