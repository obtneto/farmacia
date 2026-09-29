import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Line } from 'react-chartjs-2'
import { Button, DatePicker, HStack, Input, InputGroup, Panel, SelectPicker } from 'rsuite'
import {
  RiBarChartGroupedLine,
  RiCapsuleLine,
  RiFileList3Line,
  RiRefreshLine,
  RiSearchLine,
} from 'react-icons/ri'
import type { SectionKey } from '../config/navigation'
import { DataState, PageSection, SummaryCard } from '../components/ui'
import { Table, type TableColumn } from '../components/Table'
import { apiRequest } from '../lib/api'

type DashboardValue = boolean | null | number | string | undefined
type DashboardRecord = Record<string, DashboardValue>

interface DashboardResponse {
  atendimentos_gaucer?: DashboardRecord[]
  atendimentos_hemoderivados?: DashboardRecord[]
  atendimentos_hemofilicos?: DashboardRecord[]
  dispensa_fatores_frascos?: DashboardRecord[]
  relatorio_boname?: DashboardRecord[]
}

interface DashboardDataset {
  chartKind?: 'gaucher'
  description: string
  key: keyof DashboardResponse
  tableOnly?: boolean
  title: string
}

interface ChartPoint {
  label: string
  value: number
}

export interface HomeDashboardPageProps {
  onOpenSection: (sectionKey: SectionKey) => void
}

const DATASETS: DashboardDataset[] = [
  {
    description: 'Atendimentos de pacientes hemofilicos no periodo selecionado.',
    key: 'atendimentos_hemofilicos',
    title: 'Atendimentos hemofilicos',
  },
  {
    chartKind: 'gaucher',
    description: 'Atendimentos Gaucher consolidados por indicador da visao mensal.',
    key: 'atendimentos_gaucer',
    title: 'Atendimentos Gaucher',
  },
  {
    description: 'Dispensacao de fatores organizada por frascos no mes.',
    key: 'dispensa_fatores_frascos',
    title: 'Fatores por frascos',
  },
  {
    description: 'Atendimentos por hemoderivados retornados pela API.',
    key: 'atendimentos_hemoderivados',
    title: 'Atendimentos hemoderivados',
  },
  {
    description: 'Entradas, estoque e saidas por codigo Boname. Mantido somente em tabela.',
    key: 'relatorio_boname',
    tableOnly: true,
    title: 'Relatorio Boname',
  },
]

const MONTH_OPTIONS = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Marco', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
]
const BONAME_FILTER_OPTIONS = [
  { label: 'Todos os itens', value: 'all' },
  { label: 'Com entrada', value: 'entrada' },
  { label: 'Com saida', value: 'saida' },
  { label: 'Com estoque', value: 'estoque' },
]

const VALUE_PRIORITY = ['qtde', 'quantidade', 'total', 'atendimento', 'atendimentos', 'frascos', 'entrada', 'saida', 'estoque']
const PERIOD_KEYS = new Set(['ano', 'mes'])
type BonameFilter = 'all' | 'entrada' | 'estoque' | 'saida'
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const BAR_CHART_OPTIONS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => formatNumber(context.parsed.y ?? 0),
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#334155',
        font: {
          size: 10,
          weight: 600,
        },
      },
    },
    y: {
      beginAtZero: true,
      border: {
        display: false,
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 10,
        },
        precision: 0,
      },
    },
  },
}

const LINE_CHART_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => formatNumber(context.parsed.y ?? 0),
      },
    },
  },
  scales: {
    x: {
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      ticks: {
        color: '#334155',
        font: {
          size: 10,
          weight: 600,
        },
      },
    },
    y: {
      beginAtZero: true,
      border: {
        display: false,
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 10,
        },
        precision: 0,
      },
    },
  },
}

const BONAME_CHART_OPTIONS: ChartOptions<'bar'> = {
  ...BAR_CHART_OPTIONS,
  plugins: {
    legend: {
      display: true,
      labels: {
        boxHeight: 8,
        boxWidth: 8,
        color: '#334155',
        font: {
          size: 10,
          weight: 600,
        },
      },
    },
    tooltip: BAR_CHART_OPTIONS.plugins?.tooltip,
  },
  scales: {
    ...BAR_CHART_OPTIONS.scales,
    x: {
      ...BAR_CHART_OPTIONS.scales?.x,
      ticks: {
        display: false,
      },
    },
  },
}

