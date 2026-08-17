import { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CheckIcon from '@rsuite/icons/Check'
import CloseIcon from '@rsuite/icons/Close'
import EditIcon from '@rsuite/icons/Edit'
import PrintIcon from '@rsuite/icons/legacy/Print'
import ReloadIcon from '@rsuite/icons/Reload'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { useMask } from '../../../hooks/useMask'
import { getApiBaseUrl } from '../../../lib/api-base-url'
import '../../boname/BonameCrudPage.css'

type ApiResponse<T> = {
  data: T
  err: number
  msg: string
  status: number
}

export type RequisicaoNaoAprovadaRecord = {
  data?: string | null
  deposito?: string | null
  local?: string | null
  paciente?: string | null
  requisicao: number
  req_num?: string | null
  setor?: string | null
  tipo?: string | null
}

type RequisicaoItemRecord = {
  ite_id: number
  ite_lote?: string | number | null
  ite_med_id?: number | null
  ite_qtde?: number | string | null
  ite_validade?: string | null
  med_descr?: string | null
  med_und?: string | null
}

type RequisicaoDetalheRecord = {
  data?: string | null
  deposito?: string | null
  itens?: RequisicaoItemRecord[]
  local?: string | null
  req_id: number
  req_num?: string | null
  setor?: string | null
}

type EditItemForm = {
  quantidade: number
}

type EditItemErrors = Partial<Record<keyof EditItemForm, string>>

export interface AprovacaoRequisicaoPageProps {
  apiBaseUrl?: string
  authToken?: string | null
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 8
const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const SESSION_USER_STORAGE_KEY = 'sessionUser'

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
      || '',
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

async function requestRequisicao<T>(
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

async function requestRequisicaoBlob(baseUrl: string, path: string, authToken?: string | null): Promise<Blob> {
  const headers = new Headers()

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(buildUrl(baseUrl, path), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    let message = `Falha ao processar requisicao (${response.status}).`

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

async function listarRequisicoesNaoAprovadas(
  baseUrl: string,
  authToken?: string | null,
): Promise<RequisicaoNaoAprovadaRecord[]> {
  return requestRequisicao<RequisicaoNaoAprovadaRecord[]>(
    baseUrl,
    '/requisicoes/naoaprovadas',
    { method: 'GET' },
    authToken,
  )
}

async function imprimirComprovanteRequisicao(baseUrl: string, reqId: number, authToken?: string | null): Promise<Blob> {
  return requestRequisicaoBlob(baseUrl, `/requisicoes/imprimir/${reqId}`, authToken)
}

async function buscarRequisicaoDetalhes(baseUrl: string, reqId: number, authToken?: string | null): Promise<RequisicaoDetalheRecord> {
  return requestRequisicao<RequisicaoDetalheRecord>(
    baseUrl,
    `/requisicoes/buscar/${reqId}`,
    { method: 'GET' },
    authToken,
  )
}

async function aprovarRequisicao(
  baseUrl: string,
  reqId: number,
  user: string,
  authToken?: string | null,
): Promise<void> {
  await requestRequisicao(
    baseUrl,
    `/requisicoes/aprovar/${reqId}`,
    {
      method: 'POST',
      body: JSON.stringify({ user }),
    },
    authToken,
  )
}

type ReprovarRequisicaoPayload = {
  justificativa: string
  reqId: number
  user: string
}

async function reprovarRequisicao(
  baseUrl: string,
  payload: ReprovarRequisicaoPayload,
  authToken?: string | null,
): Promise<void> {
  await requestRequisicao(
    baseUrl,
    '/requisicoes/reprovar',
    {
      method: 'POST',
      body: JSON.stringify({
        justificativa: payload.justificativa,
        req_id: payload.reqId,
        user: payload.user,
      }),
    },
    authToken,
  )
}

async function atualizarItemRequisicao(baseUrl: string, itemId: number, quantidade: number, authToken?: string | null): Promise<void> {
  await requestRequisicao(
    baseUrl,
    `/requisicoes/itens/${itemId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ite_qtde: quantidade }),
    },
    authToken,
  )
}

async function excluirItemRequisicao(baseUrl: string, itemId: number, authToken?: string | null): Promise<void> {
  await requestRequisicao(
    baseUrl,
    `/requisicoes/itens/${itemId}`,
    { method: 'DELETE' },
    authToken,
  )
}

function getPacienteSetorLabel(record: RequisicaoNaoAprovadaRecord): string | null {
  const setor = record.setor?.trim()

  if (setor) {
    return setor
  }

  return record.paciente ?? null
}

function isRequisicaoSetor(record: RequisicaoNaoAprovadaRecord): boolean {
  return Boolean(record.setor?.trim())
}

export function AprovacaoRequisicaoPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
  pageSize = DEFAULT_PAGE_SIZE,
}: AprovacaoRequisicaoPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const mask = useMask()
  const queryClient = useQueryClient()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [activePage, setActivePage] = useState(1)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedRequisicao, setSelectedRequisicao] = useState<RequisicaoNaoAprovadaRecord | null>(null)
  const [editingItem, setEditingItem] = useState<RequisicaoItemRecord | null>(null)
  const [editItemForm, setEditItemForm] = useState<EditItemForm>({ quantidade: 0 })
  const [editItemErrors, setEditItemErrors] = useState<EditItemErrors>({})
  const modalTableWrapRef = useRef<HTMLDivElement | null>(null)
  const [modalTableWidth, setModalTableWidth] = useState(0)

  const listQuery = useQuery({
    queryKey: ['aprovacao-requisicoes-list', apiBaseUrl, resolvedAuthToken],
    queryFn: () => listarRequisicoesNaoAprovadas(apiBaseUrl, resolvedAuthToken),
  })

  const printMutation = useMutation({
    mutationFn: async (record: RequisicaoNaoAprovadaRecord) => {
      const pdfBlob = await imprimirComprovanteRequisicao(apiBaseUrl, record.requisicao, resolvedAuthToken)
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!openedWindow) {
        const anchor = document.createElement('a')
        anchor.href = pdfUrl
        anchor.download = `comprovante-requisicao-${record.requisicao}.pdf`
        anchor.click()
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 60_000)
    },
    onError: async (error) => {
      await message.error('Erro ao imprimir requisicao', getErrorMessage(error))
    },
  })

  const detalhesRequisicaoQuery = useQuery({
    queryKey: ['aprovacao-requisicoes-detalhes', apiBaseUrl, selectedRequisicao?.requisicao, resolvedAuthToken],
    queryFn: () => buscarRequisicaoDetalhes(apiBaseUrl, selectedRequisicao?.requisicao ?? 0, resolvedAuthToken),
    enabled: detailsModalOpen && selectedRequisicao !== null,
  })

  const approveMutation = useMutation({
    mutationFn: async (record: RequisicaoNaoAprovadaRecord) => {
      const sessionUsername = getStoredSessionUsername()

      if (!sessionUsername) {
        throw new Error('Nao foi possivel identificar o usuario aprovador da requisicao.')
      }

      await aprovarRequisicao(apiBaseUrl, record.requisicao, sessionUsername, resolvedAuthToken)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['aprovacao-requisicoes-list', apiBaseUrl] })
      setDetailsModalOpen(false)
      setSelectedRequisicao(null)
      setEditingItem(null)
      setEditItemForm({ quantidade: 0 })
      setEditItemErrors({})
      await message.success('Requisicao aprovada', 'A requisicao foi aprovada com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel aprovar a requisicao', getErrorMessage(error, 'Erro ao aprovar a requisicao.'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ justificativa, record }: { justificativa: string; record: RequisicaoNaoAprovadaRecord }) => {
      const sessionUsername = getStoredSessionUsername()

      if (!sessionUsername) {
        throw new Error('Nao foi possivel identificar o usuario responsavel pela reprovacao da requisicao.')
      }

      await reprovarRequisicao(
        apiBaseUrl,
        {
          justificativa,
          reqId: record.requisicao,
          user: sessionUsername,
        },
        resolvedAuthToken,
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['aprovacao-requisicoes-list', apiBaseUrl] })
      setDetailsModalOpen(false)
      setSelectedRequisicao(null)
      setEditingItem(null)
      setEditItemForm({ quantidade: 0 })
      setEditItemErrors({})
      await message.success('Requisicao reprovada', 'A requisicao foi reprovada com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel reprovar a requisicao', getErrorMessage(error, 'Erro ao reprovar a requisicao.'))
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: (item: RequisicaoItemRecord) => atualizarItemRequisicao(apiBaseUrl, item.ite_id, editItemForm.quantidade, resolvedAuthToken),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['aprovacao-requisicoes-detalhes', apiBaseUrl, selectedRequisicao?.requisicao, resolvedAuthToken],
      })
      setEditingItem(null)
      setEditItemForm({ quantidade: 0 })
      setEditItemErrors({})
      await message.success('Item atualizado', 'Quantidade atualizada com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel atualizar o item', getErrorMessage(error, 'Erro ao atualizar o item da requisicao.'))
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (item: RequisicaoItemRecord) => excluirItemRequisicao(apiBaseUrl, item.ite_id, resolvedAuthToken),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['aprovacao-requisicoes-detalhes', apiBaseUrl, selectedRequisicao?.requisicao, resolvedAuthToken],
      })
      await message.success('Item excluido', 'Item removido da requisicao com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel excluir o item', getErrorMessage(error, 'Erro ao excluir o item da requisicao.'))
    },
  })

  const records = listQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(pageStart, pageStart + pageSize)
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : 420
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const modalItems = detalhesRequisicaoQuery.data?.itens ?? []
  const modalItemsCount = modalItems.length
  const effectiveModalTableWidth = detailsModalOpen ? modalTableWidth : 0

  useLayoutEffect(() => {
    if (!detailsModalOpen) {
      return
    }

    const container = modalTableWrapRef.current

    if (!container) {
      return
    }

    const updateTableWidth = () => {
      setModalTableWidth(Math.max(0, Math.round(container.getBoundingClientRect().width)))
    }

    updateTableWidth()

    const resizeObserver = new ResizeObserver(() => {
      updateTableWidth()
    })

    resizeObserver.observe(container)
    window.addEventListener('resize', updateTableWidth)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateTableWidth)
    }
  }, [detailsModalOpen, isCompactLayout, modalItemsCount])

  const handleRefresh = async () => {
    await listQuery.refetch()
  }

  const handleOpenDetails = (record: RequisicaoNaoAprovadaRecord) => {
    setSelectedRequisicao(record)
    setDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    if (detalhesRequisicaoQuery.isFetching || updateItemMutation.isPending || deleteItemMutation.isPending) {
      return
    }

    setDetailsModalOpen(false)
    setSelectedRequisicao(null)
    setEditingItem(null)
    setEditItemForm({ quantidade: 0 })
    setEditItemErrors({})
  }

  const handleRequestApprove = async (record: RequisicaoNaoAprovadaRecord) => {
    await message.confirmAction({
      title: 'Confirmar aprovacao',
      subtitle: 'A requisicao sera aprovada e a baixa de estoque sera processada.',
      description: 'Confirme somente depois de validar os dados da requisicao.',
      highlightedLabel: 'Requisicao',
      highlightedDescription: `${record.requisicao} | ${mask.text(getPacienteSetorLabel(record))}`,
      intentLabel: 'Aprovacao',
      confirmText: 'Aprovar requisicao',
      onConfirm: () => approveMutation.mutateAsync(record),
    })
  }

  const handleRequestReject = async (record: RequisicaoNaoAprovadaRecord) => {
    await message.confirmDestructive({
      title: 'Confirmar reprovacao',
      subtitle: 'A requisicao sera reprovada.',
      description: 'Confirme somente depois de validar os dados da requisicao.',
      highlightedLabel: 'Requisicao',
      highlightedDescription: `${record.requisicao} | ${mask.text(getPacienteSetorLabel(record))}`,
      inputLabel: 'Justificativa',
      inputMaxLength: 120,
      inputPlaceholder: 'Informe a justificativa da reprovacao',
      inputRequiredMessage: 'Informe a justificativa da reprovacao.',
      intentLabel: 'Reprovacao',
      confirmText: 'Reprovar Requisicao',
      onConfirm: (justificativa) => rejectMutation.mutateAsync({ justificativa: justificativa ?? '', record }),
    })
  }

  const handleOpenEditItem = (item: RequisicaoItemRecord) => {
    setEditingItem(item)
    setEditItemForm({ quantidade: Number(item.ite_qtde || 0) })
    setEditItemErrors({})
  }

  const handleCloseEditItem = () => {
    if (updateItemMutation.isPending) {
      return
    }

    setEditingItem(null)
    setEditItemForm({ quantidade: 0 })
    setEditItemErrors({})
  }

  const handleSaveEditItem = async () => {
    if (!editingItem) {
      return
    }

    const quantidade = Number(editItemForm.quantidade || 0)

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setEditItemErrors({ quantidade: 'Informe uma quantidade maior que zero.' })
      return
    }

    await updateItemMutation.mutateAsync(editingItem)
  }

  const handleRequestDeleteItem = async (item: RequisicaoItemRecord) => {
    await message.confirmDestructive({
      title: 'Excluir item da requisicao',
      subtitle: 'O item sera removido da requisicao pendente.',
      description: 'Confirme somente se este medicamento nao deve seguir para aprovacao.',
      highlightedLabel: 'Medicamento',
      highlightedDescription: `${mask.text(item.med_descr)} | Qtde ${mask.number(item.ite_qtde)}`,
      intentLabel: 'Exclusao',
      confirmText: 'Excluir item',
      onConfirm: () => deleteItemMutation.mutateAsync(item),
    })
  }

  const renderModalItemActions = (rowData: RequisicaoItemRecord, compact = false) => {
    const isUpdatingCurrentItem = updateItemMutation.isPending && updateItemMutation.variables?.ite_id === rowData.ite_id
    const isDeletingCurrentItem = deleteItemMutation.isPending && deleteItemMutation.variables?.ite_id === rowData.ite_id
    const isItemActionPending = updateItemMutation.isPending || deleteItemMutation.isPending

    return (
      <HStack
        spacing={8}
        wrap={compact}
        className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
      >
        {compact ? (
          <Button appearance="subtle" size="xs" startIcon={<EditIcon />} disabled={isItemActionPending} loading={isUpdatingCurrentItem} onClick={() => handleOpenEditItem(rowData)}>
            Editar
          </Button>
        ) : (
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`requisicao-aprovacao-item-edit-${rowData.ite_id}`} speaker={<Tooltip>Editar quantidade</Tooltip>}>
            <IconButton
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--edit"
              icon={<EditIcon />}
              aria-label="Editar quantidade"
              disabled={isItemActionPending}
              loading={isUpdatingCurrentItem}
              onClick={() => handleOpenEditItem(rowData)}
            />
          </Whisper>
        )}

        {compact ? (
          <Button appearance="subtle" color="red" size="xs" startIcon={<TrashIcon />} disabled={isItemActionPending} loading={isDeletingCurrentItem} onClick={() => void handleRequestDeleteItem(rowData)}>
            Excluir
          </Button>
        ) : (
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`requisicao-aprovacao-item-delete-${rowData.ite_id}`} speaker={<Tooltip>Excluir item</Tooltip>}>
            <IconButton
              appearance="subtle"
              color="red"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--delete"
              icon={<TrashIcon />}
              aria-label="Excluir item"
              disabled={isItemActionPending}
              loading={isDeletingCurrentItem}
              onClick={() => void handleRequestDeleteItem(rowData)}
            />
          </Whisper>
        )}
      </HStack>
    )
  }

  const renderRowActions = (rowData: RequisicaoNaoAprovadaRecord, compact = false) => {
    const isPrintingCurrentRow = printMutation.isPending && printMutation.variables?.requisicao === rowData.requisicao
    const isViewingCurrentRow = detailsModalOpen && selectedRequisicao?.requisicao === rowData.requisicao && detalhesRequisicaoQuery.isFetching
    const isRowActionPending = isPrintingCurrentRow || approveMutation.isPending || rejectMutation.isPending
    const disablePrint = isRequisicaoSetor(rowData)
    const printLabel = disablePrint ? 'Impressao indisponivel para requisicao de setor' : 'Imprimir requisicao'
    const detailsLabel = 'Listar itens da requisicao'

    return (
      <HStack
        spacing={8}
        wrap={compact}
        className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
      >
        {compact ? (
          <Button
            appearance="subtle"
            size="xs"
            aria-label={printLabel}
            startIcon={<PrintIcon />}
            disabled={disablePrint}
            loading={isPrintingCurrentRow}
            onClick={() => {
              if (!disablePrint) {
                void printMutation.mutateAsync(rowData)
              }
            }}
          >
            Imprimir
          </Button>
        ) : (
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`requisicao-aprovacao-print-${rowData.requisicao}`} speaker={<Tooltip>{printLabel}</Tooltip>}>
            <IconButton
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon"
              icon={<PrintIcon />}
              aria-label={printLabel}
              disabled={disablePrint}
              loading={isPrintingCurrentRow}
              onClick={() => {
                if (!disablePrint) {
                  void printMutation.mutateAsync(rowData)
                }
              }}
            />
          </Whisper>
        )}

        {compact ? (
          <Button
            appearance="subtle"
            size="xs"
            aria-label={detailsLabel}
            startIcon={<VisibleIcon />}
            disabled={isRowActionPending}
            loading={isViewingCurrentRow}
            onClick={() => handleOpenDetails(rowData)}
          >
            Itens
          </Button>
        ) : (
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`requisicao-aprovacao-details-${rowData.requisicao}`} speaker={<Tooltip>{detailsLabel}</Tooltip>}>
            <IconButton
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--view"
              icon={<VisibleIcon />}
              aria-label={detailsLabel}
              disabled={isRowActionPending}
              loading={isViewingCurrentRow}
              onClick={() => handleOpenDetails(rowData)}
            />
          </Whisper>
        )}
      </HStack>
    )
  }

  return (
    <section className="boname-page entradas-page entradas-page--merged-layout">
      <PageSection
        className="entradas-page__merged-section aprovacao-requisicao-page__section"
        title="Aprovar Requisicao"
        description="Requisicoes de medicamentos pendentes de aprovacao."
        actions={(
          <Button
            appearance="ghost"
            startIcon={<ReloadIcon />}
            loading={listQuery.isFetching && !listQuery.isPending}
            onClick={() => void handleRefresh()}
          >
            Atualizar
          </Button>
        )}
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando requisicoes pendentes..."
            description="Consultando requisicoes nao aprovadas."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as requisicoes"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar requisicoes nao aprovadas.'}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasRecords ? (
          <DataState
            state="empty"
            title="Nenhuma requisicao pendente"
            description="Nao ha requisicoes nao aprovadas para exibir."
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.requisicao} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>Req {mask.requisitionNumber(rowData.req_num) || rowData.requisicao}</strong>
                          <p>{mask.text(getPacienteSetorLabel(rowData))}</p>
                        </div>
                        <StatusBadge tone="warning">Pendente</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Data</dt>
                          <dd>{mask.date(rowData.data)}</dd>
                        </div>
                        <div>
                          <dt>Deposito</dt>
                          <dd>{mask.text(rowData.deposito)}</dd>
                        </div>
                        <div>
                          <dt>Local</dt>
                          <dd>{mask.text(rowData.local)}</dd>
                        </div>
                        <div>
                          <dt>Tipo</dt>
                          <dd>{mask.text(rowData.tipo)}</dd>
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
                    <Column width={104} align="center">
                      <HeaderCell>Req</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.requisitionNumber(rowData.req_num) || rowData.requisicao}</Cell>
                    </Column>

                    <Column width={108}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.date(rowData.data)}</Cell>
                    </Column>

                    <Column flexGrow={1.5} minWidth={180}>
                      <HeaderCell>Paciente/Setor</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.text(getPacienteSetorLabel(rowData))}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={128}>
                      <HeaderCell>Deposito</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.text(rowData.deposito)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={128}>
                      <HeaderCell>Local</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.text(rowData.local)}</Cell>
                    </Column>

                    <Column flexGrow={0.9} minWidth={118}>
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => mask.text(rowData.tipo)}</Cell>
                    </Column>

                    <Column width={102} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>{() => <StatusBadge tone="warning">Pendente</StatusBadge>}</Cell>
                    </Column>

                    <Column width={92} align="center">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: RequisicaoNaoAprovadaRecord) => renderRowActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de <strong>{records.length}</strong> registros.
              </p>
              <Pagination
                activePage={currentPage}
                boundaryLinks
                ellipsis
                first
                last
                limit={pageSize}
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
        open={detailsModalOpen}
        backdrop="static"
        intent="view"
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal aprovacao-requisicao-page__record-modal"
        title={selectedRequisicao ? `Itens da requisicao ${mask.requisitionNumber(selectedRequisicao.req_num) || selectedRequisicao.requisicao}` : 'Itens da requisicao'}
        subtitle={selectedRequisicao ? 'Consulte os itens vinculados antes da aprovacao.' : 'Consulta dos itens vinculados a requisicao selecionada.'}
        loading={detailsModalOpen && detalhesRequisicaoQuery.isPending}
        overflow={false}
        onClose={handleCloseDetails}
        size={isCompactLayout ? 'full' : 'lg'}
        footer={
          <div className="aprovacao-requisicao-page__modal-footer-actions">
            <Button
              appearance="primary"
              color="red"
              startIcon={<CloseIcon />}
              disabled={!selectedRequisicao || detalhesRequisicaoQuery.isPending || approveMutation.isPending || rejectMutation.isPending}
              loading={rejectMutation.isPending}
              onClick={() => {
                if (selectedRequisicao) {
                  void handleRequestReject(selectedRequisicao)
                }
              }}
            >
              Reprovar
            </Button>
            <Button
              appearance="primary"
              color="green"
              startIcon={<CheckIcon />}
              disabled={!selectedRequisicao || detalhesRequisicaoQuery.isPending || approveMutation.isPending || rejectMutation.isPending}
              loading={approveMutation.isPending}
              onClick={() => {
                if (selectedRequisicao) {
                  void handleRequestApprove(selectedRequisicao)
                }
              }}
            >
              Aprovar
            </Button>
            <Button
              appearance="subtle"
              className="aprovacao-requisicao-page__modal-close-button"
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={handleCloseDetails}
            >
              Fechar
            </Button>
          </div>
        }
      >
        {detalhesRequisicaoQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os itens"
            description={detalhesRequisicaoQuery.error instanceof Error ? detalhesRequisicaoQuery.error.message : 'Erro ao carregar itens da requisicao.'}
            action={
              <Button appearance="primary" onClick={() => void detalhesRequisicaoQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!detalhesRequisicaoQuery.isPending && !detalhesRequisicaoQuery.isError && modalItemsCount === 0 ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="A requisicao selecionada nao retornou itens vinculados."
          />
        ) : null}

        {!detalhesRequisicaoQuery.isPending && !detalhesRequisicaoQuery.isError && modalItemsCount > 0 ? (
          <div className="aprovacao-entradas-page__modal-shell">
            <div className="aprovacao-entradas-page__modal-summary">
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Paciente/Setor</span>
                <strong>{mask.text(getPacienteSetorLabel(selectedRequisicao ?? { requisicao: 0 }))}</strong>
              </div>
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Deposito</span>
                <strong>{mask.text(selectedRequisicao?.deposito)}</strong>
              </div>
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Status</span>
                <StatusBadge tone="warning">Pendente</StatusBadge>
              </div>
            </div>

            <section className="aprovacao-entradas-page__modal-panel">
              <div className="aprovacao-entradas-page__modal-panel-header">
                <div className="aprovacao-entradas-page__modal-panel-copy">
                  <h3>Itens vinculados</h3>
                  <p>Confira medicamento, lote, validade e quantidade da requisicao.</p>
                </div>
                <StatusBadge tone="info">{modalItemsCount} item{modalItemsCount > 1 ? 's' : ''}</StatusBadge>
              </div>

              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {modalItems.map((item) => (
                    <Panel bordered key={item.ite_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.text(item.med_descr)}</strong>
                          <p>Medicamento {mask.text(item.ite_med_id)}</p>
                        </div>
                        <StatusBadge tone="info">{mask.number(item.ite_qtde)}</StatusBadge>
                      </div>
                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Unidade</dt>
                          <dd>{mask.text(item.med_und)}</dd>
                        </div>
                        <div>
                          <dt>Lote</dt>
                          <dd>{mask.text(item.ite_lote)}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{mask.date(item.ite_validade)}</dd>
                        </div>
                      </dl>
                      {renderModalItemActions(item, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div ref={modalTableWrapRef} className="boname-page__table-wrap aprovacao-entradas-page__modal-table-wrap">
                  <Table
                    key={`${selectedRequisicao?.requisicao ?? 'sem-requisicao'}-${effectiveModalTableWidth}`}
                    data={modalItems}
                    height={360}
                    width={effectiveModalTableWidth || undefined}
                    fillHeight
                    bordered
                    rowHeight={50}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={76} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.ite_med_id)}</Cell>
                    </Column>

                    <Column flexGrow={1.8} minWidth={220}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.med_descr)}</Cell>
                    </Column>

                    <Column width={80}>
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.med_und)}</Cell>
                    </Column>

                    <Column width={118}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.text(rowData.ite_lote)}</Cell>
                    </Column>

                    <Column width={104}>
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.date(rowData.ite_validade)}</Cell>
                    </Column>

                    <Column width={70} align="right">
                      <HeaderCell>Qtde</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => mask.number(rowData.ite_qtde)}</Cell>
                    </Column>

                    <Column width={96}>
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>{(rowData: RequisicaoItemRecord) => renderModalItemActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={editingItem !== null}
        backdrop="static"
        intent="edit"
        intentVisible={false}
        className="boname-page__record-modal entradas-page__record-modal"
        title="Editar item da requisicao"
        subtitle={editingItem ? `Atualize somente a quantidade de ${mask.text(editingItem.med_descr)}.` : 'Atualize a quantidade do item selecionado.'}
        onClose={handleCloseEditItem}
        size={isCompactLayout ? 'full' : 'sm'}
        footer={
          <>
            <Button appearance="subtle" disabled={updateItemMutation.isPending} onClick={handleCloseEditItem}>
              Cancelar
            </Button>
            <Button appearance="primary" loading={updateItemMutation.isPending} onClick={() => void handleSaveEditItem()}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Editar quantidade do item da requisicao">
            <div className="medicamentos-page__form-section-header">
              <h3>Dados do item</h3>
              <p>Somente a quantidade pode ser alterada antes da aprovacao.</p>
            </div>

            <div className="boname-page__form-grid entradas-page__item-modal-grid">
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="aprovacao-requisicao-item-medicamento">Medicamento</label>
                <Input
                  id="aprovacao-requisicao-item-medicamento"
                  size="sm"
                  readOnly
                  className="boname-page__control"
                  value={mask.text(editingItem?.med_descr)}
                />
              </div>

              <div className="boname-page__field">
                <label htmlFor="aprovacao-requisicao-item-quantidade">Quantidade</label>
                <InputNumber
                  id="aprovacao-requisicao-item-quantidade"
                  min={1}
                  size="sm"
                  controls={false}
                  className={editItemErrors.quantidade ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={editItemForm.quantidade || null}
                  onChange={(value) => {
                    setEditItemForm({ quantidade: Number(value || 0) })
                    setEditItemErrors({})
                  }}
                />
                {editItemErrors.quantidade ? <span className="boname-page__field-error">{editItemErrors.quantidade}</span> : null}
              </div>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default AprovacaoRequisicaoPage
