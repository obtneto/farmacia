import { Button, HStack } from 'rsuite'
import { RiAlarmWarningLine, RiLayoutGridLine, RiMedicineBottleLine, RiShieldCheckLine } from 'react-icons/ri'
import type { SectionKey } from '../config/navigation'
import { PageSection, StatusBadge, SummaryCard } from '../components/ui'

export interface HomeDashboardPageProps {
  onOpenSection: (sectionKey: SectionKey) => void
}

export function HomeDashboardPage({ onOpenSection }: HomeDashboardPageProps) {
  return (
    <section className="dashboard-page">
      <div className="summary-grid">
        <SummaryCard
          label="Workspace"
          value="Layout pronto"
          hint="Shell corporativo com sidebar, topbar e padroes visuais reaproveitaveis."
          icon={<RiLayoutGridLine size={18} />}
        />
        <SummaryCard
          accent="teal"
          label="Cadastros"
          value="Boname online"
          hint="Fluxo principal migrado para o novo padrao de listagem, filtros e modais."
          icon={<RiMedicineBottleLine size={18} />}
        />
        <SummaryCard
          accent="amber"
          label="Aprovacoes"
          value="3 alertas"
          hint="Espaco reservado para a fila operacional de aprovacao e acompanhamento."
          icon={<RiAlarmWarningLine size={18} />}
        />
        <SummaryCard
          accent="slate"
          label="Governanca"
          value="Design system"
          hint="Tokens, badges, estados e modais organizados para crescer com o projeto."
          icon={<RiShieldCheckLine size={18} />}
        />
      </div>

      <div className="dashboard-page__grid">
        <PageSection
          title="Fila operacional"
          description="Resumo de areas prioritarias para a evolucao do frontend e das proximas telas."
          actions={
            <HStack spacing={10} wrap>
              <Button appearance="primary" onClick={() => onOpenSection('parametros/boname')}>
                Abrir Boname
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('parametros/depositos')}>
                Abrir Depositos
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('operacao/entradas/nova')}>
                Abrir Entradas
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('parametros/locais')}>
                Abrir Locais Requisicao
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('parametros/medicamentos')}>
                Abrir Medicamentos
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('parametros/tipos_medicamentos')}>
                Abrir tipos de medicamentos
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('parametros/diagnosticos')}>
                Abrir Diagnosticos
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('requisicoes/por_paciente')}>
                Requisicoes por paciente
              </Button>
              <Button appearance="subtle" onClick={() => onOpenSection('requisicoes/por_setor')}>
                Requisicoes por setor
              </Button>
            </HStack>
          }
        >
          <div className="dashboard-page__queue">
            <article className="dashboard-page__queue-card">
              <StatusBadge tone="info">Estrutura validada</StatusBadge>
              <strong>Padrao de pagina corporativa</strong>
              <p>Titulo, subtitulo, filtros, cards, tabela, acoes por linha e estados padronizados.</p>
            </article>
            <article className="dashboard-page__queue-card">
              <StatusBadge tone="warning">Proximo passo</StatusBadge>
              <strong>Levar o shell para os demais modulos</strong>
              <p>Pacientes, estoque e requisicoes podem herdar a mesma base visual sem retrabalho.</p>
            </article>
            <article className="dashboard-page__queue-card">
              <StatusBadge tone="success">Pronto para escalar</StatusBadge>
              <strong>Componentes reutilizaveis</strong>
              <p>Modais, badges, cards e secoes foram isolados para manutencao simples.</p>
            </article>
          </div>
        </PageSection>

        <PageSection
          title="Guia rapido de interface"
          description="Referencias de composicao ja aplicadas no shell para manter consistencia nas proximas entregas."
        >
          <div className="dashboard-page__guide">
            <div>
              <span>Sidebar</span>
              <p>Hierarquia clara com grupos, colapso controlado e leitura imediata do modulo ativo.</p>
            </div>
            <div>
              <span>Topbar</span>
              <p>Busca global, notificacoes, acoes rapidas e contexto do usuario sem competir com o conteudo.</p>
            </div>
            <div>
              <span>Conteudo</span>
              <p>Seccoes em cards, espacamento consistente e densidade pensada para ERP/SaaS corporativo.</p>
            </div>
            <div>
              <span>Feedback</span>
              <p>Estados de loading, vazio, erro, toasts e modais alinhados com a linguagem do sistema.</p>
            </div>
          </div>
        </PageSection>
      </div>
    </section>
  )
}

export default HomeDashboardPage
