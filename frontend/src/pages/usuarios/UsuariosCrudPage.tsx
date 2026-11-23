import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, Pagination, Panel, SelectPicker, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import EditIcon from '@rsuite/icons/Edit'
import VisibleIcon from '@rsuite/icons/Visible'
import { Table as AppTable, type TableColumn } from '../../components/Table'
import { AppModal, DataState, PageSection } from '../../components/ui'
import { useTablePagination } from '../../hook/useTablePagination'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { apiFetch } from '../../lib/api'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

export interface UsuarioRecord {
  usu_id: number
  usu_usuario: string
  usu_nome_completo: string
  usu_nome_usual: string
  usu_perfil_id: number
  per_descricao: string
}

interface RawUsuarioRecord {
  usu_id?: number
  usu_usuario?: string | null
  usu_nome_completo?: string | null
  usu_nome_usual?: string | null
  usu_perfil_id?: number | null
  per_descricao?: string | null
}

interface PerfilRecord {
  per_id: number
  per_descricao: string
}

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

type FormMode = 'edit' | 'view'

export interface UsuariosCrudPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const DEFAULT_FORM_VALUES: UsuarioRecord = {
  usu_id: 0,
  usu_usuario: '',
  usu_nome_completo: '',
  usu_nome_usual: '',
  usu_perfil_id: 0,
  per_descricao: '',
}

const PAGE_SIZE = 13


function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function normalizeSearchTerm(value: string): string {
  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? '*' : trimmedValue
}

function normalizeUsuarioRecord(record: RawUsuarioRecord): UsuarioRecord {
  return {
    usu_id: Number(record.usu_id ?? 0),
    usu_usuario: String(record.usu_usuario ?? ''),
    usu_nome_completo: String(record.usu_nome_completo ?? ''),
    usu_nome_usual: String(record.usu_nome_usual ?? ''),
    usu_perfil_id: Number(record.usu_perfil_id ?? 0),
    per_descricao: String(record.per_descricao ?? ''),
  }
}

async function requestUsuarios<T>(baseUrl: string, path: string, init: RequestInit, authToken?: string | null): Promise<T> {
  void authToken
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') headers.set('Content-Type', 'application/json')
  const response = await apiFetch(buildUrl(baseUrl, path), { ...init, headers })
  let payload: ApiResponse<T> | null = null
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // Non-JSON responses are handled below.
  }
  if (!response.ok || payload?.err) throw new Error(payload?.msg || `Falha ao processar a requisicao (${response.status}).`)
  if (!payload) throw new Error('Resposta vazia do backend.')
  return payload.data
}

async function listarUsuarios(baseUrl: string, searchTerm: string, authToken?: string | null): Promise<UsuarioRecord[]> {
  const records = await requestUsuarios<RawUsuarioRecord[]>(
    baseUrl,
    `/parametros/usuarios/listar/${encodeURIComponent(searchTerm)}`,
    { method: 'GET' },
    authToken,
  )
  return records.map(normalizeUsuarioRecord)
}

async function buscarUsuario(baseUrl: string, usuario: string, authToken?: string | null): Promise<UsuarioRecord> {
  const record = await requestUsuarios<RawUsuarioRecord>(
    baseUrl,
    `/parametros/usuarios/buscar/${encodeURIComponent(usuario)}`,
    { method: 'GET' },
    authToken,
  )
  return normalizeUsuarioRecord(record)
}

async function listarPerfis(baseUrl: string, authToken?: string | null) {
  const records = await requestUsuarios<PerfilRecord[]>(
    baseUrl,
    '/auth/listar_perfis',
    { method: 'GET' },
    authToken,
  )
  return records.map(({ per_id, per_descricao }) => ({ label: per_descricao, value: Number(per_id) }))
}

async function salvarUsuario(baseUrl: string, values: UsuarioRecord, authToken?: string | null): Promise<void> {
  await requestUsuarios<unknown>(
    baseUrl,
    '/parametros/usuarios/salvar',
    {
      method: 'POST',
      body: JSON.stringify({ usuario: values.usu_usuario.trim(), perfil_id: values.usu_perfil_id }),
    },
    authToken,
  )
}

