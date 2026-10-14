import { Loader2 } from 'lucide-react'

export function LoadingMessage({ children = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
      <Loader2 size={18} className="animate-spin" />
      {children}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}{' '}
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline">
          Reintentar
        </button>
      )}
    </div>
  )
}