function fetchDashboard(ano: number, mes: number) {
  return apiRequest<DashboardResponse>(`/dashboard/listar/${ano}-${mes}`)
}

function isRecordArray(value: DashboardResponse[keyof DashboardResponse]): value is DashboardRecord[] {
  return Array.isArray(value)
}

function getDatasetRows(data: DashboardResponse | undefined, key: keyof DashboardResponse) {
  const rows = data?.[key]
  return isRecordArray(rows) ? rows : []
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)
}

function formatValue(value: DashboardValue) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'number') {
    return formatNumber(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }

  return value
}

function toFiniteNumber(value: DashboardValue) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const parsed = Number(value.trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function getRowKeys(rows: DashboardRecord[]) {
  const keys: string[] = []

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key)
      }
    })
  })

  return keys
}

function formatHeader(key: string) {
  return key
    .replace(/^bona_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('pt-BR'))
}

function getNumericKeys(rows: DashboardRecord[]) {
  return getRowKeys(rows).filter((key) => {
    if (PERIOD_KEYS.has(key.toLocaleLowerCase('pt-BR'))) {
      return false
    }

    return rows.some((row) => toFiniteNumber(row[key]) !== undefined)
  })
}

function getPreferredNumericKey(rows: DashboardRecord[]) {
  const numericKeys = getNumericKeys(rows)
  const preferred = numericKeys.find((key) => {
    const normalizedKey = key.toLocaleLowerCase('pt-BR')
    return VALUE_PRIORITY.some((priority) => normalizedKey.includes(priority))
  })

  return preferred ?? numericKeys[0]
}

function getLabelKey(rows: DashboardRecord[]) {
  return getRowKeys(rows).find((key) => {
    if (PERIOD_KEYS.has(key.toLocaleLowerCase('pt-BR'))) {
      return false
    }

    return rows.some((row) => typeof row[key] === 'string' && String(row[key]).trim().length > 0)
  })
}

function buildChartPoints(rows: DashboardRecord[]): ChartPoint[] {
  const numericKeys = getNumericKeys(rows)

  if (rows.length <= 1 && numericKeys.length > 1) {
    const row = rows[0]

    return numericKeys.map((key) => ({
      label: formatHeader(key),
      value: toFiniteNumber(row?.[key]) ?? 0,
    }))
  }

  const valueKey = getPreferredNumericKey(rows)

  if (!valueKey) {
    return []
  }

  const labelKey = getLabelKey(rows)

  return rows.slice(0, 10).map((row, index) => ({
    label: labelKey ? String(row[labelKey] ?? `Registro ${index + 1}`) : `Registro ${index + 1}`,
    value: toFiniteNumber(row[valueKey]) ?? 0,
  }))
}

function buildLineChartData(points: ChartPoint[], color: string): ChartData<'line'> {
  return {
    labels: points.map((point) => point.label),
    datasets: [
      {
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        data: points.map((point) => point.value),
        label: 'Quantidade',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 3,
        tension: 0.36,
      },
    ],
  }
}

function buildBarChartData(points: ChartPoint[], color: string): ChartData<'bar'> {
  return {
    labels: points.map((point) => point.label),
    datasets: [
      {
        backgroundColor: color,
        barPercentage: 0.62,
        borderColor: color,
        borderRadius: 4,
        borderWidth: 1,
        data: points.map((point) => point.value),
        label: 'Quantidade',
        maxBarThickness: 32,
      },
    ],
  }
}

function formatChartLabel(label: string) {
  return label.length > 22 ? `${label.slice(0, 19)}...` : label
}

