const LOADER_BARS = ['92%', '74%', '58%']

export interface PageLoaderProps {
  className?: string
  description?: string
  title?: string
  variant?: 'modal' | 'page' | 'section'
}

export function PageLoader({
  className,
  description = 'Preparando a interface para voce.',
  title = 'Carregando',
  variant = 'section',
}: PageLoaderProps) {
  const loaderClassName = ['page-loader', `page-loader--${variant}`, className].filter(Boolean).join(' ')

  return (
    <div className={loaderClassName} role="status" aria-live="polite">
      <div className="page-loader__panel">
        <div className="page-loader__signal" aria-hidden="true">
          <span className="page-loader__signal-core" />
          <span className="page-loader__signal-ring page-loader__signal-ring--one" />
          <span className="page-loader__signal-ring page-loader__signal-ring--two" />
        </div>

        <div className="page-loader__eyebrow">Farmacia Ambulatorial</div>
        <strong>{title}</strong>
        <p>{description}</p>

        <div className="page-loader__progress" aria-hidden="true">
          <span className="page-loader__progress-bar" />
        </div>

        <div className="page-loader__skeleton" aria-hidden="true">
          {LOADER_BARS.map((width) => (
            <span key={width} style={{ width }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PageLoader
