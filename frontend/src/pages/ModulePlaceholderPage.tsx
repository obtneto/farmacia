import { Button } from 'rsuite'
import type { SectionKey } from '../config/navigation'
import { DataState, PageSection, SummaryCard } from '../components/ui'

export interface ModulePlaceholderPageProps {
  moduleKey: SectionKey
  moduleLabel: string
  onOpenDashboard: () => void
}

export function ModulePlaceholderPage({
  moduleKey,
  moduleLabel,
  onOpenDashboard,
}: ModulePlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <div className="summary-grid">
        <SummaryCard
          label="Modulo"
          value={moduleLabel}
          hint="Area reservada para a proxima implementacao do fluxo operacional."
        />
        <SummaryCard
          accent="slate"
          label="Chave"
          value={moduleKey}
          hint="Identificador ja integrado ao menu principal e pronto para roteamento futuro."
        />
      </div>

      <PageSection
        title="Em construcao"
        description="O shell visual ja esta aplicado e a area abaixo indica o padrao de vazio para novas paginas."
      >
        <DataState
          state="empty"
          title={`${moduleLabel} ainda nao possui tela dedicada`}
          description="A estrutura de layout, cards, filtros e estados ja esta pronta para receber a implementacao deste modulo."
          action={
            <Button appearance="primary" onClick={onOpenDashboard}>
              Voltar ao dashboard
            </Button>
          }
        />
      </PageSection>
    </section>
  )
}

export default ModulePlaceholderPage
