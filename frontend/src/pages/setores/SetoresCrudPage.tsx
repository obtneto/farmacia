import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, Textarea, Tooltip, useMediaQuery, Whisper } from 'rsuite'
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

export interface SetorRecord {
  set_id: number
  set_descr: string
  set_ativo: 0 | 1
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormErrors = Partial<Record<keyof SetorRecord, string>>
type FormMode = 'create' | 'edit' | 'view'

export interface SetoresCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: SetorRecord = {
  set_id: 0,
  set_descr: '',
  set_ativo: 1,
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 11
const SETOR_DESCR_MAX_LENGTH = 150

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

function normalizeSetorDescription(value: string): string {
  return value.slice(0, SETOR_DESCR_MAX_LENGTH)
}

function normalizeSetorDescriptionForSave(value: string): string {
  return normalizeSetorDescription(value).trim().toLocaleUpperCase('pt-BR')
}

function validateForm(values: SetorRecord): FormErrors {
  const errors: FormErrors = {}

  if (!values.set_descr.trim()) {
    errors.set_descr = 'Informe a descricao do setor.'
  } else if (values.set_descr.length > SETOR_DESCR_MAX_LENGTH) {
    errors.set_descr = `A descricao deve ter no maximo ${SETOR_DESCR_MAX_LENGTH} caracteres.`
  }

  return errors
}

async function requestSetores<T>(
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

async function listarSetores(
  baseUrl: string,
  searchTerm: string,
  authToken?: string | null,
): Promise<SetorRecord[]> {
  return requestSetores<SetorRecord[]>(
    baseUrl,
    `/parametros/setores/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
}

async function buscarSetor(
  baseUrl: string,
  setorId: number,
  authToken?: string | null,
): Promise<SetorRecord> {
  return requestSetores<SetorRecord>(
    baseUrl,
    `/parametros/setores/buscar/${setorId}`,
    { method: 'GET' },
    authToken,
  )
}

async function salvarSetor(
  baseUrl: string,
  values: SetorRecord,
  authToken?: string | null,
): Promise<void> {
  await requestSetores<unknown>(
    baseUrl,
    '/parametros/setores/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        id_setor: values.set_id,
        setor_descr: values.set_descr,
        setor_ativo: values.set_ativo,
      }),
    },
    authToken,
  )
}

async function excluirSetor(baseUrl: string, setorId: number, authToken?: string | null): Promise<void> {
  await requestSetores<unknown>(
    baseUrl,
    `/parametros/setores/excluir/${setorId}`,
    { method: 'DELETE' },
    authToken,
  )
}

export function SetoresCrudPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: SetoresCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? getStoredToken()
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<SetorRecord>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['setores-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarSetores(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: (values: SetorRecord) => salvarSetor(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Setor salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['setores-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar setor', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (setorId: number) => excluirSetor(apiBaseUrl, setorId, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Setor excluido', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['setores-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao excluir setor', getErrorMessage(error))
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

  const handleOpenRecordModal = async (mode: 'edit' | 'view', record: SetorRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setFormErrors({})
    setIsFormLoading(true)

    try {
      const payload = await buscarSetor(apiBaseUrl, record.set_id, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) {
        return
      }

      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) {
        return
      }

      message.error('Erro ao carregar setor', getErrorMessage(error, 'Falha ao carregar o setor selecionado.'))
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

    try {
      await saveMutation.mutateAsync({
        ...formValues,
        set_descr: normalizeSetorDescriptionForSave(formValues.set_descr),
      })
    } catch {
      // The mutation onError callback already surfaces the failure to the user.
    }
  }

  const handleRequestDelete = async (record: SetorRecord) => {
    await message.confirmDestructive({
      description: 'Esta acao remove o cadastro de forma permanente. Confirme somente se tiver certeza sobre a exclusao.',
      highlightedDescription: record.set_descr,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(record.set_id)
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

  const renderRowActions = (rowData: SetorRecord, compact = false) => (
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`setor-view-${rowData.set_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`setor-edit-${rowData.set_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" aria-label="Excluir registro" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`setor-delete-${rowData.set_id}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page setores-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar setor por descricao"
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
                Novo Setor
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando Setores..."
            description="Consultando o endpoint `GET /parametros/setores/listar/:pesq`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar setores.'}
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
            title="Nenhum setor encontrado"
            description="Cadastre um novo setor para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar setor
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
                    <Panel bordered key={rowData.set_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.set_descr}</strong>
                        </div>
                        <StatusBadge tone={rowData.set_ativo === 1 ? 'success' : 'danger'}>
                          {rowData.set_ativo === 1 ? 'Ativo' : 'Inativo'}
                        </StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>ID</dt>
                          <dd>{rowData.set_id}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{rowData.set_ativo === 1 ? 'Ativo' : 'Inativo'}</dd>
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
                      <Cell dataKey="set_id" />
                    </Column>

                    <Column flexGrow={1} minWidth={240}>
                      <HeaderCell>Descricao</HeaderCell>
                      <Cell dataKey="set_descr" />
                    </Column>

                    <Column width={104} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>
                        {(rowData: SetorRecord) => (
                          <StatusBadge tone={rowData.set_ativo === 1 ? 'success' : 'danger'}>
                            {rowData.set_ativo === 1 ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        )}
                      </Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: SetorRecord) => renderRowActions(rowData)}</Cell>
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
          modalMode === 'create' ? 'Novo Setor' : modalMode === 'edit' ? 'Editar Setor' : 'Visualizar Setor'
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
          <section className="boname-page__form-panel" aria-label="Formulario de setor">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="setor-id">ID</label>
                <InputNumber
                  id="setor-id"
                  min={0}
                  size="sm"
                  controls={false}
                  className={formErrors.set_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.set_id}
                  disabled
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, set_id: Number(value || 0) }))
                  }}
                />
                {formErrors.set_id ? <span role="alert">{formErrors.set_id}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="setor-descricao">Descricao</label>
                <Textarea
                  id="setor-descricao"
                  rows={2}
                  maxLength={SETOR_DESCR_MAX_LENGTH}
                  className={formErrors.set_descr ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.set_descr}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    const nextDescription = normalizeSetorDescription(value)
                    setFormValues((current) =>
                      current.set_descr === nextDescription ? current : { ...current, set_descr: nextDescription },
                    )
                  }}
                  onBlur={() => {
                    setFormValues((current) => ({
                      ...current,
                      set_descr: normalizeSetorDescriptionForSave(current.set_descr),
                    }))
                  }}
                />
                {formErrors.set_descr ? <span role="alert">{formErrors.set_descr}</span> : null}
              </div>

              <fieldset className="boname-page__field boname-page__field--full boname-page__status-fieldset">
                <legend>Status do registro</legend>
                <div className="boname-page__status-panel">
                  <div className="boname-page__status-copy">
                    <StatusBadge tone={formValues.set_ativo === 1 ? 'success' : 'danger'}>
                      {formValues.set_ativo === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <small>
                      {formValues.set_ativo === 1
                        ? 'Setor disponivel para uso nas requisicoes do fluxo operacional.'
                        : 'Setor mantido no cadastro, sem uso operacional ativo.'}
                    </small>
                  </div>
                  {!isReadOnly ? (
                    <div className="boname-page__status-actions">
                      <Button
                        appearance={formValues.set_ativo === 1 ? 'primary' : 'subtle'}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, set_ativo: 1 }))}
                      >
                        Ativar
                      </Button>
                      <Button
                        appearance={formValues.set_ativo === 0 ? 'primary' : 'subtle'}
                        color={formValues.set_ativo === 0 ? 'red' : undefined}
                        size="sm"
                        onClick={() => setFormValues((current) => ({ ...current, set_ativo: 0 }))}
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

export default SetoresCrudPage
