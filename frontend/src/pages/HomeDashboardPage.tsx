import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Button, DatePicker, HStack, Panel, SelectPicker } from 'rsuite'
import { RiBarChartGroupedLine, RiCapsuleLine, RiFileList3Line, RiRefreshLine } from 'react-icons/ri'
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

const VALUE_PRIORITY = ['qtde', 'quantidade', 'total', 'atendimento', 'atendimentos', 'frascos', 'entrada', 'saida', 'estoque']
const PERIOD_KEYS = new Set(['ano', 'mes'])
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

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
        precision: 0,
      },
    },
  },
}

const GAUCHER_CHART_OPTIONS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: true,
      labels: {
        boxHeight: 10,
        boxWidth: 10,
        color: '#334155',
        font: {
          weight: 600,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y ?? 0)}`,
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
        precision: 0,
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

function buildTableColumns(rows: DashboardRecord[]): TableColumn<DashboardRecord>[] {
  return getRowKeys(rows).map((key) => ({
    header: formatHeader(key),
    key,
    minWidth: key.includes('descr') || key.includes('nome') ? 220 : 120,
    render: (row) => formatValue(row[key]),
    size: key.includes('descr') || key.includes('nome') ? 'fluid' : 'md',
  }))
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

function buildGaucherChartData(rows: DashboardRecord[]): ChartData<'bar'> | undefined {
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
        borderColor: '#115e59',
        borderRadius: 4,
        borderWidth: 1,
        data: visibleRows.map(([, atendimentos]) => atendimentos),
        label: 'Atendimentos',
        maxBarThickness: 30,
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

function getMonthLabel(month: number) {
  return MONTH_OPTIONS.find((option) => option.value === month)?.label ?? String(month)
}

function DashboardChart({ points, title }: { points: ChartPoint[], title: string }) {
  if (points.length === 0) {
    return <DataState state="empty" title="Grafico indisponivel" description={`Sem dados numericos para ${title.toLowerCase()}.`} />
  }

  const data: ChartData<'bar'> = {
    labels: points.map((point) => point.label),
    datasets: [
      {
        backgroundColor: '#2563eb',
        barPercentage: 0.72,
        borderColor: '#1d4ed8',
        borderRadius: 4,
        borderWidth: 1,
        data: points.map((point) => point.value),
        label: 'Quantidade',
        maxBarThickness: 28,
      },
    ],
  }

  return (
    <div className="dashboard-chart">
      <Bar aria-label={`Grafico de barras - ${title}`} data={data} options={BAR_CHART_OPTIONS} role="img" />
    </div>
  )
}

function GaucherDashboardChart({ rows }: { rows: DashboardRecord[] }) {
  const data = buildGaucherChartData(rows)

  if (!data) {
    return <DataState state="empty" title="Grafico indisponivel" description="Sem dados numericos para atendimentos Gaucher." />
  }

  return (
    <div className="dashboard-chart dashboard-chart--gaucher">
      <Bar aria-label="Grafico de atendimentos Gaucher" data={data} options={GAUCHER_CHART_OPTIONS} role="img" />
    </div>
  )
}

function DashboardDatasetSection({ dataset, rows }: { dataset: DashboardDataset, rows: DashboardRecord[] }) {
  const columns = buildTableColumns(rows)
  const points = dataset.tableOnly ? [] : buildChartPoints(rows)

  return (
    <Panel bordered className={`dashboard-page__dataset-card${dataset.tableOnly ? ' dashboard-page__dataset-card--boname' : ''}`}>
      <div className="dashboard-page__dataset-card-header">
        <span>{dataset.tableOnly ? 'Tabela' : 'Grafico e tabela'}</span>
        <strong>{dataset.title}</strong>
        <p>{dataset.description}</p>
      </div>
      {!dataset.tableOnly ? (
        <div className="dashboard-page__chart-area">
          {dataset.chartKind === 'gaucher' ? <GaucherDashboardChart rows={rows} /> : <DashboardChart points={points} title={dataset.title} />}
        </div>
      ) : null}
      <div className="dashboard-page__table-frame">
        {rows.length > 0 ? (
          <Table<DashboardRecord>
            columns={columns}
            data={rows}
            rowKey={(_row, rowIndex) => `${dataset.key}-${rowIndex}`}
            wordWrap
          />
        ) : (
          <DataState state="empty" title="Nenhum dado encontrado" description="A API retornou a lista vazia para este bloco." />
        )}
      </div>
    </Panel>
  )
}

export function HomeDashboardPage({ onOpenSection }: HomeDashboardPageProps) {
  void onOpenSection

  const [selectedDate, setSelectedDate] = useState(() => new Date())
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
  const hemoderivadosRows = getDatasetRows(response, 'atendimentos_hemoderivados')
  const bonameRows = getDatasetRows(response, 'relatorio_boname')
  const datasetRows = DATASETS.map((dataset) => ({
    dataset,
    rows: getDatasetRows(response, dataset.key),
  }))

  return (
    <section className="dashboard-page">
      <PageSection
        title="Dashboard corporativo"
        description={`Indicadores de ${getMonthLabel(mes)} de ${ano}.`}
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
        <div className="summary-grid dashboard-page__summary-grid">
          <SummaryCard
            label="Hemofilicos"
            value={formatNumber(sumRows(hemofilicosRows))}
            hint={`${hemofilicosRows.length} registro(s) retornado(s).`}
            icon={<RiBarChartGroupedLine size={18} />}
          />
          <SummaryCard
            accent="teal"
            label="Gaucher"
            value={formatNumber(sumRows(gaucherRows))}
            hint={`${gaucherRows.length} registro(s) retornado(s).`}
            icon={<RiBarChartGroupedLine size={18} />}
          />
          <SummaryCard
            accent="amber"
            label="Frascos"
            value={formatNumber(sumRows(fatoresRows))}
            hint={`${fatoresRows.length} registro(s) retornado(s).`}
            icon={<RiCapsuleLine size={18} />}
          />
          <SummaryCard
            accent="slate"
            label="Boname"
            value={formatNumber(bonameRows.length)}
            hint={`Entrada ${formatNumber(sumBoname(bonameRows, 'entrada'))} | Saida ${formatNumber(sumBoname(bonameRows, 'saida'))} | Estoque ${formatNumber(sumBoname(bonameRows, 'estoque'))}.`}
            icon={<RiFileList3Line size={18} />}
          />
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
        <div className="dashboard-page__sections">
          <DashboardDatasetSection dataset={DATASETS[0]} rows={hemofilicosRows} />
          <DashboardDatasetSection dataset={DATASETS[1]} rows={gaucherRows} />
          <DashboardDatasetSection dataset={DATASETS[2]} rows={fatoresRows} />
          <DashboardDatasetSection dataset={DATASETS[3]} rows={hemoderivadosRows} />
          <DashboardDatasetSection dataset={DATASETS[4]} rows={datasetRows[4].rows} />
        </div>
      ) : null}
    </section>
  )
}

export default HomeDashboardPage
