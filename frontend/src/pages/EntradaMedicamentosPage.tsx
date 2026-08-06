import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, DatePicker, HStack, IconButton, Input, InputNumber, SelectPicker, Tooltip, Whisper, useMediaQuery } from 'rsuite'
import EditIcon from '@rsuite/icons/Edit'
import PlusIcon from '@rsuite/icons/Plus'
import TrashIcon from '@rsuite/icons/Trash'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, ReferenceNotification } from '../components/ui'
import { getErrorMessage, useMessage } from '../hooks/useMessage'
import { useMask } from '../hooks/useMask'
import { getApiBaseUrl } from '../lib/api-base-url'
import './boname/BonameCrudPage.css'

type DraftItemForm = {
  draftId: string
  medicamentoId: number | null
  lote: string
  validade: Date | null
  quantidade: number
}

type HeaderForm = {
  dataEntrada: Date | null
  documento: string
  fornecedorId: number | null
  depositoId: number | null
}

type ApiResponse<T> = {
  data: T
  err: number
  msg: string
  status: number
}

type MedicamentoOptionRecord = {
  med_id: number
  med_descr: string
  med_descr_coml: string
  med_tipo_codigo: string
  med_ativo: 0 | 1
}

type DepositoOptionRecord = {
  dep_id: number
  dep_descr: string
  dep_ativo: 0 | 1
}

type FornecedorOptionRecord = {
  for_id: number
  for_razao_social: string
  for_nome_fantasia: string
}

type TipoMedicamentoOptionRecord = {
  tipo_id: number
  tipo_codigo: string
  tipo_descr: string
  tipo_ativo: 0 | 1
}

type SelectOption<TValue extends number | string = number> = {
  label: string
  value: TValue
}

type SaveEntradaResponse = {
  ent_doc: string
  ent_doc_auto_generated: boolean
  ent_id: number
  total_itens: number
}

type HeaderFormErrors = Partial<Record<keyof HeaderForm, string>>
type DraftItemFormErrors = Partial<Record<keyof DraftItemForm, string>>

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const MAX_DOC_LENGTH = 90
const MAX_LOTE_LENGTH = 60
const API_BASE_URL = getApiBaseUrl()

const emptyDraftItem = (): DraftItemForm => ({
  draftId: '',
  medicamentoId: null,
  lote: '',
  validade: null,
  quantidade: 0,
})

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

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString('pt-BR') : '-'
}

function normalizeText(value: string, maxLength: number): string {
  return value.slice(0, maxLength)
}

function validateHeaderForm(values: HeaderForm): HeaderFormErrors {
  const errors: HeaderFormErrors = {}

  if (!values.dataEntrada) {
    errors.dataEntrada = 'Informe a data da entrada.'
  }

  if (!values.fornecedorId || values.fornecedorId <= 0) {
    errors.fornecedorId = 'Selecione o fornecedor.'
  }

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito de destino.'
  }

  return errors
}

function validateItemForm(values: DraftItemForm): DraftItemFormErrors {
  const errors: DraftItemFormErrors = {}

  if (!values.medicamentoId || values.medicamentoId <= 0) {
    errors.medicamentoId = 'Selecione o medicamento.'
  }

  if (!values.lote.trim()) {
    errors.lote = 'Informe o lote.'
  }

  if (!values.validade) {
    errors.validade = 'Informe a validade do lote.'
  }

  if (!Number.isFinite(values.quantidade) || values.quantidade <= 0) {
    errors.quantidade = 'Informe uma quantidade maior que zero.'
  }

  return errors
}

async function requestEntrada<T>(path: string, init: RequestInit, authToken?: string | null): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(API_BASE_URL, path), {
    ...init,
    headers,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    // Non-JSON backend responses are handled below.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar a requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function listarMedicamentosOptions(authToken?: string | null): Promise<MedicamentoOptionRecord[]> {
  return requestEntrada<MedicamentoOptionRecord[]>('/parametros/medicamentos/listar/*', { method: 'GET' }, authToken)
}

