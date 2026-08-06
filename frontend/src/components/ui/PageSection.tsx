import type { ReactNode } from 'react'
import { HStack, Panel, VStack } from 'rsuite'

export interface PageSectionProps {
  actions?: ReactNode
  children: ReactNode
  className?: string
  description?: string
  title?: string
}

export function PageSection({
  actions,
  children,
  className = '',
  description,
  title,
}: PageSectionProps) {
  return (
    <Panel bordered className={`page-section ${className}`.trim()}>
      {title || description || actions ? (
        <HStack justifyContent="space-between" alignItems="flex-start" className="page-section__header" wrap>
          {title || description ? (
            <VStack spacing={4} alignItems="flex-start" className="page-section__copy">
              {title ? <h3>{title}</h3> : null}
              {description ? <p>{description}</p> : null}
            </VStack>
          ) : null}
          {actions ? <div className="page-section__actions">{actions}</div> : null}
        </HStack>
      ) : null}
      <div className="page-section__body">{children}</div>
    </Panel>
  )
}

export default PageSection
