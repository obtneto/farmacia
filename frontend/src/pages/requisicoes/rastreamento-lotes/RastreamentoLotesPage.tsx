import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, IconButton, Input, InputNumber, Panel, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from '../../../components/Table'
import { DataState, PageSection, StatusBadge } from '../../../components/ui'
import { getErrorMessage, useMessage } from '../../../hooks/useMessage'
import { useMask } from '../../../hooks/useMask'
import { apiRequest } from '../../../lib/api'
import '../../boname/BonameCrudPage.css'
import '../../estoque/ConsultaMovimentacoesPage.css'
import './RastreamentoLotesPage.css'

type LoteResumoRecord = {
  est_lote?: string | null
  est_saldo_disponivel?: number | string | null
  ite_ent_qtde?: number | string | null
  med_descr?: string | null
  med_descr_coml?: string | null
  med_id?: number | string | null
  med_und?: string | null
  qtd_entrada?: number | string | null
  qtde_entrada?: number | string | null
  quantidade_entrada?: number | string | null
  saldo?: number | string | null
  saldo_final?: number | string | null
  unidade?: string | null
}

type LoteSaidaRecord = {
  'Paciente/Setor'?: string | null
  ite_lote?: string | null
  ite_qtde?: number | string | null
  ite_validade?: string | null
  med_descr?: string | null
  med_descr_coml?: string | null
  med_id?: number | string | null
  med_und?: string | null
  req_aprovado_por?: string | null
  req_date?: string | null
  req_num?: string | null
  req_solicitado_por?: string | null
}

type LoteEstoqueRecord = {
  dep_descr?: string | null
  dias_para_validade?: number | string | null
  est_lote?: string | null
  est_saldo_bloqueado?: number | string | null
  est_saldo_disponivel?: number | string | null
  est_validade?: string | null
  med_descr?: string | null
  med_descr_coml?: string | null
  med_id?: number | string | null
  med_und?: string | null
}

type DetailPanelKind = 'entrada' | 'saldo' | 'saida'

async function rastrearLote(lote: string): Promise<LoteResumoRecord> {
  return apiRequest<LoteResumoRecord>(`/requisicoes/rastrear_lote/${encodeURIComponent(lote)}`)
}

async function listarItensLote(lote: string): Promise<LoteSaidaRecord[]> {
  return apiRequest<LoteSaidaRecord[]>(`/requisicoes/itens_lote/${encodeURIComponent(lote)}`)
}

async function listarEstoqueLote(lote: string): Promise<LoteEstoqueRecord[]> {
  return apiRequest<LoteEstoqueRecord[]>(`/estoque/itens_lote/${encodeURIComponent(lote)}`)
}

function normalizeLote(value: string): string {
  return value.trim().toLocaleUpperCase('pt-BR')
}

function getNumberValue(...values: Array<number | string | null | undefined>): number {
  for (const value of values) {
    const numberValue = Number(value)

    if (Number.isFinite(numberValue)) {
      return numberValue
    }
  }

  return 0
}

function getSaidaTotal(records: LoteSaidaRecord[]): number {
  return records.reduce((total, record) => total + getNumberValue(record.ite_qtde), 0)
}

function getMedicamento(resumo: LoteResumoRecord | undefined, records: LoteSaidaRecord[]): string {
  return resumo?.med_descr || records[0]?.med_descr || ''
}

function getUnidade(resumo: LoteResumoRecord | undefined, records: LoteSaidaRecord[]): string {
  return resumo?.med_und || resumo?.unidade || records[0]?.med_und || ''
}

function getQuantidadeEntrada(resumo: LoteResumoRecord | undefined): number {
  return getNumberValue(
    resumo?.qtd_entrada,
    resumo?.qtde_entrada,
    resumo?.quantidade_entrada,
    resumo?.ite_ent_qtde,
  )
}

function getSaldoFinal(resumo: LoteResumoRecord | undefined): number {
  return getNumberValue(resumo?.saldo_final, resumo?.est_saldo_disponivel, resumo?.saldo)
}

