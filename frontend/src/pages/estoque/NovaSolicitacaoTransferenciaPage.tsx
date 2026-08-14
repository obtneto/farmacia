import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import EditIcon from '@rsuite/icons/Edit'
import PlusIcon from '@rsuite/icons/Plus'
import TrashIcon from '@rsuite/icons/Trash'
import PrintIcon from '@rsuite/icons/legacy/Print'
import { Button, Checkbox, DatePicker, HStack, IconButton, InputNumber, SelectPicker, Textarea, Tooltip, Whisper, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, ReferenceNotification } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'
import './NovaSolicitacaoTransferenciaPage.css'

type DraftItemForm = {
  draftId: string
  itemId: number
  medicamentoId: number | null
  medicamentoLabel: string
  medTipoCodigo: string | null
  lote: string
  validade: Date | null
  quantidade: number
}

type HeaderForm = {
  dataSolicitacao: Date | null
  depositoDestinoId: number | null
  depositoOrigemId: number | null
  observacao: string
}

type ApiResponse<T> = {
  data: T
  err: number
  msg: string
  status: number
}

type MedicamentoOptionRecord = {
  med_ativo: 0 | 1
  med_descr: string
  med_descr_coml: string
  med_id: number
  med_tipo_codigo: string
}

type DepositoOptionRecord = {
  dep_ativo?: 0 | 1 | null
  dep_descr: string
  dep_id: number
}

type TipoMedicamentoOptionRecord = {
  tipo_ativo: 0 | 1
  tipo_codigo: string
  tipo_descr: string
  tipo_id: number
}

type EstoqueModalRecord = {
  alerta_validade: number | null
  descricao: string | null
  descricao_comercial: string | null
  dias_para_validade: number | string | null
  id: number
  lote: string | null
  saldo_bloqueado: number
  saldo_disponivel: number
  unidade: string | null
  validade: Date | string | null
}

type SelectOption<TValue extends number | string = number> = {
  label: string
  value: TValue
}

type SaveSolicitacaoResponse = {
  sol_id: number
}

type HeaderFormErrors = Partial<Record<keyof HeaderForm, string>>
type ItemModalErrors = {
  estoque?: string
  tipoCodigo?: string
}

export interface NovaSolicitacaoTransferenciaPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const MAX_LOTE_LENGTH = 60
const MAX_OBSERVACAO_LENGTH = 500

const emptyDraftItem = (): DraftItemForm => ({
  draftId: '',
  itemId: 0,
  medicamentoId: null,
  medicamentoLabel: '',
  medTipoCodigo: null,
  lote: '',
  validade: null,
  quantidade: 0,
})

function buildUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
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

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value: Date | null): string {
  return value ? value.toLocaleDateString('pt-BR') : '-'
}

