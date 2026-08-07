import { useEffect, useState } from 'react'
import MainLayout from './components/MainLayout'
import PageLoader from './components/ui/PageLoader'
import { APP_SECTIONS, QUICK_ACTIONS, type SectionKey } from './config/navigation'
import './App.css'
import AprovacaoEntradaPage from './pages/AprovacaoEntradaPage'
import BonamePage from './pages/BonamePage'
import ConsultarMovimentacoesPage from './pages/ConsultarMovimentacoesPage'
import DemandasEspecificasPage from './pages/DemandasEspecificasPage'
import DepositosPage from './pages/DepositosPage'
import DiagnosticosPage from './pages/DiagnosticosPage'
import EntradaMercadoriaDemandasPage from './pages/EntradaMercadoriaDemandasPage'
import EntradaMedicamentosPage from './pages/EntradaMedicamentosPage'
import EstoquePage from './pages/EstoquePage'
import FornecedoresPage from './pages/FornecedoresPage'
import HomeDashboardPage from './pages/HomeDashboardPage'
import ListarEntradasPage from './pages/ListarEntradasPage'
import LocaisRequisicaoPage from './pages/LocaisRequisicaoPage'
import MedicamentosPage from './pages/MedicamentosPage'
import ModulePlaceholderPage from './pages/ModulePlaceholderPage'
import NovaSolicitacaoTransferenciaPage from './pages/NovaSolicitacaoTransferenciaPage'
import PacientesAmbulatorioPage from './pages/PacientesAmbulatorioPage'
import AprovacaoRequisicaoPage from './pages/requisicoes/aprovacao'
import ControleDoseDomiciliarPage from './pages/requisicoes/controle-dose-domiciliar'
import DevolucaoMedicamentoPage from './pages/requisicoes/devolucao-medicamento'
import RequisicaoPorPacientePage from './pages/requisicoes/por-paciente'
import RequisicaoPorSetorPage from './pages/requisicoes/por-setor'
import SolicitacoesAbertasPage from './pages/SolicitacoesAbertasPage'
import SolicitacoesEncerradasPage from './pages/SolicitacoesEncerradasPage'
import SetoresPage from './pages/SetoresPage'
import TiposMedicamentosPage from './pages/TiposMedicamentosPage'
import TiposRequisicoesPage from './pages/TiposRequisicoesPage'
import { bootstrapAuthSession } from './lib/auth-session'

const DEFAULT_SECTION_KEY: SectionKey = 'inicio'

function App() {
  const [activeSectionKey, setActiveSectionKey] = useState<SectionKey>(DEFAULT_SECTION_KEY)
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
    || activeSectionKey === 'estoque/listar'
    || activeSectionKey === 'estoque/transferencia_depositos/nova_solicitacao'
    || activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_abertas'
    || activeSectionKey === 'estoque/transferencia_depositos/solicitacoes_encerradas'
    || activeSectionKey === 'estoque/consultar_movimentacoes'
    || activeSectionKey === 'pacientes/ambulatorio'
    || activeSectionKey === 'pacientes/demandas_especificas'
    || activeSectionKey === 'requisicoes/aprovacao'
    || activeSectionKey === 'requisicoes/controle_dose_domiciliar'
    || activeSectionKey === 'requisicoes/devolucao_medicamento'
    || activeSectionKey === 'requisicoes/por_paciente'
    || activeSectionKey === 'requisicoes/por_setor'
    || activeSectionKey === 'parametros/locais'
    || activeSectionKey === 'parametros/medicamentos'
    || activeSectionKey === 'parametros/tipos_medicamentos'
    || activeSectionKey === 'parametros/setores'
    || activeSectionKey === 'parametros/tipos_requisicoes'
    || activeSectionKey === 'parametros/diagnosticos'

  useEffect(() => {
    let mounted = true

    void bootstrapAuthSession()
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setAuthReady(true)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  if (!authReady) {
    return (
      <PageLoader
        description="Sincronizando a sessao autenticada simulada."
        title="Autenticando"
        variant="page"
      />
    )
  }

  return (
    <MainLayout
      activeSidebarKey={activeSectionKey}
      breadcrumbItems={section.breadcrumbItems}
      onQuickActionSelect={setActiveSectionKey}
      onSidebarSelect={setActiveSectionKey}
      pageBannerCompact={isCadastroSection}
      pageDescription={section.description}
      pageMetaVisible={!isCadastroSection}
      pageStatus={section.status}
      pageTitle={section.title}
      quickActions={QUICK_ACTIONS}
    >
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
      ) : activeSectionKey === 'parametros/diagnosticos' ? (
        <DiagnosticosPage />
      ) : (
        <ModulePlaceholderPage
          moduleKey={activeSectionKey}
          moduleLabel={section.title}
          onOpenDashboard={() => setActiveSectionKey('inicio')}
        />
      )}
    </MainLayout>
  )
}

export default App