export function UsuariosCrudPage({ apiBaseUrl = getApiBaseUrl(), authToken }: UsuariosCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const resolvedAuthToken = authToken ?? undefined
  const message = useMessage()
  const queryClient = useQueryClient()
  const formRequestIdRef = useRef(0)
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('*')
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<UsuarioRecord>(DEFAULT_FORM_VALUES)
  const [perfilError, setPerfilError] = useState<string>()
  const [isFormLoading, setIsFormLoading] = useState(false)

  const listQuery = useQuery({
    queryKey: ['usuarios-list', apiBaseUrl, submittedSearch, resolvedAuthToken],
    queryFn: () => listarUsuarios(apiBaseUrl, submittedSearch, resolvedAuthToken),
  })
  const perfisQuery = useQuery({
    queryKey: ['usuarios-perfis', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarPerfis(apiBaseUrl, resolvedAuthToken),
    enabled: modalMode !== null,
  })
  const saveMutation = useMutation({
    mutationFn: (values: UsuarioRecord) => salvarUsuario(apiBaseUrl, values, resolvedAuthToken),
    onSuccess: async () => {
      message.success('Usuario salvo', 'Registro atualizado com sucesso.')
      setModalMode(null)
      await queryClient.invalidateQueries({ queryKey: ['usuarios-list'] })
    },
    onError: (error: Error) => message.error('Erro ao salvar usuario', getErrorMessage(error)),
  })

  const records = listQuery.data ?? []
  const pagination = useTablePagination(records, { initialLimit: PAGE_SIZE })
  const hasData = records.length > 0
  const isReadOnly = modalMode === 'view'
  const perfilOptions = perfisQuery.data ?? []
  const canEditProfile = modalMode === 'edit' && !isFormLoading && !saveMutation.isPending
    && !perfisQuery.isError && perfilOptions.length > 0 && Boolean(formValues.usu_usuario.trim())

  const handleSearch = () => {
    setSubmittedSearch(normalizeSearchTerm(searchValue))
    pagination.resetPage()
  }

  const closeFormModal = () => {
    formRequestIdRef.current += 1
    setModalMode(null)
    setFormValues(DEFAULT_FORM_VALUES)
    setPerfilError(undefined)
    setIsFormLoading(false)
  }

  const handleOpenRecordModal = async (mode: FormMode, record: UsuarioRecord) => {
    const requestId = formRequestIdRef.current + 1
    formRequestIdRef.current = requestId
    setModalMode(mode)
    setPerfilError(undefined)
    setIsFormLoading(true)
    try {
      const payload = await buscarUsuario(apiBaseUrl, record.usu_usuario, resolvedAuthToken)
      if (formRequestIdRef.current !== requestId) return
      setFormValues(payload)
    } catch (error) {
      if (formRequestIdRef.current !== requestId) return
      message.error('Erro ao carregar usuario', getErrorMessage(error, 'Falha ao carregar o usuario.'))
      setModalMode(null)
    } finally {
      if (formRequestIdRef.current === requestId) setIsFormLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!canEditProfile) return
    if (!perfilOptions.some(({ value }) => value === formValues.usu_perfil_id)) {
      setPerfilError('Selecione um perfil disponível.')
      return
    }
    saveMutation.mutate(formValues)
  }

  const renderRowActions = (rowData: UsuarioRecord, compact = false) => (
    <HStack spacing={8} wrap={compact} className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`}>
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Visualizar usuario" startIcon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }}>Visualizar</Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`user-view-${rowData.usu_id}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar usuario" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => { void handleOpenRecordModal('view', rowData) }} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar usuario" startIcon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }}>Editar</Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`user-edit-${rowData.usu_id}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar usuario" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => { void handleOpenRecordModal('edit', rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  const columns: TableColumn<UsuarioRecord>[] = [
    { align: 'center', header: 'ID', key: 'usu_id', size: 'xs' },
    { header: 'Usuario', key: 'usu_usuario', size: 'sm' },
    { header: 'Nome completo', key: 'usu_nome_completo', size: 'fluid' },
    { header: 'Perfil', key: 'per_descricao', size: 'sm' },
    { align: 'center', header: 'Acoes', id: 'actions', key: 'usu_id', render: (rowData) => renderRowActions(rowData), size: 'actions' },
  ]

  const tableLabelStart = hasData ? pagination.startIndex + 1 : 0
  const tableLabelEnd = hasData ? pagination.startIndex + pagination.paginatedData.length : 0

  return (
    <section className="boname-page usuarios-page">
      <PageSection className="boname-page__table-section" actions={
        <div className="boname-page__toolbar">
          <Input aria-label="Buscar usuario" className="boname-page__search-input" placeholder="Buscar por usuario ou nome" value={searchValue} onChange={setSearchValue} onPressEnter={handleSearch} />
          <HStack spacing={10} wrap className="boname-page__toolbar-actions">
            <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleSearch}>Buscar</Button>
            <Button appearance="ghost" startIcon={<ReloadIcon />} loading={listQuery.isFetching && !listQuery.isPending} onClick={() => { void listQuery.refetch() }}>Atualizar</Button>
          </HStack>
        </div>
      }>
        {listQuery.isPending ? <DataState state="loading" title="Carregando Usuarios..." description="Consultando o endpoint `GET /parametros/usuarios/listar/:pesq`." /> : null}
        {listQuery.isError ? <DataState state="error" title="Nao foi possivel listar os registros" description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar usuarios.'} action={<Button appearance="primary" onClick={() => void listQuery.refetch()}>Tentar novamente</Button>} /> : null}
        {!listQuery.isPending && !listQuery.isError && !hasData ? <DataState state="empty" title="Nenhum usuário encontrado" description="Os usuários são incluídos ao acessar o sistema pelo Active Directory." /> : null}
        {!listQuery.isPending && !listQuery.isError && hasData ? <>
          <div className="boname-page__table-content">
            {isCompactLayout ? <div className="boname-page__card-list">
              {pagination.paginatedData.map((rowData) => <Panel bordered key={rowData.usu_id} className="boname-page__record-card">
                <div className="boname-page__record-card-top"><div><strong>{rowData.usu_usuario}</strong><small>{rowData.usu_nome_usual || rowData.usu_nome_completo}</small></div></div>
                <dl className="boname-page__record-meta"><div><dt>ID</dt><dd>{rowData.usu_id}</dd></div><div><dt>Perfil</dt><dd>{rowData.per_descricao || rowData.usu_perfil_id}</dd></div></dl>
                {renderRowActions(rowData, true)}
              </Panel>)}
            </div> : <div className="boname-page__table-wrap"><AppTable columns={columns} data={pagination.tableData} rowKey="usu_id" /></div>}
          </div>
          <div className="boname-page__table-footer"><p>Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de <strong>{records.length}</strong> registros.</p><Pagination activePage={pagination.activePage} boundaryLinks ellipsis first last limit={pagination.limit} layout={['pager']} maxButtons={5} next prev size={isCompactLayout ? 'sm' : 'md'} total={pagination.total} onChangePage={pagination.onChangePage} /></div>
        </> : null}
      </PageSection>

      <AppModal
        open={modalMode !== null}
        backdrop="static"
        intent={modalMode ?? 'view'}
        title={isReadOnly ? 'Visualizar Usuário' : 'Editar Usuário'}
        intentVisible={false}
        className="boname-page__record-modal"
        loading={isFormLoading}
        onClose={closeFormModal}
        size={isCompactLayout ? 'full' : 'md'}
        footer={isReadOnly ? <Button appearance="primary" onClick={closeFormModal}>Fechar</Button> : <>
          <Button appearance="subtle" onClick={closeFormModal}>Cancelar</Button>
          <Button appearance="primary" loading={saveMutation.isPending} disabled={!canEditProfile} onClick={handleSubmit}>Salvar</Button>
        </>}
      >
        <div className="boname-page__modal-shell"><section className="boname-page__form-panel" aria-label="Formulario de usuario"><div className="boname-page__form-grid">
          <div className="boname-page__field"><label htmlFor="usuario-id">ID</label><Input id="usuario-id" size="sm" className="boname-page__control" value={String(formValues.usu_id)} disabled /></div>
          <div className="boname-page__field"><label htmlFor="usuario-login">Usuário</label><Input id="usuario-login" size="sm" className="boname-page__control" value={formValues.usu_usuario} disabled /></div>
          <div className="boname-page__field boname-page__field--full"><label htmlFor="usuario-nome-completo">Nome completo</label><Input id="usuario-nome-completo" size="sm" className="boname-page__control" value={formValues.usu_nome_completo} disabled /></div>
          <div className="boname-page__field boname-page__field--full"><label htmlFor="usuario-nome-usual">Nome usual</label><Input id="usuario-nome-usual" size="sm" className="boname-page__control" value={formValues.usu_nome_usual} disabled /></div>
          <div className="boname-page__field boname-page__field--full">
            <label id="usuario-perfil-label">Perfil</label>
            <SelectPicker
              aria-labelledby="usuario-perfil-label"
              aria-invalid={Boolean(perfilError)}
              aria-describedby={perfilError ? 'usuario-perfil-erro' : undefined}
              block
              cleanable={false}
              data={perfilOptions}
              size="sm"
              loading={perfisQuery.isPending}
              placeholder="Selecione o perfil"
              className={perfilError ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              value={formValues.usu_perfil_id || null}
              renderValue={(value, item) => item?.label ?? `Perfil #${value}`}
              disabled={!canEditProfile}
              onChange={(value) => {
                setFormValues((current) => ({ ...current, usu_perfil_id: value ?? 0 }))
                setPerfilError(undefined)
              }}
            />
            {perfilError ? <span id="usuario-perfil-erro" role="alert">{perfilError}</span> : null}
            {perfisQuery.isError ? <span role="alert">Não foi possível carregar os perfis.</span> : null}
            {perfisQuery.isSuccess && perfilOptions.length === 0 ? <span role="status">Nenhum perfil disponível.</span> : null}
          </div>
        </div></section></div>
      </AppModal>
    </section>
  )
}

export default UsuariosCrudPage