function buildBonameChartData(rows: DashboardRecord[]): ChartData<'bar'> | undefined {
  if (rows.length === 0) {
    return undefined
  }

  const visibleRows = rows.slice(0, 5)

  return {
    labels: visibleRows.map((row, index) => formatChartLabel(getBonameDescription(row, index))),
    datasets: [
      {
        backgroundColor: '#2563eb',
        borderColor: '#1d4ed8',
        borderRadius: 4,
        data: visibleRows.map((row) => toFiniteNumber(row.entrada) ?? 0),
        label: 'Entrada',
        maxBarThickness: 18,
      },
      {
        backgroundColor: '#16a34a',
        borderColor: '#15803d',
        borderRadius: 4,
        data: visibleRows.map((row) => toFiniteNumber(row.saida) ?? 0),
        label: 'Saida',
        maxBarThickness: 18,
      },
      {
        backgroundColor: '#64748b',
        borderColor: '#475569',
        borderRadius: 4,
        data: visibleRows.map((row) => toFiniteNumber(row.estoque) ?? 0),
        label: 'Estoque',
        maxBarThickness: 18,
      },
    ],
  }
}

function buildGaucherChartData(rows: DashboardRecord[]): ChartData<'line'> | undefined {
  const medDescrKey = getRowKeys(rows).find((key) => key.toLocaleLowerCase('pt-BR') === 'med_descr')
  const atendimentosKey = getRowKeys(rows).find((key) => key.toLocaleLowerCase('pt-BR') === 'atendimentos')

  if (!medDescrKey || !atendimentosKey) {
    return undefined
  }

  const totalsByMedicine = new Map<string, number>()

  rows.forEach((row, index) => {
    const medicine = String(row[medDescrKey] ?? `Medicamento ${index + 1}`).trim()
    const atendimentos = toFiniteNumber(row[atendimentosKey])

    if (atendimentos === undefined) {
      return
    }

    totalsByMedicine.set(medicine, (totalsByMedicine.get(medicine) ?? 0) + atendimentos)
  })

  const visibleRows = Array.from(totalsByMedicine.entries()).slice(0, 10)

  if (visibleRows.length === 0) {
    return undefined
  }

  return {
    labels: visibleRows.map(([medicine]) => medicine),
    datasets: [
      {
        backgroundColor: '#0f766e',
        borderColor: '#0f766e',
        borderWidth: 2,
        data: visibleRows.map(([, atendimentos]) => atendimentos),
        label: 'Atendimentos',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0f766e',
        pointBorderWidth: 2,
        pointRadius: 3,
        tension: 0.36,
      },
    ],
  }
}

function sumRows(rows: DashboardRecord[]) {
  const preferredKey = getPreferredNumericKey(rows)

  if (!preferredKey) {
    return rows.length
  }

  return rows.reduce((total, row) => total + (toFiniteNumber(row[preferredKey]) ?? 0), 0)
}

function sumBoname(rows: DashboardRecord[], key: string) {
  return rows.reduce((total, row) => total + (toFiniteNumber(row[key]) ?? 0), 0)
}

function countRows(groups: DashboardRecord[][]) {
  return groups.reduce((total, rows) => total + rows.length, 0)
}

function getMonthLabel(month: number) {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? String(month)
}

function getRecordText(row: DashboardRecord) {
  return Object.values(row).map((value) => formatValue(value)).join(' ').toLocaleLowerCase('pt-BR')
}

function filterBonameRows(rows: DashboardRecord[], search: string, filter: BonameFilter) {
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')

  return rows.filter((row) => {
    const matchesSearch = normalizedSearch ? getRecordText(row).includes(normalizedSearch) : true

    if (!matchesSearch) {
      return false
    }

    if (filter === 'all') {
      return true
    }

    return (toFiniteNumber(row[filter]) ?? 0) > 0
  })
}

function getBonameDescription(row: DashboardRecord, index: number) {
  return String(row.bona_descr ?? row.med_descr ?? row.descricao ?? `Item Boname ${index + 1}`)
}

function getBonameCode(row: DashboardRecord, index: number) {
  return String(row.bona_codigo ?? row.bona_cod ?? row.codigo ?? row.med_codigo ?? `BNM-${String(index + 1).padStart(3, '0')}`)
}

