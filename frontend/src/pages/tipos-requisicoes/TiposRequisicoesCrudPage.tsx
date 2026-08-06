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
import { AppModal, DataState, PageSection } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

export interface TipoRequisicaoRecord {
  tip_id: number
  tip_codigo: string
  tip_descr: string
}

interface RawTipoRequisicaoRecord {
  tip_id?: number
  tip_req_id?: number
  tip_codigo?: string
  tip_req_codigo?: string
  tip_descr?: string
  tip_req_descr?: string
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof TipoRequisicaoRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface TiposRequisicoesCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: TipoRequisicaoRecord = {
  tip_id: 0,
  tip_codigo: '',
  tip_descr: '',
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const TIP_CODIGO_MAX_LENGTH = 3
const TIP_DESCR_MAX_LENGTH = 150

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

function normalizeTipCodigo(value: string): string {
  return value.slice(0, TIP_CODIGO_MAX_LENGTH).toLocaleUpperCase('pt-BR')
}

function normalizeTipDescricao(value: string): string {
  return value.slice(0, TIP_DESCR_MAX_LENGTH)
}

function normalizeTipDescricaoForSave(value: string): string {
  return normalizeTipDescricao(value).trim().toLocaleUpperCase('pt-BR')
}

function normalizeTipoRequisicaoRecord(record: RawTipoRequisicaoRecord): TipoRequisicaoRecord {
  return {
    tip_id: Number(record.tip_id ?? record.tip_req_id ?? 0),
    tip_codigo: String(record.tip_codigo ?? record.tip_req_codigo ?? ''),
    tip_descr: String(record.tip_descr ?? record.tip_req_descr ?? ''),
  }
}

function validateForm(values: TipoRequisicaoRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.tip_codigo.trim()) {
    errors.tip_codigo = 'Informe o codigo do tipo de requisicao.'
  } else if (values.tip_codigo.length > TIP_CODIGO_MAX_LENGTH) {
    errors.tip_codigo = `O codigo deve ter no maximo ${TIP_CODIGO_MAX_LENGTH} caracteres.`
  }

  if (!values.tip_descr.trim()) {
    errors.tip_descr = 'Informe a descricao do tipo de requisicao.'
  } else if (values.tip_descr.length > TIP_DESCR_MAX_LENGTH) {
    errors.tip_descr = `A descricao deve ter no maximo ${TIP_DESCR_MAX_LENGTH} caracteres.`
  }

  return errors
}

async function requestTiposRequisicoes<T>(
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

async function listarTiposRequisicoes(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<TipoRequisicaoRecord[]> {
  const rawRecords = await requestTiposRequisicoes<RawTipoRequisicaoRecord[]>(
    baseUrl,
    '/parametros/tipos_requisicoes/listar',
    { method: 'GET' },
    authToken,
  )
  const records = rawRecords.map(normalizeTipoRequisicaoRecord)

  if (searchTerm === '*') {
    return records
  }

  const normalizedSearchTerm = searchTerm.toLocaleUpperCase('pt-BR')
  return records.filter((record) =>
    record.tip_codigo.toLocaleUpperCase('pt-BR').includes(normalizedSearchTerm)
    || record.tip_descr.toLocaleUpperCase('pt-BR').includes(normalizedSearchTerm),
  )
}

async function salvarTipoRequisicao(
  baseUrl: string,
  values: TipoRequisicaoRecord,
  authToken?: string | null,
): Promise<void> {
  await requestTiposRequisicoes<unknown>(
    baseUrl,
    '/parametros/tipos_requisicoes/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        id_tipo: values.tip_id,
        cod_tipo: values.tip_codigo,
        tipo_req_descr: values.tip_descr,
      }),
    },
    authToken,
  )
}

