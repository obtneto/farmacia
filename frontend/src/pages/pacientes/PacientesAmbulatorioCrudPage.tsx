import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { useMask } from '../../hooks/useMask'
import { apiRequest } from '../../lib/api'
import '../boname/BonameCrudPage.css'

interface PacienteListRecord {
  cpf: string | null
  dt_nascimento: string | null
  email: string | null
  nom_paciente: string | null
  nom_social: string | null
  num_paciente: number
}

interface PacienteDetalheRecord extends PacienteListRecord {
  bairro: string | null
  cidade: string | null
  endereco: string | null
  nom_mae: string | null
  nom_pai: string | null
  telefone: string | null
  uf: string | null
}

const PAGE_SIZE = 11

function normalizeRows<T>(payload: unknown): T[] {
  if (!Array.isArray(payload)) {
    return []
  }

  if (payload.length > 0 && Array.isArray(payload[0])) {
    return payload[0] as T[]
  }

  return payload as T[]
}

function normalizeSingle<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as T
  }

  const rows = normalizeRows<T>(payload)
  return rows[0] ?? null
}

function formatDateForDisplay(value: string | null): string {
  if (!value) {
    return '-'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

function formatText(value: string | null | undefined): string {
  const normalizedValue = String(value || '').trim()
  return normalizedValue || '-'
}

async function listarPacientes(pesquisa: string): Promise<PacienteListRecord[]> {
  const response = await apiRequest<unknown>(`/pacientes/listar_pacientes/${encodeURIComponent(pesquisa || '*')}`)
  return normalizeRows<PacienteListRecord>(response)
}

async function visualizarPaciente(numPaciente: number): Promise<PacienteDetalheRecord | null> {
  const response = await apiRequest<unknown>(`/pacientes/visualizar_paciente/${numPaciente}`)
  return normalizeSingle<PacienteDetalheRecord>(response)
}

export interface PacientesAmbulatorioCrudPageProps {
  _unused?: never
}

export default function PacientesAmbulatorioCrudPage() {
  const mask = useMask()
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState<string | null>(null)
  const [activePage, setActivePage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState<PacienteListRecord | null>(null)

  const pacientesQuery = useQuery({
    enabled: submittedSearch !== null,
    queryFn: () => listarPacientes(submittedSearch ?? '*'),
    queryKey: ['pacientes-ambulatorio', submittedSearch],
    retry: false,
  })

  const pacienteDetalheQuery = useQuery({
    enabled: selectedPatient !== null,
    queryFn: () => visualizarPaciente(selectedPatient!.num_paciente),
    queryKey: ['paciente-ambulatorio-detalhe', selectedPatient?.num_paciente ?? null],
    retry: false,
  })

  const pacientes = pacientesQuery.data ?? []
  const totalPages = Math.max(1, Math.ceil(pacientes.length / PAGE_SIZE))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedPatients = pacientes.slice(pageStart, pageStart + PAGE_SIZE)
  const tableHeight = Math.min(Math.max(paginatedPatients.length * 54 + 104, 260), 560)

  const handleSearch = () => {
    setSubmittedSearch(searchValue.trim() || '*')
    setActivePage(1)
  }

  const handleRefresh = () => {
    if (submittedSearch === null) {
      handleSearch()
      return
    }

    void pacientesQuery.refetch()
  }

  const closeDetailsModal = () => {
    setSelectedPatient(null)
  }

  return (
    <section className="boname-page pacientes-page estoque-page--merged-layout">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <HStack spacing={12} wrap alignItems="flex-start" className="boname-page__toolbar">
          <Input
            aria-label="Buscar paciente por nome ou nome usual"
            value={searchValue}
            onChange={setSearchValue}
            onPressEnter={handleSearch}
            placeholder="Nome do paciente ou nome usual"
            className="boname-page__search-input"
          />

          <HStack spacing={8} wrap className="boname-page__toolbar-actions">
            <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleSearch}>
              Buscar
            </Button>
            <Button
              appearance="ghost"
              startIcon={<ReloadIcon />}
              loading={pacientesQuery.isFetching && !pacientesQuery.isPending}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
            <StatusBadge tone={submittedSearch === null ? 'neutral' : 'info'}>
              {submittedSearch === null ? 'Aguardando pesquisa' : `${pacientes.length} registro(s)`}
            </StatusBadge>
          </HStack>
        </HStack>

        {submittedSearch === null ? (
          <DataState
            state="empty"
            title="Informe um filtro para iniciar"
            description="Use o campo de pesquisa e clique em Buscar para carregar os pacientes."
          />
        ) : pacientesQuery.isLoading ? (
          <DataState
            state="loading"
            title="Carregando pacientes"
            description="Consultando os pacientes do ambulatorio."
          />
        ) : pacientesQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar pacientes"
            description={pacientesQuery.error instanceof Error ? pacientesQuery.error.message : 'Nao foi possivel consultar os pacientes.'}
            action={
              <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void pacientesQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : pacientes.length === 0 ? (
          <DataState
            state="empty"
            title="Nenhum paciente encontrado"
            description="Ajuste o termo pesquisado e tente novamente."
          />
        ) : (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedPatients.map((rowData) => (
                    <Panel bordered key={rowData.num_paciente} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{formatText(rowData.nom_paciente)}</strong>
                          <p>Nome usual: {formatText(rowData.nom_social)}</p>
                        </div>
                        <StatusBadge tone="info">Paciente</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Codigo</dt>
                          <dd>{rowData.num_paciente}</dd>
                        </div>
                        <div>
                          <dt>Nascimento</dt>
                          <dd>{formatDateForDisplay(rowData.dt_nascimento)}</dd>
                        </div>
                        <div>
                          <dt>CPF</dt>
                          <dd>{mask.cpf(rowData.cpf)}</dd>
                        </div>
                        <div>
                          <dt>E-mail</dt>
                          <dd>{formatText(rowData.email)}</dd>
                        </div>
                      </dl>

                      <HStack spacing={8} className="boname-page__row-actions boname-page__row-actions--compact">
                        <Button
                          appearance="subtle"
                          size="xs"
                          startIcon={<VisibleIcon />}
                          onClick={() => setSelectedPatient(rowData)}
                        >
                          Visualizar
                        </Button>
                      </HStack>
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table
                    data={paginatedPatients}
                    height={tableHeight}
                    fillHeight
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={96} align="center" fixed>
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="num_paciente" />
                    </Column>

                    <Column flexGrow={1.7} minWidth={260}>
                      <HeaderCell>Nome do Paciente</HeaderCell>
                      <Cell dataKey="nom_paciente" />
                    </Column>

                    <Column flexGrow={1.4} minWidth={220}>
                      <HeaderCell>Nome Usual</HeaderCell>
                      <Cell>{(rowData: PacienteListRecord) => formatText(rowData.nom_social)}</Cell>
                    </Column>

                    <Column width={150}>
                      <HeaderCell>Nascimento</HeaderCell>
                      <Cell>{(rowData: PacienteListRecord) => formatDateForDisplay(rowData.dt_nascimento)}</Cell>
                    </Column>

                    <Column width={160}>
                      <HeaderCell>CPF</HeaderCell>
                      <Cell>{(rowData: PacienteListRecord) => mask.cpf(rowData.cpf)}</Cell>
                    </Column>

                    <Column flexGrow={1.2} minWidth={240}>
                      <HeaderCell>E-mail</HeaderCell>
                      <Cell>{(rowData: PacienteListRecord) => formatText(rowData.email)}</Cell>
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Acoes</HeaderCell>
                      <Cell>
                        {(rowData: PacienteListRecord) => (
                          <HStack
                            spacing={8}
                            justifyContent="center"
                            className="boname-page__row-actions boname-page__row-actions--table"
                          >
                            <IconButton
                              appearance="subtle"
                              size="xs"
                              circle
                              aria-label="Visualizar paciente"
                              className="boname-page__action-icon boname-page__action-icon--view"
                              icon={<VisibleIcon />}
                              onClick={() => setSelectedPatient(rowData)}
                            />
                          </HStack>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo {pageStart + 1} a {Math.min(pageStart + paginatedPatients.length, pacientes.length)} de {pacientes.length} paciente(s).
              </p>

              {pacientes.length > PAGE_SIZE ? (
                <Pagination
                  boundaryLinks
                  ellipsis
                  prev
                  next
                  first
                  last
                  layout={['pager']}
                  maxButtons={5}
                  size={isCompactLayout ? 'sm' : 'md'}
                  total={pacientes.length}
                  limit={PAGE_SIZE}
                  activePage={currentPage}
                  onChangePage={setActivePage}
                />
              ) : null}
            </div>
          </>
        )}
      </PageSection>

      <AppModal
        open={selectedPatient !== null}
        onClose={closeDetailsModal}
        title="Visualizar paciente"
        subtitle="Consulta em modo leitura do cadastro selecionado."
        intentVisible={false}
        size={isCompactLayout ? 'full' : 'lg'}
        intent="view"
        className="boname-page__record-modal"
        footer={
          <Button appearance="primary" onClick={closeDetailsModal}>
            Fechar
          </Button>
        }
      >
        {pacienteDetalheQuery.isLoading ? (
          <DataState
            state="loading"
            title="Carregando paciente"
            description="Buscando os dados detalhados do paciente selecionado."
          />
        ) : pacienteDetalheQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar paciente"
            description={pacienteDetalheQuery.error instanceof Error ? pacienteDetalheQuery.error.message : 'Nao foi possivel carregar os dados do paciente.'}
            action={
              <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void pacienteDetalheQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : pacienteDetalheQuery.data ? (
          <div className="boname-page__modal-shell">
            <section className="boname-page__form-panel" aria-label="Formulario de paciente">
              <div className="boname-page__form-grid">
                <div className="boname-page__field">
                  <label htmlFor="paciente-id">ID</label>
                  <InputNumber
                    id="paciente-id"
                    min={0}
                    size="sm"
                    controls={false}
                    className="boname-page__control"
                    value={pacienteDetalheQuery.data.num_paciente}
                    disabled
                  />
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label htmlFor="paciente-nome">Nome do paciente</label>
                  <Input
                    id="paciente-nome"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.nom_paciente)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-nome-usual">Nome usual</label>
                  <Input
                    id="paciente-nome-usual"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.nom_social)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-nascimento">Nascimento</label>
                  <Input
                    id="paciente-nascimento"
                    size="sm"
                    className="boname-page__control"
                    value={formatDateForDisplay(pacienteDetalheQuery.data.dt_nascimento)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-cpf">CPF</label>
                  <Input
                    id="paciente-cpf"
                    size="sm"
                    className="boname-page__control"
                    value={mask.cpf(pacienteDetalheQuery.data.cpf)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-email">E-mail</label>
                  <Input
                    id="paciente-email"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.email)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-telefone">Telefone</label>
                  <Input
                    id="paciente-telefone"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.telefone)}
                    disabled
                  />
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label htmlFor="paciente-mae">Nome da mae</label>
                  <Input
                    id="paciente-mae"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.nom_mae)}
                    disabled
                  />
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label htmlFor="paciente-pai">Nome do pai</label>
                  <Input
                    id="paciente-pai"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.nom_pai)}
                    disabled
                  />
                </div>

                <div className="boname-page__field boname-page__field--full">
                  <label htmlFor="paciente-endereco">Endereco</label>
                  <Input
                    id="paciente-endereco"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.endereco)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-bairro">Bairro</label>
                  <Input
                    id="paciente-bairro"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.bairro)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-cidade">Cidade</label>
                  <Input
                    id="paciente-cidade"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.cidade)}
                    disabled
                  />
                </div>

                <div className="boname-page__field">
                  <label htmlFor="paciente-uf">UF</label>
                  <Input
                    id="paciente-uf"
                    size="sm"
                    className="boname-page__control"
                    value={formatText(pacienteDetalheQuery.data.uf)}
                    disabled
                  />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <DataState
            state="empty"
            title="Paciente sem detalhes"
            description="Nenhum dado detalhado foi retornado para o paciente selecionado."
          />
        )}
      </AppModal>
    </section>
  )
}
