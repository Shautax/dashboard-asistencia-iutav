import { Loader2 } from 'lucide-react'

export function LoadingMessage({ children = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-fg-muted">
      <Loader2 size={18} className="animate-spin" />
      {children}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
      {message}{' '}
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline">
          Reintentar
        </button>
      )}
    </div>
  )
}