function LineDashboardChart({ color, points, title }: { color: string, points: ChartPoint[], title: string }) {
  if (points.length === 0) {
    return <DataState state="empty" title="Grafico indisponivel" description={`Sem dados numericos para ${title.toLowerCase()}.`} />
  }

  return (
    <div className="dashboard-chart">
      <Line aria-label={`Grafico de linha - ${title}`} data={buildLineChartData(points, color)} options={LINE_CHART_OPTIONS} role="img" />
    </div>
  )
}

function BarDashboardChart({ color, points, title }: { color: string, points: ChartPoint[], title: string }) {
  if (points.length === 0) {
    return <DataState state="empty" title="Grafico indisponivel" description={`Sem dados numericos para ${title.toLowerCase()}.`} />
  }

  return (
    <div className="dashboard-chart">
      <Bar aria-label={`Grafico de barras - ${title}`} data={buildBarChartData(points, color)} options={BAR_CHART_OPTIONS} role="img" />
    </div>
  )
}

function GaucherDashboardChart({ rows }: { rows: DashboardRecord[] }) {
  const data = buildGaucherChartData(rows)

  if (!data) {
    return <DataState state="empty" title="Grafico indisponivel" description="Sem dados numericos para atendimentos Gaucher." />
  }

  return (
    <div className="dashboard-chart">
      <Line aria-label="Grafico de atendimentos Gaucher" data={data} options={LINE_CHART_OPTIONS} role="img" />
    </div>
  )
}

function BonameDashboardChart({ rows }: { rows: DashboardRecord[] }) {
  const data = buildBonameChartData(rows)

  if (!data) {
    return <DataState state="empty" title="Grafico indisponivel" description="Sem dados para movimentacao Boname." />
  }

  return (
    <div className="dashboard-chart">
      <Bar aria-label="Grafico de movimentacao Boname" data={data} options={BONAME_CHART_OPTIONS} role="img" />
    </div>
  )
}

function DashboardChartPanel({ dataset, rows, subtitle }: { dataset: DashboardDataset, rows: DashboardRecord[], subtitle: string }) {
  const points = buildChartPoints(rows)
  const chart = dataset.chartKind === 'gaucher'
    ? <GaucherDashboardChart rows={rows} />
    : dataset.key === 'dispensa_fatores_frascos'
      ? <BarDashboardChart color="#2563eb" points={points} title={dataset.title} />
      : dataset.key === 'relatorio_boname'
        ? <BonameDashboardChart rows={rows} />
        : <LineDashboardChart color="#2563eb" points={points} title={dataset.title} />

  return (
    <Panel bordered className="dashboard-page__chart-card">
      <div className="dashboard-page__chart-card-header">
        <div>
          <strong>{dataset.title}</strong>
          <span>{subtitle}</span>
        </div>
        <small>{rows.length} registros</small>
      </div>
      {chart}
    </Panel>
  )
}

