import { useState } from 'react'
import { BookOpenCheck, Eye, EyeOff } from 'lucide-react'

// Misma paleta grafito del panel, con un brillo morado tenue de fondo
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface p-4">
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-80 w-[36rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-fg-muted">
          <BookOpenCheck size={20} />
          <span className="text-[13.5px] font-semibold tracking-tight">IUTAV · Asistencia</span>
        </div>

        <div className="card p-7 shadow-2xl shadow-black/40">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
            {subtitle && <p className="text-[13px] font-medium text-accent">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 space-y-2 text-center text-[13px]">{footer}</div>}
      </div>
    </div>
  )
}

export function AuthInput({ icon: Icon, label, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-fg-muted">{label}</span>
      <div className="relative">
        <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim" />
        <input
          type={isPassword && visible ? 'text' : type}
          className={`input py-2.5 pl-9 ${isPassword ? 'pr-10' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-dim transition hover:text-fg"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </label>
  )
}

export const authButtonClass = 'btn-primary w-full py-2.5'

export const authLinkClass = 'font-medium text-accent transition hover:text-fg'
