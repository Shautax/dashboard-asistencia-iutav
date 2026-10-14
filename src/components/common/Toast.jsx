import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

// Aviso flotante de éxito; se cierra solo a los 4 s
export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-line-strong bg-surface-elevated/95 px-4 py-3 text-[13px] text-fg shadow-2xl shadow-black/50 backdrop-blur"
    >
      <CheckCircle2 size={18} className="text-green-500" />
      {message}
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 text-fg-dim hover:bg-white/10 hover:text-fg"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