function DashboardDatasetSection({
  filter,
  rows,
  search,
  setFilter,
  setSearch,
}: {
  filter: BonameFilter
  rows: DashboardRecord[]
  search: string
  setFilter: (filter: BonameFilter) => void
  setSearch: (search: string) => void
}) {
  const columns: TableColumn<DashboardRecord>[] = [
    {
      header: 'Codigo',
      key: 'codigo',
      minWidth: 110,
      render: (row, rowIndex) => getBonameCode(row, rowIndex),
      size: 'sm',
    },
    {
      header: 'Descricao',
      key: 'descricao',
      minWidth: 280,
      render: (row, rowIndex) => getBonameDescription(row, rowIndex),
      size: 'fluid',
    },
    {
      align: 'right',
      header: 'Entrada',
      key: 'entrada',
      minWidth: 110,
      render: (row) => formatNumber(toFiniteNumber(row.entrada) ?? 0),
      size: 'sm',
    },
    {
      align: 'right',
      header: 'Saida',
      key: 'saida',
      minWidth: 110,
      render: (row) => formatNumber(toFiniteNumber(row.saida) ?? 0),
      size: 'sm',
    },
    {
      align: 'right',
      cellClassName: 'dashboard-page__saldo-cell',
      header: 'Estoque / Saldo',
      key: 'estoque',
      minWidth: 120,
      render: (row) => formatNumber(toFiniteNumber(row.estoque) ?? 0),
      size: 'sm',
    },
  ]
  const totalEntrada = sumBoname(rows, 'entrada')
  const totalSaida = sumBoname(rows, 'saida')
  const totalEstoque = sumBoname(rows, 'estoque')

  return (
    <Panel bordered className="dashboard-page__dataset-card dashboard-page__dataset-card--boname">
      <div className="dashboard-page__dataset-card-top">
        <div className="dashboard-page__dataset-card-header">
          <strong>Relatorio de Movimentacao Boname</strong>
          <p>Entradas e saidas do mes · saldo atual por item</p>
        </div>
        <HStack className="dashboard-page__table-tools" spacing={12} wrap>
          <InputGroup inside className="dashboard-page__search">
            <InputGroup.Addon>
              <RiSearchLine aria-hidden="true" />
            </InputGroup.Addon>
            <Input
              aria-label="Buscar codigo ou descricao"
              placeholder="Buscar codigo ou descricao"
              value={search}
              onChange={setSearch}
            />
          </InputGroup>
          <SelectPicker
            cleanable={false}
            data={BONAME_FILTER_OPTIONS}
            searchable={false}
            value={filter}
            onChange={(value) => {
              if (value === 'all' || value === 'entrada' || value === 'saida' || value === 'estoque') {
                setFilter(value)
              }
            }}
          />
        </HStack>
      </div>
      <div className="dashboard-page__table-frame">
        {rows.length > 0 ? (
          <>
            <Table<DashboardRecord>
              columns={columns}
              data={rows}
              rowKey={(_row, rowIndex) => `boname-${rowIndex}`}
              wordWrap
            />
            <div className="dashboard-page__table-total" aria-label="Totais do periodo Boname">
              <strong>Total do periodo</strong>
              <span>{formatNumber(totalEntrada)}</span>
              <span>{formatNumber(totalSaida)}</span>
              <span>{formatNumber(totalEstoque)}</span>
            </div>
            <div className="dashboard-page__table-footer">
              <span>{formatNumber(rows.length)} itens filtrados · {formatNumber(totalEstoque)} em estoque</span>
              <span>SisStock · Farmacia / HEMOSE</span>
            </div>
          </>
        ) : (
          <DataState state="empty" title="Nenhum dado encontrado" description="Ajuste a busca ou filtro da tabela." />
        )}
      </div>
    </Panel>
  )
}

