import { useEffect, useLayoutEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EditIcon from '@rsuite/icons/Edit'
import ReloadIcon from '@rsuite/icons/Reload'
import TrashIcon from '@rsuite/icons/Trash'
import PrintIcon from '@rsuite/icons/legacy/Print'
import { Button, Checkbox, HStack, IconButton, InputNumber, Pagination, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { apiRequest } from '../../lib/api'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'
import './SolicitacoesAbertasPage.css'

export interface SolicitacaoAbertaRecord {
  deposito_destino?: string | null
  deposito_origem?: string | null
  sol_date?: string | null
  sol_id: number
  sol_status?: number | null
  sol_user_create?: string | null
}

export interface SolicitacaoAbertaItemRecord {
  iso_id: number
  iso_med_id?: number | null
  iso_med_lote?: string | null
  iso_med_qtde?: number | null
  iso_med_validade?: string | null
  iso_qtde_digitada?: number | null
  med_descr?: string | null
}

export interface SolicitacoesAbertasPageProps {
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 8
const DESKTOP_TABLE_OFFSET = 340
const MAX_DESKTOP_TABLE_HEIGHT = 560
const SESSION_USER_STORAGE_KEY = 'sessionUser'
const AUTH_STORAGE_KEYS = ['authToken', 'token', 'accessToken', 'jwt']

function formatDateForDisplay(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatText(value?: string | number | null): string {
  const text = String(value ?? '').trim()
  return text || '-'
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

function getStoredAuthToken(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key)

    if (value) {
      return value
    }
  }

  return ''
}

async function listarSolicitacoesAbertas(): Promise<SolicitacaoAbertaRecord[]> {
  return apiRequest<SolicitacaoAbertaRecord[]>('/solicitacoes/listar_abertas/', { method: 'GET' })
}

async function listarItensSolicitacao(solId: number): Promise<SolicitacaoAbertaItemRecord[]> {
  return apiRequest<SolicitacaoAbertaItemRecord[]>(`/itens-solicitacoes/listar/${solId}`, { method: 'GET' })
}

async function excluirSolicitacao(solId: number): Promise<void> {
  await apiRequest(`/solicitacoes/excluir/${solId}`, { method: 'DELETE' })
}

async function excluirItemSolicitacao(isoId: number): Promise<void> {
  await apiRequest(`/itens-solicitacoes/excluir/${isoId}`, { method: 'DELETE' })
}

async function imprimirSolicitacao(solId: number): Promise<Blob> {
  const headers = new Headers()
  const token = getStoredAuthToken()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}/solicitacoes/imprimir/${solId}`, {
    method: 'GET',
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    let message = `Falha ao processar a requisicao (${response.status}).`

    try {
      const payload = (await response.json()) as { msg?: string }
      message = payload.msg || message
    } catch {
      // O backend de impressao responde com PDF em caso de sucesso.
    }

    throw new Error(message)
  }

  return await response.blob()
}

type EncerrarSolicitacaoPayload = {
  itens: Array<SolicitacaoAbertaItemRecord & { qtde_digitada: number }>
  sol_id: number
  user_aprov: string
}

async function encerrarSolicitacao(payload: EncerrarSolicitacaoPayload): Promise<void> {
  await apiRequest('/solicitacoes/encerrar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function SolicitacoesAbertasPage({
  pageSize = DEFAULT_PAGE_SIZE,
}: SolicitacoesAbertasPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const [activePage, setActivePage] = useState(1)
  const [desktopTableHeight, setDesktopTableHeight] = useState(540)
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoAbertaRecord | null>(null)
  const [initializedSolId, setInitializedSolId] = useState<number | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])
  const [digitadas, setDigitadas] = useState<Record<number, number>>({})
  const message = useMessage()
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['solicitacoes-abertas'],
    queryFn: listarSolicitacoesAbertas,
  })

  const itensQuery = useQuery({
    queryKey: ['solicitacao-aberta-itens', selectedSolicitacao?.sol_id],
    queryFn: () => listarItensSolicitacao(Number(selectedSolicitacao?.sol_id ?? 0)),
    enabled: selectedSolicitacao !== null,
  })

  const deleteMutation = useMutation({
    mutationFn: excluirSolicitacao,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['solicitacoes-abertas'] })
      await message.success('Solicitacao excluida', 'A solicitacao foi removida com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel excluir a solicitacao', getErrorMessage(error))
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: excluirItemSolicitacao,
    onSuccess: async (_, isoId) => {
      setSelectedItemIds((current) => current.filter((itemId) => itemId !== isoId))
      setDigitadas((current) => {
        const nextDigitadas = { ...current }
        delete nextDigitadas[isoId]
        return nextDigitadas
      })
      await queryClient.invalidateQueries({ queryKey: ['solicitacao-aberta-itens', selectedSolicitacao?.sol_id] })
      await message.success('Item excluido', 'O item foi removido da solicitacao.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel excluir o item', getErrorMessage(error))
    },
  })

  const encerrarMutation = useMutation({
    mutationFn: encerrarSolicitacao,
    onSuccess: async () => {
      handleCloseDigitacaoModal()
      await queryClient.invalidateQueries({ queryKey: ['solicitacoes-abertas'] })
      await message.success('Solicitacao encerrada', 'A digitacao foi salva com sucesso.')
    },
    onError: async (error) => {
      await message.error('Nao foi possivel salvar a digitacao', getErrorMessage(error))
    },
  })

  const printMutation = useMutation({
    mutationFn: async (record: SolicitacaoAbertaRecord) => {
      const pdfBlob = await imprimirSolicitacao(record.sol_id)
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!openedWindow) {
        const anchor = document.createElement('a')
        anchor.href = pdfUrl
        anchor.download = `solicitacao-${record.sol_id}.pdf`
        anchor.click()
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 60_000)
    },
    onError: async (error) => {
      await message.error('Erro ao imprimir solicitacao', getErrorMessage(error))
    },
  })

  const records = listQuery.data ?? []
  const itens = itensQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(pageStart, pageStart + pageSize)
  const hasRecords = records.length > 0
  const tableHeight = isCompactLayout ? 360 : desktopTableHeight
  const tableLabelStart = hasRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasRecords ? pageStart + paginatedRecords.length : 0
  const selectedItems = itens.filter((item) => selectedItemIds.includes(item.iso_id))

  useEffect(() => {
    if (!selectedSolicitacao || initializedSolId === selectedSolicitacao.sol_id || itens.length === 0) {
      return
    }

    setSelectedItemIds(itens.map((item) => item.iso_id))
    setDigitadas(Object.fromEntries(itens.map((item) => [item.iso_id, Number(item.iso_qtde_digitada ?? item.iso_med_qtde ?? 0)])))
    setInitializedSolId(selectedSolicitacao.sol_id)
  }, [initializedSolId, itens, selectedSolicitacao])

  useLayoutEffect(() => {
    if (isCompactLayout) {
      return
    }

    const updateTableHeight = () => {
      setDesktopTableHeight(Math.min(MAX_DESKTOP_TABLE_HEIGHT, Math.max(360, window.innerHeight - DESKTOP_TABLE_OFFSET)))
    }

    updateTableHeight()
    window.addEventListener('resize', updateTableHeight)

    return () => {
      window.removeEventListener('resize', updateTableHeight)
    }
  }, [isCompactLayout])

  const handleRefresh = async () => {
    await listQuery.refetch()
  }

  const handleOpenDigitacaoModal = (record: SolicitacaoAbertaRecord) => {
    setSelectedSolicitacao(record)
    setInitializedSolId(null)
    setSelectedItemIds([])
    setDigitadas({})
  }

  function handleCloseDigitacaoModal() {
    setSelectedSolicitacao(null)
    setInitializedSolId(null)
    setSelectedItemIds([])
    setDigitadas({})
  }

  const handleToggleItem = (isoId: number, checked: boolean) => {
    setSelectedItemIds((current) => {
      if (checked) {
        return current.includes(isoId) ? current : [...current, isoId]
      }

      return current.filter((itemId) => itemId !== isoId)
    })
  }

  const handleChangeDigitada = (isoId: number, value: number | string | null) => {
    setDigitadas((current) => ({
      ...current,
      [isoId]: Number(value ?? 0),
    }))
  }

  const handleSaveDigitacao = () => {
    if (!selectedSolicitacao || encerrarMutation.isPending) {
      return
    }

    const userAprov = getStoredSessionUsername()

    if (!userAprov) {
      void message.error('Sessao invalida', 'Nao foi possivel identificar o usuario aprovador da solicitacao.')
      return
    }

    if (selectedItems.length === 0) {
      void message.error('Itens nao informados', 'Selecione ao menos um item para encerrar a solicitacao.')
      return
    }

    encerrarMutation.mutate({
      sol_id: selectedSolicitacao.sol_id,
      user_aprov: userAprov,
      itens: selectedItems.map((item) => ({
        ...item,
        iso_qtde_digitada: digitadas[item.iso_id] ?? Number(item.iso_qtde_digitada ?? 0),
        qtde_digitada: digitadas[item.iso_id] ?? Number(item.iso_qtde_digitada ?? 0),
      })),
    })
  }

  const handleRequestDelete = async (record: SolicitacaoAbertaRecord) => {
    await message.confirmDestructive({
      title: 'Confirmar exclusao',
      subtitle: 'A solicitacao aberta e seus itens vinculados serao removidos.',
      description: 'Esta acao exclui a solicitacao de forma permanente.',
      highlightedLabel: 'Solicitacao',
      highlightedDescription: `ID ${record.sol_id}`,
      onConfirm: () => deleteMutation.mutateAsync(record.sol_id),
    })
  }

  const handleRequestDeleteItem = async (record: SolicitacaoAbertaItemRecord) => {
    await message.confirmDestructive({
      title: 'Confirmar exclusao',
      subtitle: 'O item sera removido da solicitacao aberta.',
      description: 'Esta acao exclui o item de forma permanente.',
      highlightedLabel: 'Item',
      highlightedDescription: `ID ${record.iso_id}`,
      onConfirm: () => deleteItemMutation.mutateAsync(record.iso_id),
    })
  }

  const renderRowActions = (rowData: SolicitacaoAbertaRecord, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <>
          <Button
            appearance="subtle"
            size="xs"
            startIcon={<PrintIcon />}
            loading={printMutation.isPending && printMutation.variables?.sol_id === rowData.sol_id}
            onClick={() => void printMutation.mutateAsync(rowData)}
          >
            Imprimir
          </Button>
          <Button appearance="subtle" size="xs" startIcon={<EditIcon />} onClick={() => handleOpenDigitacaoModal(rowData)}>
            Digitacao
          </Button>
          <Button appearance="subtle" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => void handleRequestDelete(rowData)}>
            Excluir Solicitacao
          </Button>
        </>
      ) : (
        <>
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-aberta-print-${rowData.sol_id}`} speaker={<Tooltip>Imprimir solicitacao</Tooltip>}>
            <IconButton
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon"
              icon={<PrintIcon />}
              aria-label="Imprimir solicitacao"
              loading={printMutation.isPending && printMutation.variables?.sol_id === rowData.sol_id}
              onClick={() => void printMutation.mutateAsync(rowData)}
            />
          </Whisper>
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-aberta-edit-${rowData.sol_id}`} speaker={<Tooltip>Digitacao</Tooltip>}>
            <IconButton
              appearance="subtle"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--edit"
              icon={<EditIcon />}
              aria-label="Digitacao"
              onClick={() => handleOpenDigitacaoModal(rowData)}
            />
          </Whisper>
          <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-aberta-delete-${rowData.sol_id}`} speaker={<Tooltip>Excluir solicitacao</Tooltip>}>
            <IconButton
              appearance="subtle"
              color="red"
              size="xs"
              circle
              className="boname-page__action-icon boname-page__action-icon--delete"
              icon={<TrashIcon />}
              aria-label="Excluir solicitacao"
              onClick={() => void handleRequestDelete(rowData)}
            />
          </Whisper>
        </>
      )}
    </HStack>
  )

  return (
    <section className="boname-page">
      <PageSection
        className="solicitacoes-abertas-page__section"
        title="Solicitacoes Abertas"
        description="Solicitacoes de transferencia pendentes de encerramento."
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
            title="Carregando solicitacoes..."
            description="Consultando solicitacoes abertas."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar as solicitacoes"
            description={getErrorMessage(listQuery.error, 'Erro ao listar solicitacoes abertas.')}
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
            title="Nenhuma solicitacao aberta"
            description="Nao ha solicitacoes abertas para exibir."
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasRecords ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.sol_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>Solicitacao {rowData.sol_id}</strong>
                          <p>{formatText(rowData.deposito_origem)} para {formatText(rowData.deposito_destino)}</p>
                        </div>
                        <StatusBadge tone="warning">Aberta</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Data</dt>
                          <dd>{formatDateForDisplay(rowData.sol_date)}</dd>
                        </div>
                        <div>
                          <dt>Origem</dt>
                          <dd>{formatText(rowData.deposito_origem)}</dd>
                        </div>
                        <div>
                          <dt>Destino</dt>
                          <dd>{formatText(rowData.deposito_destino)}</dd>
                        </div>
                        <div>
                          <dt>Usuario</dt>
                          <dd>{formatText(rowData.sol_user_create)}</dd>
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
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={86} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="sol_id" />
                    </Column>

                    <Column width={130}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoAbertaRecord) => formatDateForDisplay(rowData.sol_date)}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Origem</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoAbertaRecord) => formatText(rowData.deposito_origem)}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={190}>
                      <HeaderCell>Destino</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoAbertaRecord) => formatText(rowData.deposito_destino)}
                      </Cell>
                    </Column>

                    <Column width={180}>
                      <HeaderCell>Usuario</HeaderCell>
                      <Cell>
                        {(rowData: SolicitacaoAbertaRecord) => formatText(rowData.sol_user_create)}
                      </Cell>
                    </Column>

                    <Column width={112} align="center">
                      <HeaderCell>Status</HeaderCell>
                      <Cell>{() => <StatusBadge tone="warning">Aberta</StatusBadge>}</Cell>
                    </Column>

                    <Column width={168} fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>{(rowData: SolicitacaoAbertaRecord) => renderRowActions(rowData)}</Cell>
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
        open={selectedSolicitacao !== null}
        backdrop="static"
        className="boname-page__record-modal solicitacoes-abertas-page__digitacao-modal"
        footer={(
          <>
            <Button appearance="subtle" disabled={encerrarMutation.isPending} onClick={handleCloseDigitacaoModal}>
              Cancelar
            </Button>
            <Button
              appearance="primary"
              disabled={!itensQuery.isPending && selectedItems.length === 0}
              loading={encerrarMutation.isPending}
              onClick={handleSaveDigitacao}
            >
              Confirmar
            </Button>
          </>
        )}
        intent="edit"
        intentVisible={false}
        loading={itensQuery.isPending}
        onClose={handleCloseDigitacaoModal}
        size={isCompactLayout ? 'full' : 'lg'}
        subtitle={selectedSolicitacao ? `Solicitacao ${selectedSolicitacao.sol_id}` : undefined}
        title="Confirmar Solicitação de Transferência"
      >
        {selectedSolicitacao ? (
          <div className="solicitacoes-abertas-page__digitacao-summary">
            <div className="solicitacoes-abertas-page__digitacao-flow">
              <div>
                <span>Origem</span>
                <strong>{formatText(selectedSolicitacao.deposito_origem)}</strong>
              </div>
              <div className="solicitacoes-abertas-page__digitacao-flow-separator" aria-hidden="true" />
              <div>
                <span>Destino</span>
                <strong>{formatText(selectedSolicitacao.deposito_destino)}</strong>
              </div>
            </div>

            <dl className="solicitacoes-abertas-page__digitacao-meta">
              <div>
                <dt>Data</dt>
                <dd>{formatDateForDisplay(selectedSolicitacao.sol_date)}</dd>
              </div>
              <div>
                <dt>Usuario</dt>
                <dd>{formatText(selectedSolicitacao.sol_user_create)}</dd>
              </div>
              <div>
                <dt>Itens</dt>
                <dd>{selectedItemIds.length} de {itens.length}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {itensQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar os itens"
            description={getErrorMessage(itensQuery.error, 'Nao foi possivel carregar os itens da solicitacao.')}
            action={
              <Button appearance="primary" onClick={() => void itensQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && itens.length === 0 ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="A solicitacao selecionada nao possui itens vinculados."
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && itens.length > 0 ? (
          <div className="boname-page__table-wrap solicitacoes-abertas-page__digitacao-table-wrap">
            <Table
              data={itens}
              height={isCompactLayout ? 420 : 460}
              bordered
              virtualized
              rowHeight={58}
              headerHeight={52}
              autoHeight={false}
            >
              <Column width={72} align="center">
                <HeaderCell>Sel.</HeaderCell>
                <Cell>
                  {(rowData: SolicitacaoAbertaItemRecord) => (
                    <Checkbox
                      aria-label={`Selecionar item ${rowData.iso_id}`}
                      checked={selectedItemIds.includes(rowData.iso_id)}
                      onChange={(_, checked) => handleToggleItem(rowData.iso_id, checked)}
                    />
                  )}
                </Cell>
              </Column>

              <Column width={100}>
                <HeaderCell>Codigo</HeaderCell>
                <Cell>{(rowData: SolicitacaoAbertaItemRecord) => formatText(rowData.iso_med_id)}</Cell>
              </Column>

              <Column flexGrow={1} minWidth={220}>
                <HeaderCell>Descricao</HeaderCell>
                <Cell>{(rowData: SolicitacaoAbertaItemRecord) => formatText(rowData.med_descr)}</Cell>
              </Column>

              <Column width={130}>
                <HeaderCell>Lote</HeaderCell>
                <Cell>{(rowData: SolicitacaoAbertaItemRecord) => formatText(rowData.iso_med_lote)}</Cell>
              </Column>

              <Column width={150} align="center">
                <HeaderCell>Qtde Solicitada</HeaderCell>
                <Cell>{(rowData: SolicitacaoAbertaItemRecord) => formatText(rowData.iso_med_qtde)}</Cell>
              </Column>

              <Column width={170}>
                <HeaderCell>Qtde Digitada</HeaderCell>
                <Cell>
                  {(rowData: SolicitacaoAbertaItemRecord) => (
                    <InputNumber
                      min={0}
                      step={1}
                      controls={false}
                      className="boname-page__control solicitacoes-abertas-page__digitacao-input"
                      value={digitadas[rowData.iso_id] ?? Number(rowData.iso_qtde_digitada ?? rowData.iso_med_qtde ?? 0)}
                      onChange={(value) => handleChangeDigitada(rowData.iso_id, value)}
                    />
                  )}
                </Cell>
              </Column>

              <Column width={96} align="center">
                <HeaderCell>Acao</HeaderCell>
                <Cell>
                  {(rowData: SolicitacaoAbertaItemRecord) => (
                    <Whisper placement="top" trigger={['hover', 'focus']} controlId={`solicitacao-aberta-item-delete-${rowData.iso_id}`} speaker={<Tooltip>Excluir item</Tooltip>}>
                      <IconButton
                        appearance="subtle"
                        color="red"
                        size="sm"
                        circle
                        className="boname-page__action-icon boname-page__action-icon--delete solicitacoes-abertas-page__digitacao-delete"
                        icon={<TrashIcon style={{ fontSize: 16 }} />}
                        aria-label="Excluir item"
                        loading={deleteItemMutation.isPending}
                        onClick={() => void handleRequestDeleteItem(rowData)}
                      />
                    </Whisper>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>
        ) : null}
      </AppModal>
    </section>
  )
}

export default SolicitacoesAbertasPage
