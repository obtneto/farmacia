import type { ReactNode } from 'react'

export interface SummaryCardProps {
  accent?: 'amber' | 'primary' | 'slate' | 'teal'
  hint: string
  icon?: ReactNode
  label: string
  value: ReactNode
}

export function SummaryCard({
  accent = 'primary',
  hint,
  icon,
  label,
  value,
}: SummaryCardProps) {
  return (
    <article className={`summary-card summary-card--${accent}`}>
      <div className="summary-card__header">
        <span>{label}</span>
        {icon ? <div className="summary-card__icon">{icon}</div> : null}
      </div>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  )
}

export default SummaryCard
