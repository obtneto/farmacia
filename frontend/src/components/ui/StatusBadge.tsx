import type { ReactNode } from 'react'
import { Tag } from 'rsuite'

export interface StatusBadgeProps {
  children: ReactNode
  tone?: 'danger' | 'info' | 'neutral' | 'success' | 'warning'
}

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return <Tag className={`status-badge status-badge--${tone}`}>{children}</Tag>
}

export default StatusBadge
