import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import CheckIcon from '@rsuite/icons/Check'
import SearchIcon from '@rsuite/icons/Search'
import { Button, HStack, Input, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { DataState, PageSection, ReferenceNotification, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { useMask } from '../../../hooks/useMask'
import { apiRequest } from '../../../lib/api'
import '../../boname/BonameCrudPage.css'

type RequisicaoDevolucaoRecord = {
  req_date?: string | null
  req_dep_id?: number | null
  req_dt_aprovacao?: string | null
  req_id: number
  req_local_id?: number | null
  req_num?: string | null
  req_observacao?: string | null
  req_pac_id?: number | null
  req_set_id?: number | null
  req_status?: number | null
  id_setor?: number | string | null
  nome_paciente?: string | null
  nome_setor?: string | null
  num_paciente?: number | string | null
}

type RequisicaoDevolucaoItemRecord = {
  ite_id: number
  ite_lote?: string | number | null
  ite_med_id?: number | null
  ite_qtde?: number | string | null
  ite_validade?: string | null
  med_descr?: string | null
  med_und?: string | null
}

type BuscarRequisicaoParaDevolucaoResponse = {
  itens: RequisicaoDevolucaoItemRecord[]
  requisicoes: RequisicaoDevolucaoRecord
}

type SalvarDevolucaoItemPayload = {
  lote: string | number | null | undefined
  med_id: number
  qtde: number
  validade: string | null
}

type SalvarDevolucaoPayload = {
  data: string
  itens: SalvarDevolucaoItemPayload[]
  observacao: string
  req_id: number
  req_num_dispesa: string
  req_num_dispensacao: string
  solicitado_por: string
}

type SalvarDevolucaoResponse = {
  req_id?: number | null
  req_num?: string | null
}

const SESSION_USER_STORAGE_KEY = 'sessionUser'

async function buscarRequisicaoParaDevolucao(reqNum: string): Promise<BuscarRequisicaoParaDevolucaoResponse> {
  return apiRequest<BuscarRequisicaoParaDevolucaoResponse>(`/requisicoes/buscar_para_devolucao/${encodeURIComponent(reqNum)}`)
}

async function salvarDevolucao(payload: SalvarDevolucaoPayload): Promise<SalvarDevolucaoResponse> {
  return apiRequest<SalvarDevolucaoResponse>('/requisicoes/salvar_devolucao', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
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

function formatDateForApi(value: string): string {
  return value ? `${value}T00:00:00` : ''
}

function formatDateValueForApi(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return formatDateForApi(formatDateForInput(parsedDate))
}

function getRequisicaoDestino(requisicao: RequisicaoDevolucaoRecord) {
  const pacienteId = requisicao.num_paciente ?? requisicao.req_pac_id
  const setorId = requisicao.id_setor ?? requisicao.req_set_id

  if (pacienteId) {
    return {
      label: 'Paciente',
      id: pacienteId,
      nome: requisicao.nome_paciente,
    }
  }

  return {
    label: 'Setor',
    id: setorId,
    nome: requisicao.nome_setor,
  }
}

export function DevolucaoMedicamentoPage() {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const mask = useMask()
  const [reqNumInput, setReqNumInput] = useState('')
  const [submittedReqNum, setSubmittedReqNum] = useState<string | undefined>(undefined)
  const [inputError, setInputError] = useState('')
  const [lastSavedDevolucao, setLastSavedDevolucao] = useState<{ reqId: number, reqNum: string } | null>(null)

  const requisicaoQuery = useQuery({
    queryKey: ['requisicao-devolucao', submittedReqNum],
    queryFn: () => buscarRequisicaoParaDevolucao(submittedReqNum ?? ''),
    enabled: submittedReqNum !== undefined,
    retry: false,
  })

  const requisicao = requisicaoQuery.data?.requisicoes
  const itens = requisicaoQuery.data?.itens ?? []
  const hasSearch = submittedReqNum !== undefined
  const hasItems = itens.length > 0
  const requisicaoDestino = requisicao ? getRequisicaoDestino(requisicao) : null
  const tableHeight = isCompactLayout ? 360 : 420
  const saveDisabled = !requisicao || !hasItems || lastSavedDevolucao !== null

  const handleSearch = async () => {
    const normalizedReqNum = mask.alphanumeric(reqNumInput)

    if (!normalizedReqNum) {
      setInputError('Informe o numero da requisicao.')
      setSubmittedReqNum(undefined)
      return
    }

    setInputError('')
    setLastSavedDevolucao(null)
    setSubmittedReqNum(normalizedReqNum)
  }

  const buildSalvarDevolucaoPayload = (): SalvarDevolucaoPayload => {
    if (!requisicao?.req_num) {
      throw new Error('Requisicao de dispensacao invalida.')
    }

    const solicitadoPor = getStoredSessionUsername()

    if (!solicitadoPor) {
      throw new Error('Nao foi possivel identificar o solicitante.')
    }

    return {
      data: formatDateForApi(formatDateForInput(new Date())),
      itens: itens.map((item) => ({
        lote: item.ite_lote,
        med_id: Number(item.ite_med_id || 0),
        qtde: Number(item.ite_qtde || 0),
        validade: formatDateValueForApi(item.ite_validade),
      })),
      observacao: String(requisicao.req_observacao ?? '').trim(),
      req_id: 0,
      req_num_dispesa: requisicao.req_num,
      req_num_dispensacao: requisicao.req_num,
      solicitado_por: solicitadoPor,
    }
  }

  const salvarDevolucaoMutation = useMutation({
    mutationFn: () => salvarDevolucao(buildSalvarDevolucaoPayload()),
    onSuccess: (data) => {
      const devolucaoNumero = data.req_num?.trim()
      const devolucaoNumeroMascarado = mask.requisitionNumber(devolucaoNumero)
      const devolucaoId = Number(data.req_id || 0)

      setLastSavedDevolucao(devolucaoId > 0 ? {
        reqId: devolucaoId,
        reqNum: devolucaoNumeroMascarado || devolucaoNumero || String(devolucaoId),
      } : null)

      if (devolucaoNumero) {
        message.notify({
          icon: 'success',
          persistent: true,
          text: (
            <ReferenceNotification
              body={`Devolucao registrada com ${itens.length} item(ns).`}
              hint="Anote este numero antes de fechar a mensagem."
              label="Numero da devolucao"
              value={devolucaoNumeroMascarado || devolucaoNumero}
            />
          ),
          title: 'Devolucao salva',
        })
      } else {
        message.success('Devolucao salva', 'Registro criado com sucesso.')
      }
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar devolucao', getErrorMessage(error))
    },
  })

  return (
    <section className="boname-page entradas-page entradas-page--merged-layout">
      <PageSection
        className="entradas-page__merged-section devolucao-medicamento-page__section"
      >
        <div className="boname-page__toolbar devolucao-medicamento-page__toolbar">
          <div className="boname-page__field devolucao-medicamento-page__search-field">
            <label htmlFor="devolucao-medicamento-req-num">Numero da Requisicao</label>
            <Input
              id="devolucao-medicamento-req-num"
              className="boname-page__search-input"
              value={reqNumInput}
              placeholder="Informe o numero da requisicao aprovada"
              inputMode="text"
              onChange={(value) => {
                setReqNumInput(value)
                if (inputError) {
                  setInputError('')
                }
              }}
              onPressEnter={() => void handleSearch()}
            />
            {inputError ? <span>{inputError}</span> : <small>Use o numero gerado da requisicao.</small>}
          </div>

          <HStack className="boname-page__toolbar-actions devolucao-medicamento-page__toolbar-actions" spacing={10}>
            <Whisper placement="top" trigger={['hover', 'focus']} speaker={<Tooltip>Buscar requisicao para devolucao</Tooltip>}>
              <Button
                appearance="primary"
                startIcon={<SearchIcon />}
                disabled={requisicaoQuery.isFetching}
                loading={requisicaoQuery.isFetching}
                onClick={() => void handleSearch()}
              >
                Buscar
              </Button>
            </Whisper>
          </HStack>
        </div>

        {!hasSearch ? (
          <DataState
            state="empty"
            title="Informe uma requisicao"
            description="A busca consulta a rota GET /requisicoes/buscar_para_devolucao/:req_num."
          />
        ) : null}

        {hasSearch && requisicaoQuery.isPending ? (
          <DataState
            state="loading"
            title="Buscando requisicao..."
            description="Consultando os dados para devolucao."
          />
        ) : null}

        {hasSearch && requisicaoQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel buscar a requisicao"
            description={getErrorMessage(requisicaoQuery.error, 'Erro ao buscar requisicao para devolucao.')}
            action={
              <Button appearance="primary" onClick={() => void requisicaoQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!requisicaoQuery.isPending && !requisicaoQuery.isError && hasSearch && requisicao ? (
          <div className="aprovacao-entradas-page__modal-shell devolucao-medicamento-page__content">
            <div className="aprovacao-entradas-page__modal-summary">
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>Data</span>
                <strong>{mask.date(requisicao.req_date)}</strong>
              </div>
              <div className="aprovacao-entradas-page__modal-summary-card">
                <span>{requisicaoDestino?.label ?? 'Paciente/Setor'}</span>
                <div className="devolucao-medicamento-page__summary-person">
                  <strong>{mask.text(requisicaoDestino?.id)}</strong>
                  <p className="devolucao-medicamento-page__summary-name">{mask.text(requisicaoDestino?.nome)}</p>
                </div>
              </div>
            </div>

            <section className="aprovacao-entradas-page__modal-panel">
              {!hasItems ? (
                <DataState
                  state="empty"
                  title="Nenhum item encontrado"
                  description="A requisicao consultada nao retornou itens para devolucao."
                />
              ) : null}

              {hasItems && isCompactLayout ? (
                <div className="boname-page__card-list">
                  {itens.map((item) => (
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
                          <dt>Lote</dt>
                          <dd>{mask.text(item.ite_lote)}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{mask.date(item.ite_validade)}</dd>
                        </div>
                        <div>
                          <dt>Unidade</dt>
                          <dd>{mask.text(item.med_und)}</dd>
                        </div>
                      </dl>
                    </Panel>
                  ))}
                </div>
              ) : null}

              {hasItems && !isCompactLayout ? (
                <div className="boname-page__table-wrap">
                  <Table
                    data={itens}
                    height={tableHeight}
                    fillHeight
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column flexGrow={1.8} minWidth={260}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>{(rowData: RequisicaoDevolucaoItemRecord) => mask.text(rowData.med_descr)}</Cell>
                    </Column>

                    <Column width={132}>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell>{(rowData: RequisicaoDevolucaoItemRecord) => mask.text(rowData.ite_lote)}</Cell>
                    </Column>

                    <Column width={128}>
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: RequisicaoDevolucaoItemRecord) => mask.date(rowData.ite_validade)}</Cell>
                    </Column>

                    <Column width={118} align="center">
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell>{(rowData: RequisicaoDevolucaoItemRecord) => mask.text(rowData.med_und)}</Cell>
                    </Column>

                    <Column width={118} align="center">
                      <HeaderCell>Quantidade</HeaderCell>
                      <Cell>
                        {(rowData: RequisicaoDevolucaoItemRecord) => (
                          <StatusBadge tone="info">{mask.number(rowData.ite_qtde)}</StatusBadge>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>
              ) : null}

              {hasItems ? (
                <div className="devolucao-medicamento-page__footer-actions">
                  <Button
                    appearance="primary"
                    startIcon={<CheckIcon />}
                    loading={salvarDevolucaoMutation.isPending}
                    disabled={saveDisabled || salvarDevolucaoMutation.isPending}
                    onClick={() => salvarDevolucaoMutation.mutate()}
                  >
                    Salvar
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </PageSection>
    </section>
  )
}

export default DevolucaoMedicamentoPage