async function excluirTipoRequisicao(
  baseUrl: string,
  tipoId: number,
  authToken?: string | null,
): Promise<void> {
  await requestTiposRequisicoes<unknown>(
    baseUrl,
    `/parametros/tipos_requisicoes/excluir/${tipoId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function TiposRequisicoesCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: TiposRequisicoesCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<TipoRequisicaoRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['tipos-requisicoes-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarTiposRequisicoes(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: TipoRequisicaoRecord) => salvarTipoRequisicao(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Tipo de requisicao salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['tipos-requisicoes-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar tipo de requisicao', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (tipoId: number) => excluirTipoRequisicao(apiBaseUrl, tipoId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Tipo de requisicao excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['tipos-requisicoes-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao excluir tipo de requisicao', getErrorMessage(error))
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: TipoRequisicaoRecord) => {
    formRequestIdRef.current += 1
    setModalMode(mode)
    setFormErrors({})
    setFormValues(record)
    setIsFormLoading(false)
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

    try {
      await saveMutation.mutateAsync({
        ...formValues,
        tip_codigo: normalizeTipCodigo(formValues.tip_codigo),
        tip_descr: normalizeTipDescricaoForSave(formValues.tip_descr),
      })
    } catch {
      // The mutation onError callback already surfaces the failure to the user.
    }
  }

  const handleRequestDelete = async (record: TipoRequisicaoRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.tip_descr,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(record.tip_id)
        } catch {
          // The mutation onError callback already surfaces the failure to the user.
        }
      },
      subtitle: 'A acao abaixo afeta diretamente o cadastro selecionado.',
      title: 'Confirmar exclusao',
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const renderRowActions = (rowData: TipoRequisicaoRecord, compact = false) => (
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-view-${rowData.tip_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-edit-${rowData.tip_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`tipo-delete-${rowData.tip_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page tipos-requisicoes-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar tipo de requisicao por descricao"
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
                Novo tipo de requisicao
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando tipos de requisicoes..."
            description="Consultando o endpoint `GET /parametros/tipos_requisicoes/listar`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar tipos de requisicoes.'}
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
            title="Nenhum tipo de requisicao encontrado"
            description="Cadastre um novo registro para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar tipo de requisicao
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
                    <Panel bordered key={rowData.tip_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.tip_descr}</strong>
                          <p>{rowData.tip_codigo}</p>
                        </div>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.tip_id}</dd>
                        </div>
                        <div>
                          <dt>Codigo</dt>
                          <dd>{rowData.tip_codigo}</dd>
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
                      <Cell dataKey="tip_id" />
                    </Column>

                    <Column width={88} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="tip_codigo" />
                    </Column>

                    <Column flexGrow={1} minWidth={200}>
                      <HeaderCell>Descricao</HeaderCell>
                      <Cell dataKey="tip_descr" />
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: TipoRequisicaoRecord) => renderRowActions(rowData)}</Cell>
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
            ? 'Novo tipo de requisicao'
            : modalMode === 'edit'
              ? 'Editar tipo de requisicao'
              : 'Visualizar tipo de requisicao'
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
          <section className="boname-page__form-panel" aria-label="Formulario de tipos de requisicoes">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="tipo-requisicao-id">ID</label>
                <Input
                  id="tipo-requisicao-id"
                  size="sm"
                  className="boname-page__control"
                  value={String(formValues.tip_id)}
                  disabled
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="tipo-requisicao-codigo">Codigo</label>
                <Input
                  id="tipo-requisicao-codigo"
                  size="sm"
                  maxLength={TIP_CODIGO_MAX_LENGTH}
                  className={formErrors.tip_codigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.tip_codigo}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextCodigo = normalizeTipCodigo(value)
                    setFormValues((current) => (current.tip_codigo === nextCodigo ? current : { ...current, tip_codigo: nextCodigo }))
                    setFormErrors((current) => ({ ...current, tip_codigo: undefined }))
                  }}
                />
                {formErrors.tip_codigo ? <span role="alert">{formErrors.tip_codigo}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="tipo-requisicao-descricao">Descricao</label>
                <Input
                  id="tipo-requisicao-descricao"
                  size="sm"
                  maxLength={TIP_DESCR_MAX_LENGTH}
                  className={formErrors.tip_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.tip_descr}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextDescription = normalizeTipDescricao(value)
                    setFormValues((current) =>
                      current.tip_descr === nextDescription ? current : { ...current, tip_descr: nextDescription },
                    )
                    setFormErrors((current) => ({ ...current, tip_descr: undefined }))
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      tip_descr: normalizeTipDescricaoForSave(current.tip_descr),
                    }))
                  }}
                />
                {formErrors.tip_descr ? <span role="alert">{formErrors.tip_descr}</span> : null}
              </div>

            </div>
          </section>
        </div>
      </AppModal>

    </section>
  )
}

export default TiposRequisicoesCrudPage
