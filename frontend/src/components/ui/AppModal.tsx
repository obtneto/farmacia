import { useEffect, useState, type ReactNode } from 'react'
import { Modal } from 'rsuite'
import PageLoader from './PageLoader'

export type AppModalIntent = 'confirm' | 'create' | 'delete' | 'edit' | 'map' | 'payment' | 'view'

export interface AppModalProps {
  backdrop?: boolean | 'static'
  centered?: boolean
  children: ReactNode
  className?: string
  footer?: ReactNode
  intent?: AppModalIntent
  intentVisible?: boolean
  loading?: boolean
  onClose: () => void
  open: boolean
  overflow?: boolean
  size?: 'full' | 'lg' | 'md' | 'sm' | 'xs'
  subtitle?: string
  title: string
}

const INTENT_LABELS: Record<AppModalIntent, string> = {
  confirm: 'Confirmacao',
  create: 'Cadastro',
  delete: 'Exclusao',
  edit: 'Edicao',
  map: 'Mapa / rota',
  payment: 'Pagamento',
  view: 'Visualizacao',
}

export function AppModal({
  backdrop = true,
  centered = true,
  children,
  className,
  footer,
  intent = 'view',
  intentVisible = true,
  loading = false,
  onClose,
  open,
  overflow,
  size = 'md',
  subtitle,
  title,
}: AppModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const modalClassName = ['app-modal', `app-modal--${intent}`, className].filter(Boolean).join(' ')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mainContentShell = document.querySelector<HTMLElement>('.main-layout__content-shell')
    setModalContainer(mainContentShell)
  }, [])

  return (
    <Modal
      backdrop={backdrop}
      centered={centered}
      container={modalContainer ?? undefined}
      open={open}
      overflow={overflow}
      size={size}
      onClose={onClose}
      className={modalClassName}
    >
      <Modal.Header>
        <div className="app-modal__header">
          <div className="app-modal__copy">
            <Modal.Title>{title}</Modal.Title>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {intentVisible ? <span className="app-modal__intent">{INTENT_LABELS[intent]}</span> : null}
        </div>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="app-modal__loading">
            <PageLoader
              title="Carregando dados"
              description="Buscando informacoes necessarias para continuar."
              variant="modal"
            />
          </div>
        ) : (
          <div className="app-modal__body-content">{children}</div>
        )}
      </Modal.Body>

      {footer ? <Modal.Footer className="app-modal__footer">{footer}</Modal.Footer> : null}
    </Modal>
  )
}

export default AppModal
