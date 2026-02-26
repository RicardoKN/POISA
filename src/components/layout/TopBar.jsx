import useAuthStore from '../../store/authStore'
import { formatDate } from '../../utils/formatters'

export default function TopBar({ title }) {
  const { staff } = useAuthStore()

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-lg font-semibold text-ink-primary">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-ink-secondary">
          {formatDate(new Date().toISOString())}
        </span>
        <div className="w-px h-5 bg-border" />
        <span className="text-sm text-ink-secondary">
          {staff?.name}
        </span>
      </div>
    </header>
  )
}