export function RastreamentoLotesPage() {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const mask = useMask()
  const message = useMessage()
  const [loteInput, setLoteInput] = useState('')
  const [submittedLote, setSubmittedLote] = useState<string | undefined>()
  const [inputError, setInputError] = useState('')
  const [detailPanel, setDetailPanel] = useState<DetailPanelKind | undefined>()

  const resumoQuery = useQuery({
    queryKey: ['rastreamento-lote-resumo', submittedLote],
    queryFn: () => rastrearLote(submittedLote ?? ''),
    enabled: submittedLote !== undefined,
    retry: false,
  })

  const saidasQuery = useQuery({
    queryKey: ['rastreamento-lote-saidas', submittedLote],
    queryFn: () => listarItensLote(submittedLote ?? ''),
    enabled: submittedLote !== undefined,
    retry: false,
  })

  const estoqueQuery = useQuery({
    queryKey: ['rastreamento-lote-estoque', submittedLote],
    queryFn: () => listarEstoqueLote(submittedLote ?? ''),
    enabled: detailPanel === 'saldo' && submittedLote !== undefined,
    retry: false,
  })

  const saidas = saidasQuery.data ?? []
  const estoques = estoqueQuery.data ?? []
  const hasSearch = submittedLote !== undefined
  const isLoading = resumoQuery.isPending || saidasQuery.isPending
  const hasError = resumoQuery.isError || saidasQuery.isError
  const hasData = hasSearch && !isLoading && !hasError && (resumoQuery.data !== undefined || saidas.length > 0)
  const medicamento = getMedicamento(resumoQuery.data, saidas)
  const unidade = getUnidade(resumoQuery.data, saidas)
  const quantidadeEntrada = getQuantidadeEntrada(resumoQuery.data)
  const saldoFinal = getSaldoFinal(resumoQuery.data)
  const quantidadeSaida = getSaidaTotal(saidas)

  const handleSearch = async () => {
    const lote = normalizeLote(loteInput)

    if (!lote) {
      setInputError('Informe o lote.')
      setSubmittedLote(undefined)
      return
    }

    setInputError('')
    setDetailPanel(undefined)
    setSubmittedLote(lote)
  }

  const handleRetry = async () => {
    const results = await Promise.all([resumoQuery.refetch(), saidasQuery.refetch()])
    const failedResult = results.find((result) => result.isError)

    if (failedResult) {
      await message.error('Erro ao rastrear lote', getErrorMessage(failedResult.error))
    }
  }

  const renderDetailButton = (kind: DetailPanelKind, label: string) => (
    <Whisper
      placement="top"
      trigger={['hover', 'focus']}
      speaker={<Tooltip>{label}</Tooltip>}
    >
      <IconButton
        appearance="subtle"
        aria-label={label}
        circle
        className="boname-page__action-icon boname-page__action-icon--view rastreamento-lotes-page__detail-button"
        disabled={!hasData}
        icon={<VisibleIcon />}
        onClick={() => setDetailPanel(kind)}
      />
    </Whisper>
  )

  const detailTitle = detailPanel === 'entrada'
    ? 'Detalhes da entrada'
    : detailPanel === 'saldo'
      ? 'Detalhes do saldo final'
      : 'Detalhes da quantidade de saída'

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout rastreamento-lotes-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <div className="rastreamento-lotes-page__content">
          <section className="rastreamento-lotes-page__summary-panel" aria-label="Resumo do lote">
            <div className="boname-page__form-grid estoque-page__filters-grid rastreamento-lotes-page__header-grid">
              <div className="boname-page__field estoque-page__filter-field">
                <label htmlFor="rastreamento-lotes-lote">Lote</label>
                <Input
                  id="rastreamento-lotes-lote"
                  className={inputError ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  placeholder="Digite o numero do Lote"
                  value={loteInput}
                  onChange={(value) => {
                    setLoteInput(value)
                    if (inputError) {
                      setInputError('')
                    }
                  }}
                  onPressEnter={() => void handleSearch()}
                />
                {inputError ? <span role="alert">{inputError}</span> : null}
              </div>

              <div className="boname-page__field estoque-page__actions-field rastreamento-lotes-page__search-action">
                <label className="estoque-page__actions-label">Pesquisar</label>
                <Whisper placement="top" trigger={['hover', 'focus']} speaker={<Tooltip>Pesquisar lote</Tooltip>}>
                  <IconButton
                    appearance="primary"
                    aria-label="Pesquisar lote"
                    className="rastreamento-lotes-page__search-button"
                    icon={<SearchIcon />}
                    loading={hasSearch && (resumoQuery.isFetching || saidasQuery.isFetching)}
                    onClick={() => void handleSearch()}
                  />
                </Whisper>
              </div>
            </div>

            {hasData ? (
              <>
              <div className="rastreamento-lotes-page__metric-row">
                <label htmlFor="rastreamento-lotes-quantidade-entrada">Quantidade Entrada</label>
                <InputNumber
                  id="rastreamento-lotes-quantidade-entrada"
                  className="boname-page__control rastreamento-lotes-page__number-input"
                  controls={false}
                  readOnly
                  value={quantidadeEntrada}
                />
                {renderDetailButton('entrada', 'Detalhar quantidade entrada')}
              </div>

              <div className="rastreamento-lotes-page__metric-row">
                <label htmlFor="rastreamento-lotes-saldo-final">Saldo Final</label>
                <InputNumber
                  id="rastreamento-lotes-saldo-final"
                  className="boname-page__control rastreamento-lotes-page__number-input"
                  controls={false}
                  readOnly
                  value={saldoFinal}
                />
                {renderDetailButton('saldo', 'Detalhar saldo final')}
              </div>

              <div className="rastreamento-lotes-page__metric-row">
                <label htmlFor="rastreamento-lotes-quantidade-saida">Quantidade Saida</label>
                <InputNumber
                  id="rastreamento-lotes-quantidade-saida"
                  className="boname-page__control rastreamento-lotes-page__number-input"
                  controls={false}
                  readOnly
                  value={quantidadeSaida}
                />
                {renderDetailButton('saida', 'Detalhar quantidade saida')}
              </div>
              </>
            ) : null}
          </section>

          <section className="rastreamento-lotes-page__table-panel" aria-label="Detalhamento do lote">
            {!hasSearch ? (
              <DataState
                state="empty"
                title="Informe um lote"
                description="A busca consulta as movimentacoes vinculadas ao lote informado."
              />
            ) : null}

            {hasSearch && isLoading ? (
              <DataState
                state="loading"
                title="Rastreando lote..."
                description="Consultando entradas, saldo e saidas do lote."
              />
            ) : null}

            {hasSearch && hasError ? (
              <DataState
                state="error"
                title="Nao foi possivel rastrear o lote"
                description={getErrorMessage(resumoQuery.error ?? saidasQuery.error, 'Erro ao consultar o lote.')}
                action={
                  <Button appearance="primary" onClick={() => void handleRetry()}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : null}

            {hasData && !detailPanel ? (
                <DataState
                  state="empty"
                  title="Selecione um detalhamento"
                  description="Use os botoes ao lado das quantidades para abrir os dados do lote."
                />
              ) : null}

              {hasData && detailPanel ? (
                <dl className="boname-page__record-meta rastreamento-lotes-page__details-meta">
                  <div>
                    <dt>Lote</dt>
                    <dd>{mask.text(submittedLote)}</dd>
                  </div>
                  <div>
                    <dt>Medicamento</dt>
                    <dd>{mask.text(medicamento)}</dd>
                  </div>
                  <div>
                    <dt>Unidade</dt>
                    <dd>{mask.text(unidade)}</dd>
                  </div>
                  <div>
                    <dt>{detailTitle}</dt>
                    <dd>
                      {detailPanel === 'entrada'
                        ? mask.number(quantidadeEntrada)
                        : detailPanel === 'saldo'
                          ? mask.number(saldoFinal)
                          : mask.number(quantidadeSaida)}
                    </dd>
                  </div>
                </dl>
              ) : null}

              {detailPanel === 'entrada' ? (
                <div className="boname-page__table-wrap rastreamento-lotes-page__details-table">
                  <Table
                    autoHeight={false}
                    bordered
                    data={resumoQuery.data ? [resumoQuery.data] : []}
                    fillHeight
                    headerHeight={52}
                    rowHeight={56}
                  >
                    <Column width={140} fixed>
                      <HeaderCell>Lote</HeaderCell>
                      <Cell>{(rowData: LoteResumoRecord) => mask.text(rowData.est_lote ?? submittedLote)}</Cell>
                    </Column>
                    <Column flexGrow={1.6} minWidth={260}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>{(rowData: LoteResumoRecord) => mask.text(rowData.med_descr)}</Cell>
                    </Column>
                    <Column width={118} align="center">
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell>{(rowData: LoteResumoRecord) => mask.text(rowData.med_und ?? rowData.unidade)}</Cell>
                    </Column>
                    <Column width={150} align="right">
                      <HeaderCell>Qtd. Entrada</HeaderCell>
                      <Cell>{(rowData: LoteResumoRecord) => mask.number(getQuantidadeEntrada(rowData))}</Cell>
                    </Column>
                  </Table>
                </div>
              ) : null}

              {detailPanel === 'saida' && !saidas.length ? (
                <DataState
                  state="empty"
                  title="Nenhuma saida encontrada"
                  description="Nao ha itens de requisicao vinculados ao lote pesquisado."
                />
              ) : null}

              {detailPanel === 'saida' && saidas.length > 0 && isCompactLayout ? (
                <div className="boname-page__card-list">
                  {saidas.map((item) => (
                    <Panel bordered key={`${item.req_num ?? 'req'}-${item.med_id ?? 'med'}-${item.req_date ?? 'data'}`} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.requisitionNumber(item.req_num) || mask.text(item.req_num)}</strong>
                          <p>{mask.text(item['Paciente/Setor'])}</p>
                        </div>
                        <StatusBadge tone="info">{mask.number(item.ite_qtde)}</StatusBadge>
                      </div>
                      <dl className="boname-page__record-meta rastreamento-lotes-page__record-meta">
                        <div>
                          <dt>Data</dt>
                          <dd>{mask.date(item.req_date)}</dd>
                        </div>
                        <div>
                          <dt>Solicitado por</dt>
                          <dd>{mask.text(item.req_solicitado_por)}</dd>
                        </div>
                        <div>
                          <dt>Aprovado por</dt>
                          <dd>{mask.text(item.req_aprovado_por)}</dd>
                        </div>
                      </dl>
                    </Panel>
                  ))}
                </div>
              ) : null}

              {detailPanel === 'saida' && saidas.length > 0 && !isCompactLayout ? (
                <div className="boname-page__table-wrap">
                  <Table
                    autoHeight={false}
                    bordered
                    data={saidas}
                    fillHeight
                    headerHeight={52}
                    rowHeight={56}
                    virtualized
                  >
                    <Column width={150} fixed>
                      <HeaderCell>Requisicao</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.requisitionNumber(rowData.req_num) || mask.text(rowData.req_num)}</Cell>
                    </Column>

                    <Column width={122}>
                      <HeaderCell>Data</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.date(rowData.req_date)}</Cell>
                    </Column>

                    <Column flexGrow={1.4} minWidth={220}>
                      <HeaderCell>Paciente/Setor</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.text(rowData['Paciente/Setor'])}</Cell>
                    </Column>

                    <Column width={126} align="right">
                      <HeaderCell>Quantidade</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.number(rowData.ite_qtde)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={180}>
                      <HeaderCell>Solicitado por</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.text(rowData.req_solicitado_por)}</Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={180}>
                      <HeaderCell>Aprovado por</HeaderCell>
                      <Cell>{(rowData: LoteSaidaRecord) => mask.text(rowData.req_aprovado_por)}</Cell>
                    </Column>
                  </Table>
                </div>
              ) : null}

              {detailPanel === 'saldo' && estoqueQuery.isPending ? (
                <DataState
                  state="loading"
                  title="Carregando saldo..."
                  description="Consultando itens de estoque do lote."
                />
              ) : null}

              {detailPanel === 'saldo' && estoqueQuery.isError ? (
                <DataState
                  state="error"
                  title="Nao foi possivel carregar o saldo"
                  description={getErrorMessage(estoqueQuery.error, 'Erro ao consultar itens de estoque do lote.')}
                  action={
                    <Button appearance="primary" onClick={() => void estoqueQuery.refetch()}>
                      Tentar novamente
                    </Button>
                  }
                />
              ) : null}

              {detailPanel === 'saldo' && !estoqueQuery.isPending && !estoqueQuery.isError && !estoques.length ? (
                <DataState
                  state="empty"
                  title="Nenhum saldo encontrado"
                  description="Nao ha itens de estoque vinculados ao lote pesquisado."
                />
              ) : null}

              {detailPanel === 'saldo' && !estoqueQuery.isPending && !estoqueQuery.isError && estoques.length > 0 && isCompactLayout ? (
                <div className="boname-page__card-list">
                  {estoques.map((item) => (
                    <Panel bordered key={`${item.dep_descr ?? 'deposito'}-${item.med_id ?? 'med'}-${item.est_validade ?? 'validade'}`} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{mask.text(item.dep_descr)}</strong>
                          <p>{mask.text(item.med_descr)}</p>
                        </div>
                        <StatusBadge tone="info">{mask.number(item.est_saldo_disponivel)}</StatusBadge>
                      </div>
                      <dl className="boname-page__record-meta rastreamento-lotes-page__record-meta">
                        <div>
                          <dt>Saldo bloqueado</dt>
                          <dd>{mask.number(item.est_saldo_bloqueado)}</dd>
                        </div>
                        <div>
                          <dt>Validade</dt>
                          <dd>{mask.date(item.est_validade)}</dd>
                        </div>
                        <div>
                          <dt>Dias validade</dt>
                          <dd>{mask.text(item.dias_para_validade)}</dd>
                        </div>
                      </dl>
                    </Panel>
                  ))}
                </div>
              ) : null}

              {detailPanel === 'saldo' && !estoqueQuery.isPending && !estoqueQuery.isError && estoques.length > 0 && !isCompactLayout ? (
                <div className="boname-page__table-wrap rastreamento-lotes-page__details-table">
                  <Table
                    autoHeight={false}
                    bordered
                    data={estoques}
                    fillHeight
                    headerHeight={52}
                    rowHeight={56}
                    virtualized
                  >
                    <Column flexGrow={1.2} minWidth={220} fixed>
                      <HeaderCell>Deposito</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.text(rowData.dep_descr)}</Cell>
                    </Column>
                    <Column flexGrow={1.6} minWidth={260}>
                      <HeaderCell>Medicamento</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.text(rowData.med_descr)}</Cell>
                    </Column>
                    <Column width={118} align="center">
                      <HeaderCell>Unidade</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.text(rowData.med_und)}</Cell>
                    </Column>
                    <Column width={136} align="right">
                      <HeaderCell>Saldo Final</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.number(rowData.est_saldo_disponivel)}</Cell>
                    </Column>
                    <Column width={142} align="right">
                      <HeaderCell>Bloqueado</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.number(rowData.est_saldo_bloqueado)}</Cell>
                    </Column>
                    <Column width={126}>
                      <HeaderCell>Validade</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.date(rowData.est_validade)}</Cell>
                    </Column>
                    <Column width={126} align="center">
                      <HeaderCell>Dias Val.</HeaderCell>
                      <Cell>{(rowData: LoteEstoqueRecord) => mask.text(rowData.dias_para_validade)}</Cell>
                    </Column>
                  </Table>
                </div>
              ) : null}

          </section>
        </div>
      </PageSection>
    </section>
  )
}

export default RastreamentoLotesPage