async function listarDepositosOptions(authToken?: string | null): Promise<DepositoOptionRecord[]> {
  return requestEntrada<DepositoOptionRecord[]>('/parametros/depositos/listar/*', { method: 'GET' }, authToken)
}

async function listarFornecedoresOptions(authToken?: string | null): Promise<FornecedorOptionRecord[]> {
  return requestEntrada<FornecedorOptionRecord[]>('/parametros/fornecedores/listar_ativos/*', { method: 'GET' }, authToken)
}

async function listarTiposMedicamentosOptions(authToken?: string | null): Promise<TipoMedicamentoOptionRecord[]> {
  return requestEntrada<TipoMedicamentoOptionRecord[]>('/parametros/tipos_medicamentos/listar/*', { method: 'GET' }, authToken)
}

async function salvarEntrada(headerForm: HeaderForm, draftItems: DraftItemForm[], authToken?: string | null) {
  const entUserDigit = getStoredSessionUsername()

  return requestEntrada<SaveEntradaResponse>(
    '/entradas/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        ent_id: 0,
        ent_date: headerForm.dataEntrada ? formatDateForInput(headerForm.dataEntrada) : '',
        ent_doc: normalizeText(headerForm.documento, MAX_DOC_LENGTH).trim().toLocaleUpperCase('pt-BR'),
        ent_for_id: headerForm.fornecedorId ?? 0,
        ent_dep_id: headerForm.depositoId ?? 0,
        ent_user_digit: entUserDigit,
        itens: draftItems.map((item) => ({
          ent_med_id: item.medicamentoId ?? 0,
          ent_lote: normalizeText(item.lote, MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR'),
          ent_lote_validade: item.validade ? formatDateForInput(item.validade) : '',
          ent_qtde: item.quantidade,
        })),
      }),
    },
    authToken,
  )
}

function getMedicamentoLabel(medicamentoId: number | null, medicamentoOptions: SelectOption<number>[]) {
  return medicamentoOptions.find((option) => option.value === medicamentoId)?.label ?? 'Medicamento nao informado'
}

function toMedicamentoOption(item: MedicamentoOptionRecord): SelectOption<number> {
  return {
    label: item.med_descr_coml ? `${item.med_descr} · ${item.med_descr_coml}` : item.med_descr,
    value: item.med_id,
  }
}

