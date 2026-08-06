export interface ReferenceNotificationProps {
  body: string
  hint: string
  label: string
  value: string
}

export function ReferenceNotification({ body, hint, label, value }: ReferenceNotificationProps) {
  return (
    <div className="app-notification__reference">
      <span>{body}</span>
      <span className="app-notification__reference-label">{label}</span>
      <strong className="app-notification__reference-id">{value}</strong>
      <span className="app-notification__reference-hint">{hint}</span>
    </div>
  )
}

export default ReferenceNotification
