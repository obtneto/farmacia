import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import PrintIcon from '@rsuite/icons/legacy/Print'
import SearchIcon from '@rsuite/icons/Search'
import { Button, Checkbox, DatePicker, HStack, Input, InputGroup, Pagination, Panel, SelectPicker, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { DataState, PageSection } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import '../boname/BonameCrudPage.css'

interface ApiResponse<T> {
  data: T
  err: number
  msg: string
  status: number
}

interface DepositoOptionRecord {
  dep_descr: string
  dep_id: number
}

interface TipoMedicamentoOptionRecord {
  tipo_codigo: string
  tipo_descr: string
}

interface SelectOption<TValue extends number | string = number> {
  label: string
  value: TValue
}

interface EstoqueRecord {
  descricao?: string | null
  descricao_comercial?: string | null
  id?: number
  lote?: string | null
  med_descr?: string | null
  med_descr_coml?: string | null
  medicamento_id?: number
  med_id?: number
  med_lote?: string | null
  med_und?: string | null
  med_validade?: Date | string | null
  saldo_disponivel?: number
  unidade?: string | null
  validade?: Date | string | null
}

interface FormValues {
  dataInventario: Date
  depositoId: number | null
  tipoInventario: InventarioTipo
  tipoMedicamentoCodigo: string | null
}

interface SaveInventarioResponse {
  inv_id?: number
  inv_num?: string
}

type FormErrors = Partial<Record<keyof FormValues | 'itens', string>>
type InventarioTipo = 'Parcial' | 'Total'

const LOCAL_STORAGE_TOKEN_KEYS = ['authToken', 'access_token', 'token', 'jwtToken']
const PAGE_SIZE = 10
const INVENTARIO_TIPO_OPTIONS: Array<SelectOption<InventarioTipo>> = [
  { label: 'Parcial', value: 'Parcial' },
  { label: 'Total', value: 'Total' },
]

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

function formatDateForInput(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

function formatDateForDisplay(value: Date | string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatDateForPayload(value: Date | string | null | undefined): string {
  if (!value) {
    return ''
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return `${formatDateForInput(parsedDate)}T00:00:00`
}

async function requestInventario<T>(
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
    // Respostas fora do contrato JSON sao tratadas pelo status HTTP.
  }

  if (!response.ok || payload?.err) {
    throw new Error(payload?.msg || `Falha ao processar requisicao (${response.status}).`)
  }

  if (!payload) {
    throw new Error('Resposta vazia do backend.')
  }

  return payload.data
}

async function requestInventarioBlob(
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

function validateForm(values: FormValues, selectedCount: number): FormErrors {
  const errors: FormErrors = {}

  if (!values.dataInventario) {
    errors.dataInventario = 'Informe a data do inventario.'
  }

  if (!values.depositoId || values.depositoId <= 0) {
    errors.depositoId = 'Selecione o deposito.'
  }

  if (!values.tipoMedicamentoCodigo?.trim()) {
    errors.tipoMedicamentoCodigo = 'Selecione o tipo de medicamento.'
  }

  if (!values.tipoInventario) {
    errors.tipoInventario = 'Selecione o tipo de inventario.'
  }

  if (selectedCount === 0) {
    errors.itens = 'Selecione ao menos um item para criar o inventario.'
  }

  return errors
}

function getMedicamentoId(item: EstoqueRecord): number {
  return Number(item.med_id ?? item.medicamento_id ?? 0)
}

function getMedicamentoDescricao(item: EstoqueRecord): string {
  return item.med_descr || item.descricao || 'Medicamento sem descricao'
}

function getMedicamentoDescricaoComercial(item: EstoqueRecord): string {
  return item.med_descr_coml || item.descricao_comercial || '-'
}

function getMedicamentoUnidade(item: EstoqueRecord): string {
  return item.med_und || item.unidade || '-'
}

function getMedicamentoLote(item: EstoqueRecord): string {
  return item.med_lote || item.lote || ''
}

function getMedicamentoValidade(item: EstoqueRecord): Date | string | null | undefined {
  return item.med_validade ?? item.validade
}

function getItemKey(item: EstoqueRecord): string {
  return `${getMedicamentoId(item)}-${getMedicamentoLote(item)}-${String(getMedicamentoValidade(item) ?? '')}`
}

function toInventarioItem(item: EstoqueRecord) {
  return {
    iti_med_id: getMedicamentoId(item),
    iti_lote: getMedicamentoLote(item),
    iti_validade: formatDateForPayload(getMedicamentoValidade(item)),
    iti_qtde_estoque: Number(item.saldo_disponivel ?? 0),
    iti_qtde_dif: 0,
  }
}

async function imprimirFichaInventario(baseUrl: string, invNum: string, authToken?: string | null): Promise<void> {
  const pdfBlob = await requestInventarioBlob(
    baseUrl,
    `/inventarios/imprimir/${encodeURIComponent(invNum)}`,
    authToken,
  )

  const pdfUrl = window.URL.createObjectURL(pdfBlob)
  const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

  if (!openedWindow) {
    const anchor = document.createElement('a')
    anchor.href = pdfUrl
    anchor.download = `ficha-inventario-${invNum}.pdf`
    anchor.click()
  }

  window.setTimeout(() => {
    window.URL.revokeObjectURL(pdfUrl)
  }, 60_000)
}

export interface NovoInventarioPageProps {
  apiBaseUrl?: string
  authToken?: string | null
}

export function NovoInventarioPage({
  apiBaseUrl = getApiBaseUrl(),
  authToken,
}: NovoInventarioPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const resolvedAuthToken = authToken ?? getStoredToken()
  const [formValues, setFormValues] = useState<FormValues>({
    dataInventario: new Date(),
    depositoId: null,
    tipoInventario: 'Parcial',
    tipoMedicamentoCodigo: null,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set())
  const [searchValue, setSearchValue] = useState('')
  const [activePage, setActivePage] = useState(1)
  const [lastCreatedInventario, setLastCreatedInventario] = useState<SaveInventarioResponse | null>(null)

  const depositosQuery = useQuery({
    queryKey: ['inventario-depositos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => requestInventario<DepositoOptionRecord[]>(
      apiBaseUrl,
      '/parametros/depositos/listar/*',
      { method: 'GET' },
      resolvedAuthToken,
    ),
  })

  const tiposMedicamentosQuery = useQuery({
    queryKey: ['inventario-tipos-medicamentos', apiBaseUrl, resolvedAuthToken],
    queryFn: () => requestInventario<TipoMedicamentoOptionRecord[]>(
      apiBaseUrl,
      '/parametros/tipos_medicamentos/listar-ativos/*',
      { method: 'GET' },
      resolvedAuthToken,
    ),
  })

  const canListStock = Boolean(formValues.depositoId && formValues.tipoMedicamentoCodigo)
  const estoqueQuery = useQuery({
    queryKey: [
      'inventario-estoque',
      apiBaseUrl,
      formValues.depositoId,
      formValues.tipoMedicamentoCodigo,
      resolvedAuthToken,
    ],
    queryFn: () => requestInventario<EstoqueRecord[]>(
      apiBaseUrl,
      `/estoque/listar/*/${formValues.depositoId ?? 0}/${encodeURIComponent(formValues.tipoMedicamentoCodigo ?? '')}`,
      { method: 'GET' },
      resolvedAuthToken,
    ),
    enabled: canListStock,
  })

  const estoqueRecords = estoqueQuery.data ?? []
  const effectiveSelectedKeys = formValues.tipoInventario === 'Total'
    ? new Set(estoqueRecords.map(getItemKey))
    : selectedKeys
  const selectedRecords = estoqueRecords.filter((item) => effectiveSelectedKeys.has(getItemKey(item)))
  const canCreateInventario = Boolean(
    formValues.dataInventario
    && formValues.depositoId
    && formValues.tipoMedicamentoCodigo
    && formValues.tipoInventario
    && selectedRecords.length > 0,
  )
  const normalizedSearchValue = normalizeSearchText(searchValue)
  const filteredRecords = normalizedSearchValue
    ? estoqueRecords.filter((item) => {
      const searchableText = normalizeSearchText([
        getMedicamentoDescricao(item),
        getMedicamentoDescricaoComercial(item),
      ].join(' '))

      return searchableText.includes(normalizedSearchValue)
    })
    : estoqueRecords

  const saveMutation = useMutation({
    mutationFn: () => requestInventario<SaveInventarioResponse>(
      apiBaseUrl,
      '/inventarios/novo',
      {
        method: 'POST',
        body: JSON.stringify({
          inv_date: formatDateForPayload(formValues.dataInventario),
          dep_id: formValues.depositoId ?? 0,
          med_tipo_codigo: formValues.tipoMedicamentoCodigo ?? '',
          inv_tipo: formValues.tipoInventario,
          itens: selectedRecords.map(toInventarioItem),
        }),
      },
      resolvedAuthToken,
    ),
    onSuccess: async (data) => {
      setLastCreatedInventario(data)
      await message.success('Inventario criado', 'Inventario aberto com sucesso.')
      setSelectedKeys(new Set())
      await estoqueQuery.refetch()
    },
    onError: async (error) => {
      await message.message({
        icon: 'error',
        title: 'Nao foi possivel criar o inventario',
        text: getErrorMessage(error),
      })
    },
  })

  const depositoOptions: Array<SelectOption<number>> = (depositosQuery.data ?? [])
    .map((item) => ({
      label: item.dep_descr,
      value: Number(item.dep_id),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const tipoMedicamentoOptions: Array<SelectOption<string>> = (tiposMedicamentosQuery.data ?? [])
    .map((item) => ({
      label: `${item.tipo_descr} (${item.tipo_codigo})`,
      value: item.tipo_codigo,
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'pt-BR'))

  const hasDependencyError = depositosQuery.isError || tiposMedicamentosQuery.isError
  const hasRecords = estoqueRecords.length > 0
  const hasFilteredRecords = filteredRecords.length > 0
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = filteredRecords.slice(pageStart, pageStart + PAGE_SIZE)
  const tableLabelStart = hasFilteredRecords ? pageStart + 1 : 0
  const tableLabelEnd = hasFilteredRecords ? pageStart + paginatedRecords.length : 0
  const tableHeight = isCompactLayout ? 360 : 430

  const handleToggleItem = (item: EstoqueRecord, checked: boolean) => {
    const itemKey = getItemKey(item)
    setLastCreatedInventario(null)
    setSelectedKeys((current) => {
      const nextKeys = new Set(current)

      if (checked) {
        nextKeys.add(itemKey)
      } else {
        nextKeys.delete(itemKey)
      }

      return nextKeys
    })
    setFormErrors((current) => ({ ...current, itens: undefined }))
  }

  const handleCriarInventario = async () => {
    const nextErrors = validateForm(formValues, selectedRecords.length)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Revise os dados',
        text: 'Preencha os campos obrigatorios e selecione os itens do inventario.',
      })
      return
    }

    saveMutation.mutate()
  }

  const printMutation = useMutation({
    mutationFn: async () => {
      const invNum = lastCreatedInventario?.inv_num?.trim()

      if (!invNum) {
        throw new Error('Nenhum inventario disponivel para impressao.')
      }

      await imprimirFichaInventario(apiBaseUrl, invNum, resolvedAuthToken)
    },
    onSuccess: () => {
      message.success('Impressao gerada', 'A ficha de inventario foi aberta em uma nova guia.')
    },
    onError: (error: Error) => {
      message.error('Erro ao imprimir inventario', getErrorMessage(error))
    },
  })

  return (
    <section className="boname-page estoque-page estoque-page--merged-layout inventario-page">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <div className="boname-page__form-grid estoque-page__filters-grid">
          <div className="boname-page__field estoque-page__filter-field">
            <label id="inventario-data-label">Data Inventario</label>
            <DatePicker
              aria-labelledby="inventario-data-label"
              cleanable={false}
              className={formErrors.dataInventario ? 'boname-page__control inventario-page__date-control boname-page__control--error' : 'boname-page__control inventario-page__date-control'}
              format="dd/MM/yyyy"
              oneTap
              value={formValues.dataInventario}
              onChange={(value) => {
                setLastCreatedInventario(null)
                setFormValues((current) => ({
                  ...current,
                  dataInventario: value ?? new Date(),
                }))
                setFormErrors((current) => ({ ...current, dataInventario: undefined }))
              }}
            />
            {formErrors.dataInventario ? <span role="alert">{formErrors.dataInventario}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="inventario-deposito-label">Depositos</label>
            <SelectPicker
              aria-labelledby="inventario-deposito-label"
              className={formErrors.depositoId ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              cleanable={false}
              data={depositoOptions}
              loading={depositosQuery.isPending}
              placeholder="Selecione o deposito"
              searchable
              value={formValues.depositoId}
              onChange={(value) => {
                setLastCreatedInventario(null)
                setFormValues((current) => ({
                  ...current,
                  depositoId: value == null ? null : Number(value),
                }))
                setFormErrors((current) => ({ ...current, depositoId: undefined }))
                setSelectedKeys(new Set())
                setSearchValue('')
                setActivePage(1)
              }}
            />
            {formErrors.depositoId ? <span role="alert">{formErrors.depositoId}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="inventario-tipo-medicamento-label">Tipo Medicamento</label>
            <SelectPicker
              aria-labelledby="inventario-tipo-medicamento-label"
              className={formErrors.tipoMedicamentoCodigo ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              cleanable={false}
              data={tipoMedicamentoOptions}
              loading={tiposMedicamentosQuery.isPending}
              placeholder="Selecione o tipo"
              searchable
              value={formValues.tipoMedicamentoCodigo}
              onChange={(value) => {
                setLastCreatedInventario(null)
                setFormValues((current) => ({
                  ...current,
                  tipoMedicamentoCodigo: typeof value === 'string' ? value : null,
                }))
                setFormErrors((current) => ({ ...current, tipoMedicamentoCodigo: undefined }))
                setSelectedKeys(new Set())
                setSearchValue('')
                setActivePage(1)
              }}
            />
            {formErrors.tipoMedicamentoCodigo ? <span role="alert">{formErrors.tipoMedicamentoCodigo}</span> : null}
          </div>

          <div className="boname-page__field estoque-page__filter-field">
            <label id="inventario-tipo-label">Tipo Inventario</label>
            <SelectPicker
              aria-labelledby="inventario-tipo-label"
              className={formErrors.tipoInventario ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
              cleanable={false}
              data={INVENTARIO_TIPO_OPTIONS}
              searchable={false}
              value={formValues.tipoInventario}
              onChange={(value) => {
                setLastCreatedInventario(null)
                setFormValues((current) => ({
                  ...current,
                  tipoInventario: value === 'Total' ? 'Total' : 'Parcial',
                }))
                setFormErrors((current) => ({ ...current, tipoInventario: undefined, itens: undefined }))
              }}
            />
            {formErrors.tipoInventario ? <span role="alert">{formErrors.tipoInventario}</span> : null}
          </div>
        </div>

        {canListStock ? (
          <div className="inventario-page__search-field">
            <InputGroup inside className="boname-page__search-input inventario-page__search-input">
              <Input
                id="inventario-pesquisa"
                aria-label="Pesquisar por descricao ou descricao comercial"
                disabled={!hasRecords}
                placeholder="Pesquisar por descricao ou descricao comercial"
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value)
                  setActivePage(1)
                }}
              />
              <InputGroup.Addon>
                <SearchIcon />
              </InputGroup.Addon>
            </InputGroup>
          </div>
        ) : null}

        {hasDependencyError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar os filtros"
            description="Verifique os cadastros de depositos e tipos de medicamentos."
            action={
              <Button
                appearance="primary"
                onClick={() => void Promise.all([depositosQuery.refetch(), tiposMedicamentosQuery.refetch()])}
              >
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!hasDependencyError && !canListStock ? (
          <DataState
            state="empty"
            title="Informe os filtros do inventario"
            description="Selecione deposito e tipo de medicamento para carregar os itens do estoque."
          />
        ) : null}

        {canListStock && estoqueQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando estoque..."
            description="Consultando itens para abertura do inventario."
          />
        ) : null}

        {canListStock && estoqueQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel listar o estoque"
            description={getErrorMessage(estoqueQuery.error, 'Erro ao listar o estoque.')}
            action={
              <Button appearance="primary" onClick={() => void estoqueQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {canListStock && !estoqueQuery.isPending && !estoqueQuery.isError && !hasRecords ? (
          <DataState
            state="empty"
            title="Nenhum item encontrado"
            description="Nao ha itens para o deposito e tipo de medicamento informados."
          />
        ) : null}

        {canListStock && !estoqueQuery.isPending && !estoqueQuery.isError && hasRecords ? (
          <>
            {formErrors.itens ? <span className="inventario-page__error" role="alert">{formErrors.itens}</span> : null}

            {hasFilteredRecords ? (
              <>
                <div className="boname-page__table-content">
                  {isCompactLayout ? (
                    <div className="boname-page__card-list">
                      {paginatedRecords.map((item) => {
                        const itemKey = getItemKey(item)
                        const checked = effectiveSelectedKeys.has(itemKey)

                        return (
                          <Panel bordered key={itemKey} className="boname-page__record-card">
                            <div className="boname-page__record-card-top">
                              <div>
                                <strong>{getMedicamentoDescricao(item)}</strong>
                                <p>{getMedicamentoDescricaoComercial(item)}</p>
                              </div>
                              <Checkbox
                                checked={checked}
                                disabled={formValues.tipoInventario === 'Total'}
                                onChange={(_, nextChecked) => handleToggleItem(item, nextChecked)}
                              />
                            </div>
                            <dl className="boname-page__record-meta estoque-page__record-meta">
                              <div>
                                <dt>ID</dt>
                                <dd>{getMedicamentoId(item)}</dd>
                              </div>
                              <div>
                                <dt>Unidade</dt>
                                <dd>{getMedicamentoUnidade(item)}</dd>
                              </div>
                              <div>
                                <dt>Lote</dt>
                                <dd>{getMedicamentoLote(item) || '-'}</dd>
                              </div>
                              <div>
                                <dt>Validade</dt>
                                <dd>{formatDateForDisplay(getMedicamentoValidade(item))}</dd>
                              </div>
                            </dl>
                          </Panel>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="boname-page__table-wrap">
                      <Table
                        autoHeight={false}
                        bordered
                        data={paginatedRecords}
                        fillHeight
                        height={tableHeight}
                        rowHeight={54}
                        headerHeight={52}
                        virtualized
                      >
                        <Column width={86} align="center" fixed>
                          <HeaderCell>Sel.</HeaderCell>
                          <Cell>
                            {(rowData: EstoqueRecord) => {
                              const itemKey = getItemKey(rowData)

                              return (
                                <Checkbox
                                  checked={effectiveSelectedKeys.has(itemKey)}
                                  disabled={formValues.tipoInventario === 'Total'}
                                  onChange={(_, checked) => handleToggleItem(rowData, checked)}
                                />
                              )
                            }}
                          </Cell>
                        </Column>

                        <Column width={76} align="center" fixed>
                          <HeaderCell>ID</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => getMedicamentoId(rowData)}</Cell>
                        </Column>

                        <Column flexGrow={1.25} minWidth={220}>
                          <HeaderCell>Descricao</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => getMedicamentoDescricao(rowData)}</Cell>
                        </Column>

                        <Column flexGrow={1.15} minWidth={220}>
                          <HeaderCell>Descricao Comercial</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => getMedicamentoDescricaoComercial(rowData)}</Cell>
                        </Column>

                        <Column width={110} align="center">
                          <HeaderCell>Unidade</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => getMedicamentoUnidade(rowData)}</Cell>
                        </Column>

                        <Column width={150}>
                          <HeaderCell>Lote</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => getMedicamentoLote(rowData) || '-'}</Cell>
                        </Column>

                        <Column width={140}>
                          <HeaderCell>Validade</HeaderCell>
                          <Cell>{(rowData: EstoqueRecord) => formatDateForDisplay(getMedicamentoValidade(rowData))}</Cell>
                        </Column>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="boname-page__table-footer">
                  <p>
                    Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de <strong>{filteredRecords.length}</strong> registros.
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
                    total={filteredRecords.length}
                    onChangePage={setActivePage}
                  />
                </div>
              </>
            ) : (
              <DataState
                state="empty"
                title="Nenhum item encontrado"
                description="A pesquisa nao retornou itens pela descricao ou descricao comercial."
              />
            )}
          </>
        ) : null}

        <div className="boname-page__table-footer inventario-page__footer">
          <HStack spacing={10} className="boname-page__toolbar-actions">
            <Button
              appearance="ghost"
              disabled={!lastCreatedInventario?.inv_num || printMutation.isPending}
              loading={printMutation.isPending}
              startIcon={<PrintIcon />}
              onClick={() => printMutation.mutate()}
            >
              Impressão
            </Button>
            <Button
              appearance="primary"
              disabled={!canCreateInventario || saveMutation.isPending}
              loading={saveMutation.isPending}
              onClick={() => void handleCriarInventario()}
            >
              Criar Inventario
            </Button>
          </HStack>
        </div>
      </PageSection>
    </section>
  )
}

export default NovoInventarioPage