export function HomeDashboardPage({ onOpenSection }: HomeDashboardPageProps) {
  void onOpenSection

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [bonameSearch, setBonameSearch] = useState('')
  const [bonameFilter, setBonameFilter] = useState<BonameFilter>('all')
  const ano = selectedDate.getFullYear()
  const mes = selectedDate.getMonth() + 1

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', ano, mes],
    queryFn: () => fetchDashboard(ano, mes),
    staleTime: 1000 * 60 * 5,
  })

  const response = dashboardQuery.data
  const hemofilicosRows = getDatasetRows(response, 'atendimentos_hemofilicos')
  const gaucherRows = getDatasetRows(response, 'atendimentos_gaucer')
  const fatoresRows = getDatasetRows(response, 'dispensa_fatores_frascos')
  const bonameRows = getDatasetRows(response, 'relatorio_boname')
  const filteredBonameRows = filterBonameRows(bonameRows, bonameSearch, bonameFilter)
  const datasetRows = DATASETS.map((dataset) => ({
    dataset,
    rows: getDatasetRows(response, dataset.key),
  }))
  const loadedDatasets = datasetRows.filter(({ rows }) => rows.length > 0).length
  const totalRecords = countRows(datasetRows.map(({ rows }) => rows))
  const periodLabel = `${getMonthLabel(mes)} de ${ano}`
  const dashboardStatus = dashboardQuery.isFetching
    ? 'Atualizando'
    : dashboardQuery.isError
      ? 'Falha na carga'
      : dashboardQuery.isSuccess
        ? 'Dados carregados'
        : 'Aguardando consulta'

  return (
    <section className="dashboard-page">
      <PageSection
        className="dashboard-page__hero"
        title="Dashboard"
        description="Visao dos atendimentos, distribuicao e estoque."
        actions={
          <HStack className="dashboard-page__filters" spacing={8} wrap>
            <SelectPicker
              cleanable={false}
              data={MONTH_OPTIONS}
              labelKey="label"
              searchable={false}
              value={mes}
              valueKey="value"
              onChange={(value) => {
                if (typeof value === 'number') {
                  setSelectedDate(new Date(ano, value - 1, 1))
                }
              }}
            />
            <DatePicker
              cleanable={false}
              format="yyyy"
              oneTap
              value={selectedDate}
              onChange={(value) => {
                if (value) {
                  setSelectedDate(new Date(value.getFullYear(), mes - 1, 1))
                }
              }}
            />
            <Button appearance="primary" startIcon={<RiRefreshLine />} loading={dashboardQuery.isFetching} onClick={() => void dashboardQuery.refetch()}>
              Atualizar
            </Button>
          </HStack>
        }
      >
        <div className="dashboard-page__period-row">
          <span>{periodLabel}</span>
          <strong>{dashboardQuery.isSuccess ? 'DADOS DA API' : 'CONSULTA DO PERIODO'}</strong>
        </div>
        <div className="summary-grid dashboard-page__summary-grid">
          <SummaryCard
            label="Atendimentos hemofilicos"
            value={formatNumber(sumRows(hemofilicosRows))}
            hint={`${hemofilicosRows.length} registros no mes.`}
            icon={<RiBarChartGroupedLine size={18} />}
          />
          <SummaryCard
            accent="teal"
            label="Atendimentos Gaucher"
            value={formatNumber(sumRows(gaucherRows))}
            hint={`${gaucherRows.length} registros no mes.`}
            icon={<RiBarChartGroupedLine size={18} />}
          />
          <SummaryCard
            accent="amber"
            label="Frascos distribuidos"
            value={formatNumber(sumRows(fatoresRows))}
            hint={`${fatoresRows.length} registros no mes.`}
            icon={<RiCapsuleLine size={18} />}
          />
          <SummaryCard
            accent="slate"
            label="Boname"
            value={formatNumber(sumBoname(bonameRows, 'estoque'))}
            hint={`Entrada ${formatNumber(sumBoname(bonameRows, 'entrada'))} · Saida ${formatNumber(sumBoname(bonameRows, 'saida'))}.`}
            icon={<RiFileList3Line size={18} />}
          />
        </div>
        <div className="dashboard-page__status-line" aria-label="Resumo operacional do dashboard">
          <span>{loadedDatasets}/{DATASETS.length} blocos com dados</span>
          <span>{formatNumber(totalRecords)} registros analisados</span>
          <strong>{dashboardStatus}</strong>
        </div>
      </PageSection>

      {dashboardQuery.isPending ? (
        <DataState state="loading" title="Carregando dashboard" description="Consultando os indicadores mensais da API." />
      ) : null}

      {dashboardQuery.isError ? (
        <DataState
          state="error"
          title="Falha ao carregar dashboard"
          description={dashboardQuery.error.message}
          action={<Button appearance="primary" onClick={() => void dashboardQuery.refetch()}>Tentar novamente</Button>}
        />
      ) : null}

      {dashboardQuery.isSuccess ? (
        <>
          <div className="dashboard-page__charts">
            <DashboardChartPanel dataset={DATASETS[0]} rows={hemofilicosRows} subtitle="Atendimentos no mes · evolucao do periodo" />
            <DashboardChartPanel dataset={DATASETS[1]} rows={gaucherRows} subtitle="Atendimentos no mes · evolucao do periodo" />
            <DashboardChartPanel dataset={DATASETS[2]} rows={fatoresRows} subtitle="Quantidade por periodo" />
            <DashboardChartPanel dataset={DATASETS[4]} rows={bonameRows} subtitle="Entrada, saida e estoque no periodo" />
          </div>
          <DashboardDatasetSection
            filter={bonameFilter}
            rows={filteredBonameRows}
            search={bonameSearch}
            setFilter={setBonameFilter}
            setSearch={setBonameSearch}
          />
        </>
      ) : null}
    </section>
  )
}

export default HomeDashboardPage
