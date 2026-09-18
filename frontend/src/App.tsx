import { lazy, Suspense, useEffect, useState } from 'react'
import MainLayout from './components/MainLayout'
import PageLoader from './components/ui/PageLoader'
import { APP_SECTIONS, type SectionKey } from './config/navigation'
import './App.css'
import { isSectionAllowed } from './lib/auth-permissions'
import { bootstrapAuthSession } from './lib/auth-session'

const DEFAULT_SECTION_KEY: SectionKey = 'inicio'
const AprovacaoEntradaPage = lazy(() => import('./pages/AprovacaoEntradaPage'))
const AlertaValidadePage = lazy(() => import('./pages/estoque').then((module) => ({ default: module.AlertaValidadePage })))
const AlertaValidadeStartupNotifier = lazy(() => import('./pages/estoque').then((module) => ({ default: module.AlertaValidadeStartupNotifier })))
const BonamePage = lazy(() => import('./pages/BonamePage'))
const ConsultarMovimentacoesPage = lazy(() => import('./pages/ConsultarMovimentacoesPage'))
const DemandasEspecificasPage = lazy(() => import('./pages/DemandasEspecificasPage'))
const DepositosPage = lazy(() => import('./pages/DepositosPage'))
const DiagnosticosPage = lazy(() => import('./pages/DiagnosticosPage'))
const EntradaMercadoriaDemandasPage = lazy(() => import('./pages/EntradaMercadoriaDemandasPage'))
const EntradaMedicamentosPage = lazy(() => import('./pages/EntradaMedicamentosPage'))
const EstoquePage = lazy(() => import('./pages/EstoquePage'))
const FornecedoresPage = lazy(() => import('./pages/FornecedoresPage'))
const HomeDashboardPage = lazy(() => import('./pages/HomeDashboardPage'))
const ListarEntradasPage = lazy(() => import('./pages/ListarEntradasPage'))
const LocaisRequisicaoPage = lazy(() => import('./pages/LocaisRequisicaoPage'))
const MedicamentosPage = lazy(() => import('./pages/MedicamentosPage'))
const ModulePlaceholderPage = lazy(() => import('./pages/ModulePlaceholderPage'))
const NovaSolicitacaoTransferenciaPage = lazy(() => import('./pages/NovaSolicitacaoTransferenciaPage'))
const NovoInventarioPage = lazy(() => import('./pages/inventarios'))
const ListarInventariosPage = lazy(() =>
  import('./pages/inventarios').then((module) => ({ default: module.ListarInventariosPage })),
)
const PacientesAmbulatorioPage = lazy(() => import('./pages/PacientesAmbulatorioPage'))
const AprovacaoRequisicaoPage = lazy(() => import('./pages/requisicoes/aprovacao'))
const ControleDoseDomiciliarPage = lazy(() => import('./pages/requisicoes/controle-dose-domiciliar'))
const DevolucaoMedicamentoPage = lazy(() => import('./pages/requisicoes/devolucao-medicamento'))
const ListarRequisicoesPorPeriodoPage = lazy(() => import('./pages/requisicoes/listar-por-periodo'))
const RastreamentoLotesPage = lazy(() => import('./pages/requisicoes/rastreamento-lotes'))
const RequisicaoPorPacientePage = lazy(() => import('./pages/requisicoes/por-paciente'))
const RequisicaoPorSetorPage = lazy(() => import('./pages/requisicoes/por-setor'))
const SolicitacoesAbertasPage = lazy(() => import('./pages/SolicitacoesAbertasPage'))
const SolicitacoesEncerradasPage = lazy(() => import('./pages/SolicitacoesEncerradasPage'))
const SetoresPage = lazy(() => import('./pages/SetoresPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TiposMedicamentosPage = lazy(() => import('./pages/TiposMedicamentosPage'))
const TiposRequisicoesPage = lazy(() => import('./pages/TiposRequisicoesPage'))

function App() {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>(() => {
    const searchParam = new URLSearchParams(window.location.search).get('section') as SectionKey
    return searchParam && APP_SECTIONS[searchParam] ? searchParam : DEFAULT_SECTION_KEY
  })
  const [authReady, setAuthReady] = useState(false)

  const section = APP_SECTIONS[activeSectionKey]
  const isCadastroSection =
    activeSectionKey === 'parametros/boname'
    || activeSectionKey === 'parametros/depositos'
    || activeSectionKey === 'parametros/fornecedores'
    || activeSectionKey === 'operacao/entradas/nova'
    || activeSectionKey === 'operacao/entradas/listar'
    || activeSectionKey === 'operacao/entradas/demandas'
    || activeSectionKey === 'operacao/entradas/aprovacao'
    || activeSectionKey === 'operacao/inventarios/listar'
    || activeSectionKey === 'operacao/inventarios/novo'
    || activeSectionKey === 'estoque/listar'
    || activeSectionKey === 'estoque/transferencia_depositos/nova_solicitacao'
    || activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_abertas'
    || activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_encerradas'
    || activeSectionKey === 'estoque/consultar_movimentacoes'
    || activeSectionKey === 'estoque/alerta_validade'
    || activeSectionKey === 'pacientes/ambulatorio'
    || activeSectionKey === 'pacientes/demandas_especificas'
    || activeSectionKey === 'requisicoes/aprovacao'
    || activeSectionKey === 'requisicoes/controle_dose_domiciliar'
    || activeSectionKey === 'requisicoes/devolucao_medicamento'
    || activeSectionKey === 'requisicoes/listar_por_periodo'
    || activeSectionKey === 'requisicoes/por_paciente'
    || activeSectionKey === 'requisicoes/por_setor'
    || activeSectionKey === 'requisicoes/rastreamento_lotes'
    || activeSectionKey === 'parametros/locais'
    || activeSectionKey === 'parametros/medicamentos'
    || activeSectionKey === 'parametros/tipos_medicamentos'
    || activeSectionKey === 'parametros/setores'
    || activeSectionKey === 'parametros/tipos_requisicoes'
    || activeSectionKey === 'parametros/settings'
    || activeSectionKey === 'parametros/diagnosticos'

  useEffect(() => {
    let mounted = true

    void bootstrapAuthSession()
      .then(() => {
        if (!mounted) {
          return
        }

        setActiveSectionKey((current) => (isSectionAllowed(current) ? current : DEFAULT_SECTION_KEY))
        setAuthReady(true)
      })
      .catch(() => {
        // redirect para o SA e tratado em bootstrapAuthSession / forceLoginRedirect
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleSidebarSelect = (eventKey: SectionKey) => {
    if (!isSectionAllowed(eventKey)) {
      setActiveSectionKey(DEFAULT_SECTION_KEY)
      return
    }

    setActiveSectionKey(eventKey)
  }

  if (!authReady) {
    return (
      <PageLoader
        description="Sincronizando a sessao autenticada do barramento."
        title="Autenticando"
        variant="page"
      />
    )
  }

  return (
      <MainLayout
        activeSidebarKey={activeSectionKey}
        breadcrumbItems={section.breadcrumbItems}
        onSidebarSelect={handleSidebarSelect}
        pageBannerCompact={isCadastroSection}
        pageDescription={section.description}
        pageMetaVisible={!isCadastroSection && activeSectionKey !== 'inicio'}
        pageStatus={section.status}
        pageTitle={section.title}
      >
      <Suspense fallback={<PageLoader title="Carregando" variant="page" />}>
        <>
          {activeSectionKey === 'inicio' ? (
            <HomeDashboardPage onOpenSection={setActiveSectionKey} />
          ) : activeSectionKey === 'parametros/boname' ? (
            <BonamePage />
          ) : activeSectionKey === 'parametros/depositos' ? (
            <DepositosPage />
          ) : activeSectionKey === 'parametros/fornecedores' ? (
            <FornecedoresPage />
          ) : activeSectionKey === 'operacao/entradas/nova' ? (
            <EntradaMedicamentosPage />
          ) : activeSectionKey === 'operacao/entradas/listar' ? (
            <ListarEntradasPage />
          ) : activeSectionKey === 'operacao/entradas/demandas' ? (
            <EntradaMercadoriaDemandasPage />
          ) : activeSectionKey === 'operacao/entradas/aprovacao' ? (
            <AprovacaoEntradaPage />
          ) : activeSectionKey === 'operacao/inventarios/listar' ? (
            <ListarInventariosPage />
          ) : activeSectionKey === 'operacao/inventarios/novo' ? (
            <NovoInventarioPage />
          ) : activeSectionKey === 'estoque/listar' ? (
            <EstoquePage />
          ) : activeSectionKey === 'estoque/transferencia_depositos/nova_solicitacao' ? (
            <NovaSolicitacaoTransferenciaPage />
          ) : activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_abertas' ? (
            <SolicitacoesAbertasPage />
          ) : activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_encerradas' ? (
            <SolicitacoesEncerradasPage />
          ) : activeSectionKey === 'estoque/consultar_movimentacoes' ? (
            <ConsultarMovimentacoesPage />
          ) : activeSectionKey === 'estoque/alerta_validade' ? (
            <AlertaValidadePage />
          ) : activeSectionKey === 'pacientes/ambulatorio' ? (
            <PacientesAmbulatorioPage />
          ) : activeSectionKey === 'pacientes/demandas_especificas' ? (
            <DemandasEspecificasPage />
          ) : activeSectionKey === 'requisicoes/aprovacao' ? (
            <AprovacaoRequisicaoPage />
          ) : activeSectionKey === 'requisicoes/devolucao_medicamento' ? (
            <DevolucaoMedicamentoPage />
          ) : activeSectionKey === 'requisicoes/controle_dose_domiciliar' ? (
            <ControleDoseDomiciliarPage />
          ) : activeSectionKey === 'requisicoes/listar_por_periodo' ? (
            <ListarRequisicoesPorPeriodoPage />
          ) : activeSectionKey === 'requisicoes/rastreamento_lotes' ? (
            <RastreamentoLotesPage />
          ) : activeSectionKey === 'requisicoes/por_paciente' ? (
            <RequisicaoPorPacientePage />
          ) : activeSectionKey === 'requisicoes/por_setor' ? (
            <RequisicaoPorSetorPage />
          ) : activeSectionKey === 'parametros/locais' ? (
            <LocaisRequisicaoPage />
          ) : activeSectionKey === 'parametros/medicamentos' ? (
            <MedicamentosPage />
          ) : activeSectionKey === 'parametros/tipos_medicamentos' ? (
            <TiposMedicamentosPage />
          ) : activeSectionKey === 'parametros/setores' ? (
            <SetoresPage />
          ) : activeSectionKey === 'parametros/tipos_requisicoes' ? (
            <TiposRequisicoesPage />
          ) : activeSectionKey === 'parametros/settings' ? (
            <SettingsPage />
          ) : activeSectionKey === 'parametros/diagnosticos' ? (
            <DiagnosticosPage />
          ) : (
            <ModulePlaceholderPage
              moduleKey={activeSectionKey}
              moduleLabel={section.title}
              onOpenDashboard={() => setActiveSectionKey('inicio')}
            />
          )}
          <AlertaValidadeStartupNotifier />
        </>
      </Suspense>
    </MainLayout>
  )
}

export default App