export default function EntradaMedicamentosPage() {
  const [isCompactLayout] = useMediaQuery('(max-width: 960px)')
  const queryClient = useQueryClient()
  const message = useMessage()
  const mask = useMask()
  const resolvedAuthToken = getStoredToken()
  const defaultHeaderForm: HeaderForm = {
    dataEntrada: new Date(),
    documento: '',
    fornecedorId: null,
    depositoId: null,
  }
  const [headerForm, setHeaderForm] = useState<HeaderForm>({
    ...defaultHeaderForm,
  })
  const [draftItems, setDraftItems] = useState<DraftItemForm[]>([])
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit'>('create')
  const [draftItemForm, setDraftItemForm] = useState<DraftItemForm>(emptyDraftItem())
const [headerErrors, setHeaderErrors] = useState<HeaderFormErrors>({})
  const [itemErrors, setItemErrors] = useState<DraftItemFormErrors>({})
  const [selectedTipoMedicamentoCodigo, setSelectedTipoMedicamentoCodigo] = useState<string | null>(null)

  const medicamentosQuery = useQuery({
    queryKey: ['entrada-medicamentos-options', resolvedAuthToken],
    queryFn: () => listarMedicamentosOptions(resolvedAuthToken),
  })

  const depositosQuery = useQuery({
    queryKey: ['entrada-depositos-options', resolvedAuthToken],
    queryFn: () => listarDepositosOptions(resolvedAuthToken),
  })

  const fornecedoresQuery = useQuery({
    queryKey: ['entrada-fornecedores-options', resolvedAuthToken],
    queryFn: () => listarFornecedoresOptions(resolvedAuthToken),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['entrada-tipos-medicamentos-options', resolvedAuthToken],
    queryFn: () => listarTiposMedicamentosOptions(resolvedAuthToken),
  })

  const saveMutation = useMutation({
    mutationFn: () => salvarEntrada(headerForm, draftItems, resolvedAuthToken),
    onSuccess: async (data) => {
      handleCloseDraft()
    if (data.ent_doc_auto_generated) {
      message.notify({
        icon: 'success',
        persistent: true,
        title: 'Entrada salva',
        text: (
          <ReferenceNotification
            body={`Entrada ${data.ent_id} registrada com ${data.total_itens} item(ns).`}
            hint="Anote este numero antes de fechar a mensagem."
            label="Numero do documento"
            value={mask.documentNumber(data.ent_doc) || '-'}
          />
        ),
      })
    } else {
      message.success('Entrada salva', `Entrada ${data.ent_id} registrada com ${data.total_itens} item(ns).`)
    }
      await queryClient.invalidateQueries({ queryKey: ['entradas-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar entrada', getErrorMessage(error))
    },
  })

  const tiposMedicamentoOptions: SelectOption<string>[] = (tiposMedicamentosQuery.data ?? [])
    .filter((item) => item.tipo_ativo === 1)
    .map((item) => ({
      label: `${item.tipo_codigo} - ${item.tipo_descr}`,
      value: item.tipo_codigo,
    }))

  const medicamentosAtivos = (medicamentosQuery.data ?? [])
    .filter((item) => item.med_ativo === 1)

  const medicamentoLookupOptions: SelectOption<number>[] = medicamentosAtivos
    .map(toMedicamentoOption)

  const medicamentosFiltrados = selectedTipoMedicamentoCodigo
    ? medicamentosAtivos.filter((item) => item.med_tipo_codigo === selectedTipoMedicamentoCodigo)
    : []

  const medicamentoOptions: SelectOption<number>[] = medicamentosFiltrados
    .map(toMedicamentoOption)

  const depositoOptions: SelectOption<number>[] = (depositosQuery.data ?? [])
    .filter((item) => item.dep_ativo === 1)
    .map((item) => ({
      label: item.dep_descr,
      value: item.dep_id,
    }))

  const fornecedorOptions: SelectOption<number>[] = (fornecedoresQuery.data ?? [])
    .map((item) => ({
      label: item.for_nome_fantasia || item.for_razao_social,
      value: item.for_id,
    }))
  const hasBootstrapError = medicamentosQuery.isError || depositosQuery.isError || fornecedoresQuery.isError || tiposMedicamentosQuery.isError
  const bootstrapErrorMessage = medicamentosQuery.error instanceof Error
    ? medicamentosQuery.error.message
    : depositosQuery.error instanceof Error
      ? depositosQuery.error.message
      : fornecedoresQuery.error instanceof Error
        ? fornecedoresQuery.error.message
        : tiposMedicamentosQuery.error instanceof Error
          ? tiposMedicamentosQuery.error.message
          : 'Nao foi possivel carregar os dados auxiliares da entrada.'

  const getMedicamentoTipoCodigo = (medicamentoId: number | null) =>
    (medicamentosQuery.data ?? []).find((item) => item.med_id === medicamentoId)?.med_tipo_codigo ?? null

  const handleOpenCreateModal = () => {
    setDraftItemForm(emptyDraftItem())
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(null)
    setItemModalMode('create')
    setItemModalOpen(true)
  }

  const handleOpenEditModal = (item: DraftItemForm) => {
    setDraftItemForm(item)
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(getMedicamentoTipoCodigo(item.medicamentoId))
    setItemModalMode('edit')
    setItemModalOpen(true)
  }

  const handleCloseItemModal = () => {
    setItemModalOpen(false)
    setDraftItemForm(emptyDraftItem())
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(null)
  }

  const handleSaveDraftItem = () => {
    const nextErrors = validateItemForm(draftItemForm)
    setItemErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      message.warning('Item incompleto', 'Revise os campos obrigatorios antes de adicionar o item.')
      return
    }

    if (draftItems.some((item) => item.medicamentoId === draftItemForm.medicamentoId && item.draftId !== draftItemForm.draftId)) {
      message.warning('Medicamento duplicado', 'O mesmo medicamento nao pode ser repetido na mesma entrada.')
      return
    }

    if (itemModalMode === 'edit' && draftItemForm.draftId) {
      setDraftItems((current) => current.map((item) => (item.draftId === draftItemForm.draftId ? draftItemForm : item)))
    } else {
      setDraftItems((current) => [
        ...current,
        {
          ...draftItemForm,
          draftId: `draft-${Date.now()}`,
        },
      ])
    }

    handleCloseItemModal()
  }

  const handleDeleteDraftItem = (draftId: string) => {
    setDraftItems((current) => current.filter((item) => item.draftId !== draftId))
  }

  const handleCloseDraft = () => {
    setHeaderForm({
      ...defaultHeaderForm,
      dataEntrada: new Date(),
    })
    setHeaderErrors({})
    setDraftItems([])
    handleCloseItemModal()
  }

const handleSaveEntry = () => {
    if (!getStoredSessionUsername()) {
      message.error('Sessao invalida', 'Nao foi possivel identificar o usuario digitador da entrada.')
      return
    }

    const nextHeaderErrors = validateHeaderForm(headerForm)
    setHeaderErrors(nextHeaderErrors)

    if (Object.keys(nextHeaderErrors).length > 0) {
      message.warning('Cabecalho incompleto', 'Preencha os dados principais da entrada antes de salvar.')
      return
    }

    if (draftItems.length === 0) {
      message.warning('Nenhum item adicionado', 'Adicione pelo menos um item antes de salvar a entrada.')
      return
    }

    saveMutation.mutate()
  }

  const renderRowActions = (rowData: DraftItemForm, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" size="xs" aria-label="Editar item" startIcon={<EditIcon />} onClick={() => handleOpenEditModal(rowData)}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-item-edit-${rowData.draftId}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton
            appearance="subtle"
            size="xs"
            aria-label="Editar item"
            circle
            className="boname-page__action-icon boname-page__action-icon--edit"
            icon={<EditIcon />}
            onClick={() => handleOpenEditModal(rowData)}
          />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" color="red" size="xs" aria-label="Excluir item" startIcon={<TrashIcon />} onClick={() => handleDeleteDraftItem(rowData.draftId)}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`entrada-item-delete-${rowData.draftId}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton
            appearance="subtle"
            color="red"
            size="xs"
            aria-label="Excluir item"
            circle
            className="boname-page__action-icon boname-page__action-icon--delete"
            icon={<TrashIcon />}
            onClick={() => handleDeleteDraftItem(rowData.draftId)}
          />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className={`boname-page entradas-page ${hasBootstrapError ? '' : 'entradas-page--merged-layout'}`.trim()}>
      {hasBootstrapError ? (
        <PageSection className="boname-page__table-section entradas-page__draft-section">
          <DataState
            state="error"
            title="Falha ao carregar dados da entrada"
            description={bootstrapErrorMessage}
            action={(
              <HStack spacing={10} wrap>
                <Button appearance="primary" onClick={() => void medicamentosQuery.refetch()}>
                  Recarregar medicamentos
                </Button>
                <Button appearance="ghost" onClick={() => void depositosQuery.refetch()}>
                  Recarregar depositos
                </Button>
                <Button appearance="ghost" onClick={() => void tiposMedicamentosQuery.refetch()}>
                  Recarregar tipos
                </Button>
              </HStack>
            )}
          />
        </PageSection>
      ) : null}

      <PageSection className="entradas-page__header-section entradas-page__merged-section">
        <div className="boname-page__form-grid entradas-page__form-grid">
          <section
            className="medicamentos-page__form-section boname-page__field--full"
            aria-label="Cabecalho da entrada"
            style={{ gap: '0.7rem', padding: '0.8rem 0.95rem' }}
          >
            <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--metrics" style={{ gap: '0.75rem 0.9rem' }}>
              <div className="boname-page__field">
                <label htmlFor="entrada-data">Data da entrada</label>
                <DatePicker
                  id="entrada-data"
                  oneTap
                  editable={false}
                  format="dd/MM/yyyy"
                  block
                  className={headerErrors.dataEntrada ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.dataEntrada}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, dataEntrada: value ?? null }))
                    setHeaderErrors((current) => ({ ...current, dataEntrada: undefined }))
                  }}
                />
                {headerErrors.dataEntrada ? <span className="boname-page__field-error">{headerErrors.dataEntrada}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="entrada-documento">Documento</label>
                <Input
                  id="entrada-documento"
                  size="sm"
                  maxLength={MAX_DOC_LENGTH}
                  className="boname-page__control boname-page__control--compact"
                  placeholder="Numero do documento"
                  value={headerForm.documento}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, documento: normalizeText(mask.documentNumber(value), MAX_DOC_LENGTH) }))
                  }}
                />
              </div>

              <div className="boname-page__field">
                <label id="entrada-fornecedor-label">Fornecedor</label>
                <SelectPicker
                  aria-label="Fornecedor"
                  aria-labelledby="entrada-fornecedor-label"
                  block
                  cleanable={false}
                  data={fornecedorOptions}
                  placeholder="Selecione o fornecedor"
                  className={headerErrors.fornecedorId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.fornecedorId}
                  loading={fornecedoresQuery.isPending}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, fornecedorId: value == null ? null : Number(value) }))
                    setHeaderErrors((current) => ({ ...current, fornecedorId: undefined }))
                  }}
                />
                {headerErrors.fornecedorId ? <span className="boname-page__field-error">{headerErrors.fornecedorId}</span> : null}
              </div>

              <div className="boname-page__field">
                <label id="entrada-deposito-label">Deposito</label>
                <SelectPicker
                  aria-label="Deposito"
                  aria-labelledby="entrada-deposito-label"
                  block
                  cleanable={false}
                  data={depositoOptions}
                  placeholder="Selecione o deposito"
                  className={headerErrors.depositoId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.depositoId}
                  loading={depositosQuery.isPending}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, depositoId: value == null ? null : Number(value) }))
                    setHeaderErrors((current) => ({ ...current, depositoId: undefined }))
                  }}
                />
                {headerErrors.depositoId ? <span className="boname-page__field-error">{headerErrors.depositoId}</span> : null}
              </div>
            </div>
          </section>
        </div>

        {draftItems.length === 0 ? (
          <div className="boname-page__table-content entradas-page__draft-content">
            <DataState
              state="empty"
              title="Nenhum item adicionado"
              description="Use o modal de inclusao para montar a grade antes do salvamento."
            />
          </div>
        ) : (
          <div className="boname-page__table-content entradas-page__draft-content">
            {isCompactLayout ? (
              <div className="boname-page__card-list">
                {draftItems.map((rowData) => (
                  <div key={rowData.draftId} className="boname-page__record-card rs-panel rs-panel-bordered">
                    <div className="boname-page__record-card-top">
                      <div>
                        <strong>{getMedicamentoLabel(rowData.medicamentoId, medicamentoLookupOptions)}</strong>
                        <p>{rowData.lote || 'Lote nao informado'}</p>
                      </div>
                      <span>{formatDate(rowData.validade)}</span>
                    </div>

                    <dl className="boname-page__record-meta">
                      <div>
                        <dt>Quantidade</dt>
                        <dd>{rowData.quantidade}</dd>
                      </div>
                      <div>
                        <dt>Lote</dt>
                        <dd>{rowData.lote || '-'}</dd>
                      </div>
                    </dl>

                    {renderRowActions(rowData, true)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="boname-page__table-wrap">
                <Table data={draftItems} height={320} fillHeight bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                  <Column flexGrow={1} minWidth={240}>
                    <HeaderCell>Medicamento</HeaderCell>
                    <Cell>{(rowData: DraftItemForm) => getMedicamentoLabel(rowData.medicamentoId, medicamentoLookupOptions)}</Cell>
                  </Column>
                  <Column width={120} align="center">
                    <HeaderCell>Quantidade</HeaderCell>
                    <Cell dataKey="quantidade" />
                  </Column>
                  <Column width={140}>
                    <HeaderCell>Lote</HeaderCell>
                    <Cell dataKey="lote" />
                  </Column>
                  <Column width={140} align="center">
                    <HeaderCell>Validade</HeaderCell>
                    <Cell>{(rowData: DraftItemForm) => formatDate(rowData.validade)}</Cell>
                  </Column>
                  <Column width={132} fixed="right">
                    <HeaderCell>Acoes</HeaderCell>
                    <Cell>{(rowData: DraftItemForm) => renderRowActions(rowData)}</Cell>
                  </Column>
                </Table>
              </div>
            )}
          </div>
        )}

        <div className="boname-page__table-footer">
          <HStack spacing={10} wrap className="boname-page__toolbar-actions">
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              disabled={medicamentosQuery.isPending || tiposMedicamentosQuery.isPending || saveMutation.isPending}
              onClick={handleOpenCreateModal}
            >
              Incluir item
            </Button>
            <Button appearance="primary" color="green" loading={saveMutation.isPending} disabled={draftItems.length === 0} onClick={handleSaveEntry}>
              Salvar
            </Button>
            <Button appearance="subtle" onClick={handleCloseDraft}>
              Fechar
            </Button>
          </HStack>
        </div>
      </PageSection>

      <AppModal
        open={itemModalOpen}
        backdrop="static"
        intent={itemModalMode === 'edit' ? 'edit' : 'create'}
        title={itemModalMode === 'edit' ? 'Editar item da entrada' : 'Novo item da entrada'}
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal entradas-page__item-record-modal"
        loading={medicamentosQuery.isPending || tiposMedicamentosQuery.isPending}
        onClose={handleCloseItemModal}
        size={isCompactLayout ? 'full' : 'lg'}
        footer={
          <>
            <Button appearance="subtle" disabled={saveMutation.isPending} onClick={handleCloseItemModal}>
              Cancelar
            </Button>
            <Button
              appearance="primary"
              disabled={medicamentosQuery.isPending || tiposMedicamentosQuery.isPending || saveMutation.isPending}
              onClick={handleSaveDraftItem}
            >
              {itemModalMode === 'edit' ? 'Salvar alteracoes' : 'Adicionar item'}
            </Button>
          </>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulario do item da entrada">
            <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Dados do item da entrada">
              <div className="medicamentos-page__form-section-header">
                <h3>Dados do item</h3>
              </div>

              <div className="boname-page__form-grid entradas-page__item-modal-grid">
                <div className="boname-page__field boname-page__field--full">
                  <label id="modal-tipo-medicamento-label">Tipo de medicamento</label>
                  <SelectPicker
                    aria-label="Tipo de medicamento"
                    aria-labelledby="modal-tipo-medicamento-label"
                    block
                    cleanable
                    data={tiposMedicamentoOptions}
                    placement="bottomStart"
                    placeholder="Filtre por tipo de medicamento"
                    preventOverflow
                    popupStyle={{ marginTop: '0.45rem' }}
                    className="boname-page__control"
                    value={selectedTipoMedicamentoCodigo}
                    loading={tiposMedicamentosQuery.isPending}
                    onChange={(value) => {
                      const nextTipoCodigo = typeof value === 'string' ? value : null
                      const medicamentoAtualTipoCodigo = getMedicamentoTipoCodigo(draftItemForm.medicamentoId)
                      const shouldClearMedicamento = Boolean(nextTipoCodigo && medicamentoAtualTipoCodigo !== nextTipoCodigo)

                      setSelectedTipoMedicamentoCodigo(nextTipoCodigo)
                      setDraftItemForm((current) => (shouldClearMedicamento ? { ...current, medicamentoId: null } : current))
                      if (shouldClearMedicamento) {
                        setItemErrors((current) => ({ ...current, medicamentoId: undefined }))
                      }
                    }}
                  />
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label id="modal-medicamento-label">Medicamento</label>
                  <SelectPicker
                    aria-label="Medicamento"
                    aria-labelledby="modal-medicamento-label"
                    block
                    cleanable={false}
                    data={medicamentoOptions}
                    disabled={tiposMedicamentosQuery.isPending || medicamentoOptions.length === 0}
                    placement="bottomStart"
                    placeholder={selectedTipoMedicamentoCodigo ? 'Selecione o medicamento' : 'Selecione primeiro o tipo de medicamento'}
                    preventOverflow
                    className={itemErrors.medicamentoId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={draftItemForm.medicamentoId}
                    loading={medicamentosQuery.isPending}
                    onChange={(value) => {
                      const nextMedicamentoId = value == null ? null : Number(value)
                      setDraftItemForm((current) => ({ ...current, medicamentoId: nextMedicamentoId }))
                      if (nextMedicamentoId) {
                        setSelectedTipoMedicamentoCodigo(getMedicamentoTipoCodigo(nextMedicamentoId))
                      }
                      setItemErrors((current) => ({ ...current, medicamentoId: undefined }))
                    }}
                  />
                  {itemErrors.medicamentoId ? <span className="boname-page__field-error">{itemErrors.medicamentoId}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label htmlFor="modal-lote">Lote</label>
                  <Input
                    id="modal-lote"
                    size="sm"
                    maxLength={MAX_LOTE_LENGTH}
                    className={itemErrors.lote ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    placeholder="Lote"
                    value={draftItemForm.lote}
                    onChange={(value) => {
                      setDraftItemForm((current) => ({ ...current, lote: normalizeText(value, MAX_LOTE_LENGTH) }))
                      setItemErrors((current) => ({ ...current, lote: undefined }))
                    }}
                  />
                  {itemErrors.lote ? <span className="boname-page__field-error">{itemErrors.lote}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label htmlFor="modal-validade">Validade</label>
                  <DatePicker
                    id="modal-validade"
                    oneTap
                    editable={false}
                    format="dd/MM/yyyy"
                    block
                    className={itemErrors.validade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={draftItemForm.validade}
                    onChange={(value) => {
                      setDraftItemForm((current) => ({ ...current, validade: value ?? null }))
                      setItemErrors((current) => ({ ...current, validade: undefined }))
                    }}
                  />
                  {itemErrors.validade ? <span className="boname-page__field-error">{itemErrors.validade}</span> : null}
                </div>

                <div className="boname-page__field">
                  <label htmlFor="modal-quantidade">Quantidade</label>
                  <InputNumber
                    id="modal-quantidade"
                    min={1}
                    size="sm"
                    controls={false}
                    className={itemErrors.quantidade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                    value={draftItemForm.quantidade || null}
                    onChange={(value) => {
                      setDraftItemForm((current) => ({ ...current, quantidade: Number(value || 0) }))
                      setItemErrors((current) => ({ ...current, quantidade: undefined }))
                    }}
                  />
                  {itemErrors.quantidade ? <span className="boname-page__field-error">{itemErrors.quantidade}</span> : null}
                </div>
              </div>
            </section>
          </section>
        </div>
      </AppModal>

    </section>
  )
}
