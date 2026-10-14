import { useState } from 'react'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'

// Fondo claro con luces difusas + tarjeta de vidrio (estilo Apple / Liquid Glass)
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f7] p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-[28px] border border-white/80 bg-white/70 p-8 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 backdrop-blur-2xl">
          <div className="mb-7 flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <GraduationCap size={26} />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 space-y-2 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}

export function AuthInput({ icon: Icon, label, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      <div className="relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type={isPassword && visible ? 'text' : type}
          className={`w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60 ${
            isPassword ? 'pr-10' : 'pr-3.5'
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  )
}

export const authButtonClass =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60'

export const authLinkClass = 'font-medium text-blue-600 transition hover:text-blue-700'
