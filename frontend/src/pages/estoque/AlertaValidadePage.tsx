import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReloadIcon from '@rsuite/icons/Reload'
import { Button, Panel, useMediaQuery } from 'rsuite'
import { Table, type TableColumn } from '../../components/Table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { getErrorMessage } from '../../hooks/useMessage'
import { apiRequest } from '../../lib/api'
import '../boname/BonameCrudPage.css'
import './AlertaValidadePage.css'

export interface AlertaValidadeRecord {
  alerta_validade?: number | null
  dep_descr?: string | null
  dias?: number | string | null
  dias_para_validade?: number | string | null
  est_lote?: string | null
  est_med_id?: number | null
  est_saldo_bloqueado?: number | null
  est_saldo_disponivel?: number | null
  est_validade?: Date | string | null
  med_alert?: number | null
  med_descr?: string | null
  med_und?: string | null
}

export interface AlertaValidadePageProps {
  records?: AlertaValidadeRecord[]
}

function formatDateForDisplay(value: Date | string | null | undefined): string {
  if (!value) {
    return '-'
  }

  if (typeof value === 'string') {
    const datePart = value.match(/^(\d{4})-(\d{2})-(\d{2})/)

    if (datePart) {
      return `${datePart[3]}/${datePart[2]}/${datePart[1]}`
    }
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatText(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

function getDiasParaValidade(record: AlertaValidadeRecord): number | string | null | undefined {
  return record.dias_para_validade ?? record.dias
}

function getAlertaValidade(record: AlertaValidadeRecord): number | null {
  return record.alerta_validade ?? record.med_alert ?? null
}

function getValidadeTone(record: AlertaValidadeRecord): 'danger' | 'warning' {
  const dias = Number(getDiasParaValidade(record))
  return Number.isFinite(dias) && dias < 0 ? 'danger' : 'warning'
}

function renderValidade(record: AlertaValidadeRecord) {
  return <StatusBadge tone={getValidadeTone(record)}>{formatDateForDisplay(record.est_validade)}</StatusBadge>
}

const alertaValidadeColumns: TableColumn<AlertaValidadeRecord>[] = [
  {
    header: 'Deposito',
    key: 'dep_descr',
    minWidth: 160,
    render: (rowData) => rowData.dep_descr || '-',
  },
  {
    align: 'center',
    header: 'ID',
    key: 'est_med_id',
    width: 86,
    render: (rowData) => formatText(rowData.est_med_id),
  },
  {
    flexGrow: 1.5,
    header: 'Medicamento',
    key: 'med_descr',
    minWidth: 240,
    render: (rowData) => (
      <div className="alerta-validade-page__table-copy">
        <strong>{rowData.med_descr || '-'}</strong>
        <span>Lote {rowData.est_lote || '-'}</span>
      </div>
    ),
  },
  {
    align: 'center',
    header: 'Unidade',
    key: 'med_und',
    width: 96,
    render: (rowData) => rowData.med_und || '-',
  },
  {
    header: 'Validade',
    key: 'est_validade',
    width: 138,
    render: renderValidade,
  },
  {
    align: 'center',
    header: 'Dias',
    key: 'dias',
    width: 110,
    render: (rowData) => formatText(getDiasParaValidade(rowData)),
  },
  {
    align: 'center',
    header: 'Alerta',
    key: 'med_alert',
    width: 112,
    render: (rowData) => formatText(getAlertaValidade(rowData)),
  },
  {
    align: 'right',
    header: 'Saldo disponivel',
    key: 'est_saldo_disponivel',
    width: 148,
    render: (rowData) => formatNumber(rowData.est_saldo_disponivel),
  },
  {
    align: 'right',
    header: 'Saldo bloqueado',
    key: 'est_saldo_bloqueado',
    width: 148,
    render: (rowData) => formatNumber(rowData.est_saldo_bloqueado),
  },
]

export async function listarAlertasValidade(): Promise<AlertaValidadeRecord[]> {
  return apiRequest<AlertaValidadeRecord[]>('/estoque/alerta_validade')
}

interface AlertaValidadeContentProps {
  isCompactLayout: boolean
  records: AlertaValidadeRecord[]
}

function AlertaValidadeContent({ isCompactLayout, records }: AlertaValidadeContentProps) {
  return (
    <div className="boname-page__table-content alerta-validade-page__content">
      {isCompactLayout ? (
        <div className="boname-page__card-list">
          {records.map((record, index) => (
            <Panel bordered key={`${record.dep_descr ?? 'dep'}-${record.est_med_id ?? 'med'}-${record.est_lote ?? 'lote'}-${index}`} className="boname-page__record-card">
              <div className="boname-page__record-card-top">
                <div>
                  <strong>{record.med_descr || 'Medicamento sem descricao'}</strong>
                  <p>Lote {record.est_lote || '-'}</p>
                </div>
                {renderValidade(record)}
              </div>

              <dl className="boname-page__record-meta alerta-validade-page__record-meta">
                <div>
                  <dt>Deposito</dt>
                  <dd>{record.dep_descr || '-'}</dd>
                </div>
                <div>
                  <dt>ID</dt>
                  <dd>{formatText(record.est_med_id)}</dd>
                </div>
                <div>
                  <dt>Unidade</dt>
                  <dd>{record.med_und || '-'}</dd>
                </div>
                <div>
                  <dt>Dias</dt>
                  <dd>{formatText(getDiasParaValidade(record))}</dd>
                </div>
                <div>
                  <dt>Alerta</dt>
                  <dd>{formatText(getAlertaValidade(record))}</dd>
                </div>
                <div>
                  <dt>Saldo disponivel</dt>
                  <dd>{formatNumber(record.est_saldo_disponivel)}</dd>
                </div>
                <div>
                  <dt>Saldo bloqueado</dt>
                  <dd>{formatNumber(record.est_saldo_bloqueado)}</dd>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      ) : (
        <div className="boname-page__table-wrap alerta-validade-page__table-wrap">
          <Table
            columns={alertaValidadeColumns}
            data={records}
            rowKey={(rowData, index) => `${rowData.dep_descr ?? 'dep'}-${rowData.est_med_id ?? 'med'}-${rowData.est_lote ?? 'lote'}-${index}`}
            wordWrap
          />
        </div>
      )}
    </div>
  )
}

export function AlertaValidadePage({ records: initialRecords }: AlertaValidadePageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const listQuery = useQuery({
    queryKey: ['estoque-alerta-validade'],
    queryFn: listarAlertasValidade,
    enabled: initialRecords === undefined,
    initialData: initialRecords,
  })

  const records = listQuery.data ?? []

  return (
    <section className="boname-page estoque-page alerta-validade-page">
      <PageSection className="estoque-page__merged-section alerta-validade-page__section">
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando alertas"
            description="Consultando lotes proximos da validade."
          />
        ) : listQuery.isError ? (
          <DataState
            state="error"
            title="Nao foi possivel carregar"
            description={getErrorMessage(listQuery.error)}
            action={(
              <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            )}
          />
        ) : records.length === 0 ? (
          <DataState
            state="empty"
            title="Nenhum alerta encontrado"
            description="Nao ha lotes com validade dentro do periodo de alerta."
          />
        ) : (
          <AlertaValidadeContent isCompactLayout={isCompactLayout} records={records} />
        )}
      </PageSection>
    </section>
  )
}

export function AlertaValidadeStartupModal() {
  const [dismissed, setDismissed] = useState(false)
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const listQuery = useQuery({
    queryKey: ['estoque-alerta-validade'],
    queryFn: listarAlertasValidade,
  })
  const records = listQuery.data ?? []
  const shouldOpen = !dismissed && records.length > 0

  return (
    <AppModal
      className="alerta-validade-page__startup-modal"
      intent="view"
      intentVisible={false}
      open={shouldOpen}
      overflow
      size="lg"
      title="Alerta de Validade"
      subtitle="Lotes com saldo e validade dentro do prazo de alerta do medicamento."
      onClose={() => setDismissed(true)}
      footer={(
        <Button appearance="primary" onClick={() => setDismissed(true)}>
          Fechar
        </Button>
      )}
    >
      <AlertaValidadeContent isCompactLayout={isCompactLayout} records={records} />
    </AppModal>
  )
}

export default AlertaValidadePage