function formatDateValue(value: Date | string | null): Date | null {
  if (!value) {
    return null
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function normalizeText(value: string, maxLength: number): string {
  return value.slice(0, maxLength)
}

function validateHeaderForm(values: HeaderForm): HeaderFormErrors {
  const errors: HeaderFormErrors = {}

  if (!values.dataSolicitacao) {
    errors.dataSolicitacao = 'Informe a data da solicitacao.'
  }

  if (!values.depositoOrigemId || values.depositoOrigemId <= 0) {
    errors.depositoOrigemId = 'Selecione o deposito de origem.'
  }

  if (!values.depositoDestinoId || values.depositoDestinoId <= 0) {
    errors.depositoDestinoId = 'Selecione o deposito de destino.'
  }

  if (
    values.depositoOrigemId
    && values.depositoDestinoId
    && values.depositoOrigemId === values.depositoDestinoId
  ) {
    errors.depositoDestinoId = 'Selecione um deposito de destino diferente da origem.'
  }

  return errors
}

async function requestSolicitacao<T>(
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

async function listarMedicamentosOptions(
  baseUrl: string,
  authToken?: string | null,
): Promise<MedicamentoOptionRecord[]> {
  return requestSolicitacao<MedicamentoOptionRecord[]>(
    baseUrl,
    '/parametros/medicamentos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarDepositosOptions(
  baseUrl: string,
  authToken?: string | null,
): Promise<DepositoOptionRecord[]> {
  return requestSolicitacao<DepositoOptionRecord[]>(
    baseUrl,
    '/parametros/depositos/listar-ativos/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarTiposMedicamentosOptions(
  baseUrl: string,
  authToken?: string | null,
): Promise<TipoMedicamentoOptionRecord[]> {
  return requestSolicitacao<TipoMedicamentoOptionRecord[]>(
    baseUrl,
    '/parametros/tipos_medicamentos/listar/*',
    { method: 'GET' },
    authToken,
  )
}

async function listarEstoqueDisponivel(
  baseUrl: string,
  depositoId: number,
  tipoCodigo: string,
  authToken?: string | null,
): Promise<EstoqueModalRecord[]> {
  return requestSolicitacao<EstoqueModalRecord[]>(
    baseUrl,
    `/estoque/listar/*/${depositoId}/${encodeURIComponent(tipoCodigo)}`,
    { method: 'GET' },
    authToken,
  )
}

async function requestSolicitacaoBlob(
  baseUrl: string,
  path: string,
  authToken?: string | null,
): Promise<Blob> {
  const headers = new Headers()

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    let message = `Falha ao processar a requisicao (${response.status}).`

    try {
      const payload = (await response.json()) as ApiResponse<unknown>
      if (payload?.msg) {
        message = payload.msg
      }
    } catch {
      // O backend de impressao responde com PDF em caso de sucesso.
    }

    throw new Error(message)
  }

  return await response.blob()
}

async function salvarSolicitacao(
  baseUrl: string,
  headerForm: HeaderForm,
  draftItems: DraftItemForm[],
  authToken?: string | null,
) {
  return requestSolicitacao<SaveSolicitacaoResponse>(
    baseUrl,
    '/solicitacoes/salvar',
    {
      method: 'POST',
      body: JSON.stringify({
        sol_id: 0,
        sol_date: headerForm.dataSolicitacao ? formatDateForInput(headerForm.dataSolicitacao) : '',
        sol_dep_ori_id: headerForm.depositoOrigemId ?? 0,
        sol_dep_des_id: headerForm.depositoDestinoId ?? 0,
        sol_user_create: getStoredSessionUsername(),
        sol_status: 0,
        sol_obs: normalizeText(headerForm.observacao, MAX_OBSERVACAO_LENGTH).trim(),
        itens: draftItems.map((item) => ({
          iso_id: item.itemId,
          iso_med_id: item.medicamentoId ?? 0,
          iso_med_qtde: item.quantidade,
          iso_med_lote: normalizeText(item.lote, MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR'),
          iso_med_validade: item.validade ? formatDateForInput(item.validade) : '',
        })),
      }),
    },
    authToken,
  )
}

async function imprimirSolicitacao(
  baseUrl: string,
  solId: number,
  authToken?: string | null,
): Promise<Blob> {
  return requestSolicitacaoBlob(baseUrl, `/solicitacoes/imprimir/${solId}`, authToken)
}

function toMedicamentoOption(item: MedicamentoOptionRecord): SelectOption<number> {
  return {
    label: item.med_descr_coml ? `${item.med_descr} · ${item.med_descr_coml}` : item.med_descr,
    value: item.med_id,
  }
}

function getMedicamentoLabel(medicamentoId: number | null, medicamentoOptions: SelectOption<number>[]) {
  return medicamentoOptions.find((option) => option.value === medicamentoId)?.label ?? 'Medicamento nao informado'
}

function getEstoqueRowKey(rowData: EstoqueModalRecord): string {
  return `${rowData.id}::${rowData.lote ?? ''}`
}

function getEstoqueMedicamentoLabel(rowData: EstoqueModalRecord): string {
  const descricao = String(rowData.descricao ?? '').trim()
  const descricaoComercial = String(rowData.descricao_comercial ?? '').trim()

  if (descricao && descricaoComercial) {
    return `${descricao} · ${descricaoComercial}`
  }

  return descricao || descricaoComercial || 'Medicamento nao informado'
}

export function NovaSolicitacaoTransferenciaPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: NovaSolicitacaoTransferenciaPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 960px)')
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const defaultHeaderForm: HeaderForm = {
    dataSolicitacao: new Date(),
    depositoDestinoId: null,
    depositoOrigemId: null,
    observacao: '',
  }
  const [headerForm, setHeaderForm] = useState<HeaderForm>(defaultHeaderForm)
  const [headerErrors, setHeaderErrors] = useState<HeaderFormErrors>({})
  const [draftItems, setDraftItems] = useState<DraftItemForm[]>([])
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit'>('create')
  const [draftItemForm, setDraftItemForm] = useState<DraftItemForm>(emptyDraftItem())
  const [itemErrors, setItemErrors] = useState<ItemModalErrors>({})
  const [selectedTipoMedicamentoCodigo, setSelectedTipoMedicamentoCodigo] = useState<string | null>(null)
  const [selectedEstoqueKeys, setSelectedEstoqueKeys] = useState<string[]>([])
  const [selectedEstoqueQuantities, setSelectedEstoqueQuantities] = useState<Record<string, number>>({})
  const [lastSavedSolicitacaoId, setLastSavedSolicitacaoId] = useState<number | null>(null)

  const medicamentosQuery = useQuery({
    queryKey: ['solicitacao-transferencia-medicamentos-options', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarMedicamentosOptions(apiBaseUrl, resolvedAuthToken),
  })

  const depositosQuery = useQuery({
    queryKey: ['solicitacao-transferencia-depositos-options', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarDepositosOptions(apiBaseUrl, resolvedAuthToken),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['solicitacao-transferencia-tipos-medicamentos-options', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarTiposMedicamentosOptions(apiBaseUrl, resolvedAuthToken),
  })

  const canLoadEstoqueModal =
    itemModalOpen
    && Number(headerForm.depositoOrigemId) > 0
    && Boolean(selectedTipoMedicamentoCodigo)

  const estoqueModalQuery = useQuery({
    queryKey: ['solicitacao-transferencia-estoque-modal', apiBaseUrl, headerForm.depositoOrigemId, selectedTipoMedicamentoCodigo, resolvedAuthToken],
    queryFn: () => listarEstoqueDisponivel(apiBaseUrl, Number(headerForm.depositoOrigemId), String(selectedTipoMedicamentoCodigo), resolvedAuthToken),
    enabled: false,
  })

  const saveMutation = useMutation({
    mutationFn: () => salvarSolicitacao(apiBaseUrl, headerForm, draftItems, resolvedAuthToken),
    onSuccess: (data) => {
      setLastSavedSolicitacaoId(data.sol_id)
      handleCloseDraft()
      message.notify({
        icon: 'success',
        persistent: true,
        title: 'Solicitacao salva',
        text: (
          <ReferenceNotification
            body={`Solicitacao ${data.sol_id} registrada com ${draftItems.length} item(ns).`}
            hint="Anote este numero antes de fechar a mensagem."
            label="Numero da solicitacao"
            value={String(data.sol_id || '-')}
          />
        ),
      })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar solicitacao', getErrorMessage(error))
    },
  })

  const printMutation = useMutation({
    mutationFn: async () => {
      if (!lastSavedSolicitacaoId) {
        throw new Error('Nenhuma solicitacao disponivel para impressao.')
      }

      const pdfBlob = await imprimirSolicitacao(apiBaseUrl, lastSavedSolicitacaoId, resolvedAuthToken)
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!openedWindow) {
        const anchor = document.createElement('a')
        anchor.href = pdfUrl
        anchor.download = `solicitacao-${lastSavedSolicitacaoId}.pdf`
        anchor.click()
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 60_000)
    },
    onError: (error: Error) => {
      message.error('Erro ao imprimir solicitacao', getErrorMessage(error))
    },
  })

  const tiposMedicamentoOptions: SelectOption<string>[] = (tiposMedicamentosQuery.data ?? [])
    .filter((item) => item.tipo_ativo === 1)
    .map((item) => ({
      label: `${item.tipo_codigo} - ${item.tipo_descr}`,
      value: item.tipo_codigo,
    }))

  const medicamentosAtivos = (medicamentosQuery.data ?? []).filter((item) => item.med_ativo === 1)
  const medicamentoLookupOptions: SelectOption<number>[] = medicamentosAtivos.map(toMedicamentoOption)

  const depositoOptions: SelectOption<number>[] = (depositosQuery.data ?? [])
    .map((item) => ({
      label: item.dep_descr,
      value: item.dep_id,
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const hasBootstrapError =
    medicamentosQuery.isError
    || depositosQuery.isError
    || tiposMedicamentosQuery.isError

  const bootstrapErrorMessage = medicamentosQuery.error instanceof Error
    ? medicamentosQuery.error.message
    : depositosQuery.error instanceof Error
      ? depositosQuery.error.message
      : tiposMedicamentosQuery.error instanceof Error
        ? tiposMedicamentosQuery.error.message
        : 'Nao foi possivel carregar os dados auxiliares da solicitacao.'

  const getMedicamentoTipoCodigo = (medicamentoId: number | null) =>
    (medicamentosQuery.data ?? []).find((item) => item.med_id === medicamentoId)?.med_tipo_codigo ?? null

  const estoqueModalRecords = Array.isArray(estoqueModalQuery.data) ? estoqueModalQuery.data : []

  useEffect(() => {
    if (!canLoadEstoqueModal) {
      return
    }

    void estoqueModalQuery.refetch()
  }, [canLoadEstoqueModal, estoqueModalQuery, headerForm.depositoOrigemId, selectedTipoMedicamentoCodigo])

  const handleOpenCreateModal = () => {
    setDraftItemForm(emptyDraftItem())
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(null)
    setSelectedEstoqueKeys([])
    setSelectedEstoqueQuantities({})
    setItemModalMode('create')
    setItemModalOpen(true)
  }

  const handleOpenEditModal = (item: DraftItemForm) => {
    const rowKey = `${item.medicamentoId ?? 0}::${item.lote}`

    setDraftItemForm(item)
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(item.medTipoCodigo ?? getMedicamentoTipoCodigo(item.medicamentoId))
    setSelectedEstoqueKeys([rowKey])
    setSelectedEstoqueQuantities({ [rowKey]: item.quantidade })
    setItemModalMode('edit')
    setItemModalOpen(true)
  }

  const handleCloseItemModal = () => {
    setItemModalOpen(false)
    setDraftItemForm(emptyDraftItem())
    setItemErrors({})
    setSelectedTipoMedicamentoCodigo(null)
    setSelectedEstoqueKeys([])
    setSelectedEstoqueQuantities({})
  }

  const handleSaveDraftItem = () => {
    if (!selectedTipoMedicamentoCodigo) {
      setItemErrors({ tipoCodigo: 'Selecione o tipo de medicamento.' })
      message.warning('Tipo obrigatorio', 'Selecione o tipo de medicamento antes de adicionar os itens.')
      return
    }

    const selectedRows = estoqueModalRecords.filter((rowData) => selectedEstoqueKeys.includes(getEstoqueRowKey(rowData)))

    if (selectedRows.length === 0) {
      setItemErrors({ estoque: 'Selecione pelo menos um item do estoque.' })
      message.warning('Nenhum item selecionado', 'Marque pelo menos um item na tabela de estoque.')
      return
    }

    const nextItems: DraftItemForm[] = []

    for (const [index, rowData] of selectedRows.entries()) {
      const rowKey = getEstoqueRowKey(rowData)
      const quantidade = Number(selectedEstoqueQuantities[rowKey] ?? 0)

      if (!Number.isFinite(quantidade) || quantidade <= 0) {
        setItemErrors({ estoque: 'Informe uma quantidade maior que zero para os itens selecionados.' })
        message.warning('Quantidade invalida', 'Informe uma quantidade maior que zero para cada item marcado.')
        return
      }

      if (quantidade > Number(rowData.saldo_disponivel || 0)) {
        setItemErrors({ estoque: 'A quantidade solicitada nao pode ultrapassar o saldo disponivel.' })
        message.warning('Quantidade invalida', 'A quantidade solicitada nao pode ultrapassar o saldo disponivel do item.')
        return
      }

      nextItems.push({
        draftId: itemModalMode === 'edit' ? draftItemForm.draftId : `draft-${Date.now()}-${index}`,
        itemId: 0,
        medicamentoId: rowData.id,
        medicamentoLabel: getEstoqueMedicamentoLabel(rowData),
        medTipoCodigo: selectedTipoMedicamentoCodigo,
        lote: normalizeText(String(rowData.lote ?? ''), MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR'),
        validade: formatDateValue(rowData.validade),
        quantidade,
      })
    }

    const hasDuplicateItem = nextItems.some((nextItem) => {
      const normalizedDraftLote = normalizeText(nextItem.lote, MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR')

      return draftItems.some((item) => {
        const normalizedItemLote = normalizeText(item.lote, MAX_LOTE_LENGTH).trim().toLocaleUpperCase('pt-BR')

        return item.draftId !== draftItemForm.draftId
          && item.medicamentoId === nextItem.medicamentoId
          && normalizedItemLote === normalizedDraftLote
      })
    })

    if (hasDuplicateItem) {
      message.warning('Item duplicado', 'O mesmo medicamento com o mesmo lote nao pode ser repetido na mesma solicitacao.')
      return
    }

    if (itemModalMode === 'edit' && draftItemForm.draftId && nextItems[0]) {
      setDraftItems((current) => current.map((item) => (item.draftId === draftItemForm.draftId ? nextItems[0] : item)))
    } else {
      setDraftItems((current) => [...current, ...nextItems])
    }

    handleCloseItemModal()
  }

  const handleDeleteDraftItem = (draftId: string) => {
    setDraftItems((current) => current.filter((item) => item.draftId !== draftId))
  }

  const handleCloseDraft = () => {
    setHeaderForm({
      ...defaultHeaderForm,
      dataSolicitacao: new Date(),
    })
    setHeaderErrors({})
    setDraftItems([])
    handleCloseItemModal()
  }

  const handleSaveSolicitacao = () => {
    if (!getStoredSessionUsername()) {
      message.error('Sessao invalida', 'Nao foi possivel identificar o usuario criador da solicitacao.')
      return
    }

    const nextHeaderErrors = validateHeaderForm(headerForm)
    setHeaderErrors(nextHeaderErrors)

    if (Object.keys(nextHeaderErrors).length > 0) {
      message.warning('Cabecalho incompleto', 'Preencha os dados principais da solicitacao antes de salvar.')
      return
    }

    if (draftItems.length === 0) {
      message.warning('Nenhum item adicionado', 'Adicione pelo menos um item antes de salvar a solicitacao.')
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-item-edit-${rowData.draftId}`} speaker={<Tooltip>Editar</Tooltip>}>
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
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-item-delete-${rowData.draftId}`} speaker={<Tooltip>Excluir</Tooltip>}>
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
    <section className={`boname-page entradas-page solicitacoes-transferencia-page ${hasBootstrapError ? '' : 'entradas-page--merged-layout'}`.trim()}>
      {hasBootstrapError ? (
        <PageSection className="boname-page__table-section entradas-page__draft-section">
          <DataState
            state="error"
            title="Falha ao carregar dados da solicitacao"
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
            className="medicamentos-page__form-section boname-page__field--full solicitacoes-transferencia-page__header-card"
            aria-label="Cabecalho da solicitacao"
          >
            <div className="medicamentos-page__form-subgrid medicamentos-page__form-subgrid--metrics solicitacoes-transferencia-page__header-grid">
              <div className="boname-page__field">
                <label htmlFor="solicitacao-data">Data da solicitacao</label>
                <DatePicker
                  id="solicitacao-data"
                  oneTap
                  editable={false}
                  format="dd/MM/yyyy"
                  block
                  className={headerErrors.dataSolicitacao ? 'boname-page__control boname-page__control--compact boname-page__control--error solicitacoes-transferencia-page__date-control' : 'boname-page__control boname-page__control--compact solicitacoes-transferencia-page__date-control'}
                  value={headerForm.dataSolicitacao}
                  onChange={(value) => {
                    setHeaderForm((current) => ({ ...current, dataSolicitacao: value ?? null }))
                    setHeaderErrors((current) => ({ ...current, dataSolicitacao: undefined }))
                  }}
                />
                {headerErrors.dataSolicitacao ? <span className="boname-page__field-error">{headerErrors.dataSolicitacao}</span> : null}
              </div>

              <div className="boname-page__field">
                <label id="solicitacao-deposito-origem-label">Deposito origem</label>
                <SelectPicker
                  aria-label="Deposito origem"
                  aria-labelledby="solicitacao-deposito-origem-label"
                  block
                  cleanable={false}
                  data={depositoOptions}
                  placeholder="Selecione o deposito de origem"
                  className={headerErrors.depositoOrigemId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.depositoOrigemId}
                  loading={depositosQuery.isPending}
                  onChange={(value) => {
                    const nextOrigemId = value == null ? null : Number(value)
                    const hadSameDestino = headerForm.depositoDestinoId != null && headerForm.depositoDestinoId === nextOrigemId

                    setHeaderForm((current) => ({
                      ...current,
                      depositoOrigemId: nextOrigemId,
                      depositoDestinoId: current.depositoDestinoId === nextOrigemId ? null : current.depositoDestinoId,
                    }))
                    setSelectedEstoqueKeys([])
                    setSelectedEstoqueQuantities({})
                    setHeaderErrors((current) => ({
                      ...current,
                      depositoOrigemId: undefined,
                      depositoDestinoId: hadSameDestino ? 'Selecione um deposito de destino diferente da origem.' : undefined,
                    }))
                  }}
                />
                {headerErrors.depositoOrigemId ? <span className="boname-page__field-error">{headerErrors.depositoOrigemId}</span> : null}
              </div>

              <div className="boname-page__field">
                <label id="solicitacao-deposito-destino-label">Deposito destino</label>
                <SelectPicker
                  aria-label="Deposito destino"
                  aria-labelledby="solicitacao-deposito-destino-label"
                  block
                  cleanable={false}
                  data={depositoOptions}
                  placeholder="Selecione o deposito de destino"
                  className={headerErrors.depositoDestinoId ? 'boname-page__control boname-page__control--compact boname-page__control--error' : 'boname-page__control boname-page__control--compact'}
                  value={headerForm.depositoDestinoId}
                  loading={depositosQuery.isPending}
                  onChange={(value) => {
                    const nextDestinoId = value == null ? null : Number(value)

                    if (nextDestinoId != null && nextDestinoId === headerForm.depositoOrigemId) {
                      setHeaderErrors((current) => ({
                        ...current,
                        depositoDestinoId: 'Selecione um deposito de destino diferente da origem.',
                      }))
                      return
                    }

                    setHeaderForm((current) => ({ ...current, depositoDestinoId: nextDestinoId }))
                    setHeaderErrors((current) => ({ ...current, depositoDestinoId: undefined }))
                  }}
                />
                {headerErrors.depositoDestinoId ? <span className="boname-page__field-error">{headerErrors.depositoDestinoId}</span> : null}
              </div>
            </div>
          </section>
        </div>

        {draftItems.length === 0 ? (
          <div className="boname-page__table-content entradas-page__draft-content">
            <DataState
              state="empty"
              title="Nenhum item adicionado"
              description="Use o modal de inclusao para montar a grade da solicitacao antes do salvamento."
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
                        <strong>{rowData.medicamentoLabel || getMedicamentoLabel(rowData.medicamentoId, medicamentoLookupOptions)}</strong>
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
                    <Cell>{(rowData: DraftItemForm) => rowData.medicamentoLabel || getMedicamentoLabel(rowData.medicamentoId, medicamentoLookupOptions)}</Cell>
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

        <div className="boname-page__form-grid entradas-page__form-grid">
          <section
            className="medicamentos-page__form-section boname-page__field--full"
            aria-label="Observacao da solicitacao"
            style={{ gap: '0.7rem', padding: '0.8rem 0.95rem' }}
          >
            <div className="boname-page__field boname-page__field--full">
              <label htmlFor="solicitacao-observacao">Observacao</label>
              <Textarea
                id="solicitacao-observacao"
                rows={4}
                maxLength={MAX_OBSERVACAO_LENGTH}
                className="boname-page__control"
                placeholder="Descreva observacoes relevantes para a solicitacao"
                value={headerForm.observacao}
                onChange={(value) => {
                  setHeaderForm((current) => ({ ...current, observacao: normalizeText(value, MAX_OBSERVACAO_LENGTH) }))
                }}
              />
            </div>
          </section>
        </div>

        <div className="boname-page__table-footer">
          <HStack spacing={10} wrap className="boname-page__toolbar-actions">
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              disabled={medicamentosQuery.isPending || tiposMedicamentosQuery.isPending || saveMutation.isPending}
              onClick={handleOpenCreateModal}
            >
              Adicionar
            </Button>
            <Button
              appearance="ghost"
              startIcon={<PrintIcon />}
              loading={printMutation.isPending}
              disabled={!lastSavedSolicitacaoId || saveMutation.isPending}
              onClick={() => {
                void printMutation.mutateAsync()
              }}
            >
              Imprimir
            </Button>
            <Button appearance="primary" color="green" loading={saveMutation.isPending} disabled={draftItems.length === 0} onClick={handleSaveSolicitacao}>
              Salvar Solicitacao
            </Button>
          </HStack>
        </div>
      </PageSection>

      <AppModal
        open={itemModalOpen}
        backdrop="static"
        intent={itemModalMode === 'edit' ? 'edit' : 'create'}
        title={itemModalMode === 'edit' ? 'Editar item da solicitacao' : 'Novo item da solicitacao'}
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal entradas-page__item-record-modal solicitacoes-transferencia-page__item-record-modal"
        loading={tiposMedicamentosQuery.isPending}
        onClose={handleCloseItemModal}
        size={isCompactLayout ? 'full' : 'lg'}
        footer={
          <>
            <Button appearance="subtle" disabled={saveMutation.isPending} onClick={handleCloseItemModal}>
              Fechar
            </Button>
            <Button
              appearance="primary"
              disabled={tiposMedicamentosQuery.isPending || saveMutation.isPending}
              onClick={handleSaveDraftItem}
            >
              Adicionar
            </Button>
          </>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulario do item da solicitacao">
            <section className="medicamentos-page__form-section boname-page__field--full" aria-label="Dados do item da solicitacao">
              <div className="medicamentos-page__form-section-header">
                <h3>Dados do item</h3>
              </div>

              <div className="boname-page__form-grid entradas-page__item-modal-grid">
                <div className="boname-page__field boname-page__field--full">
                  <label id="solicitacao-modal-tipo-medicamento-label">Tipo de medicamento</label>
                  <SelectPicker
                    aria-label="Tipo de medicamento"
                    aria-labelledby="solicitacao-modal-tipo-medicamento-label"
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

                      setSelectedTipoMedicamentoCodigo(nextTipoCodigo)
                      setSelectedEstoqueKeys([])
                      setSelectedEstoqueQuantities({})
                      setItemErrors((current) => ({ ...current, tipoCodigo: undefined, estoque: undefined }))
                    }}
                  />
                  {itemErrors.tipoCodigo ? <span className="boname-page__field-error">{itemErrors.tipoCodigo}</span> : null}
                </div>

                <div className="boname-page__field boname-page__field--full">
                  {!headerForm.depositoOrigemId ? (
                    <DataState
                      state="empty"
                      title="Selecione o deposito de origem"
                      description="Defina o deposito de origem no cabecalho antes de listar o estoque do modal."
                    />
                  ) : !selectedTipoMedicamentoCodigo ? (
                    <DataState
                      state="empty"
                      title="Selecione o tipo de medicamento"
                      description="Escolha o tipo de medicamento para carregar os itens disponiveis no estoque de origem."
                    />
                  ) : estoqueModalQuery.isPending ? (
                    <DataState
                      state="loading"
                      title="Carregando estoque"
                      description="Buscando os itens disponiveis para o deposito e tipo selecionados."
                    />
                  ) : estoqueModalQuery.isError ? (
                    <DataState
                      state="error"
                      title="Falha ao carregar o estoque"
                      description={estoqueModalQuery.error instanceof Error ? estoqueModalQuery.error.message : 'Erro ao listar o estoque disponivel.'}
                      action={(
                        <Button appearance="primary" onClick={() => void estoqueModalQuery.refetch()}>
                          Recarregar estoque
                        </Button>
                      )}
                    />
                  ) : estoqueModalRecords.length === 0 ? (
                    <DataState
                      state="empty"
                      title="Nenhum item disponivel"
                      description="Nao ha saldo disponivel no deposito de origem para o tipo de medicamento selecionado."
                    />
                  ) : (
                    <div className="boname-page__table-wrap solicitacoes-transferencia-page__modal-table-wrap">
                      <div className="solicitacoes-transferencia-page__stock-grid" role="table" aria-label="Itens disponiveis no estoque">
                        <div className="solicitacoes-transferencia-page__stock-grid-row solicitacoes-transferencia-page__stock-grid-row--header" role="row">
                          <div role="columnheader">Sel.</div>
                          <div role="columnheader">Medicamento</div>
                          <div role="columnheader">Und</div>
                          <div role="columnheader">Lote</div>
                          <div role="columnheader">Validade</div>
                          <div role="columnheader">Saldo</div>
                          <div role="columnheader">Quantidade</div>
                        </div>

                        {estoqueModalRecords.map((rowData) => {
                          const rowKey = getEstoqueRowKey(rowData)
                          const isChecked = selectedEstoqueKeys.includes(rowKey)

                          return (
                            <div className="solicitacoes-transferencia-page__stock-grid-row" role="row" key={rowKey}>
                              <div role="cell" className="solicitacoes-transferencia-page__modal-checkbox">
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(_, checked) => {
                                    setSelectedEstoqueKeys((current) => {
                                      if (itemModalMode === 'edit') {
                                        return checked ? [rowKey] : []
                                      }

                                      if (checked) {
                                        return current.includes(rowKey) ? current : [...current, rowKey]
                                      }

                                      return current.filter((item) => item !== rowKey)
                                    })

                                    setSelectedEstoqueQuantities((current) => {
                                      if (!checked) {
                                        const nextQuantities = { ...current }
                                        delete nextQuantities[rowKey]
                                        return nextQuantities
                                      }

                                      return {
                                        ...current,
                                        [rowKey]: current[rowKey] ?? 0,
                                      }
                                    })
                                    setItemErrors((current) => ({ ...current, estoque: undefined }))
                                  }}
                                />
                              </div>
                              <div role="cell">{getEstoqueMedicamentoLabel(rowData)}</div>
                              <div role="cell">{rowData.unidade || '-'}</div>
                              <div role="cell">{rowData.lote || '-'}</div>
                              <div role="cell">{formatDate(formatDateValue(rowData.validade))}</div>
                              <div role="cell">{formatNumber(Number(rowData.saldo_disponivel || 0))}</div>
                              <div role="cell">
                                <InputNumber
                                  min={0}
                                  step={1}
                                  controls={false}
                                  disabled={!isChecked}
                                  className="boname-page__control solicitacoes-transferencia-page__modal-quantity-input"
                                  value={selectedEstoqueQuantities[rowKey] ?? 0}
                                  onChange={(value) => {
                                    setSelectedEstoqueQuantities((current) => ({
                                      ...current,
                                      [rowKey]: Number(value ?? 0),
                                    }))
                                    setItemErrors((current) => ({ ...current, estoque: undefined }))
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {itemErrors.estoque ? <span className="boname-page__field-error">{itemErrors.estoque}</span> : null}
                </div>
              </div>
            </section>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default NovaSolicitacaoTransferenciaPage
