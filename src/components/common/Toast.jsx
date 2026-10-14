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
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <CheckCircle2 size={18} className="text-green-500" />
      {message}
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
