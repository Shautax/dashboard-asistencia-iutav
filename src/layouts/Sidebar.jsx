import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpenCheck,
  BookUser,
  Home,
  Layers,
  LogOut,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { PANEL_PATH, ROLES, clearSession, getSessionUser } from '../auth/session'

// "roles" limita quién ve la opción; sin "roles" la ven todos los coordinadores
const navItems = [
  { to: PANEL_PATH, label: 'Panel General', icon: Home, end: true },
  { to: '/alumnos', label: 'Alumnos', icon: Users },
  { to: '/gestion-docente', label: 'Gestión Docente', icon: BookUser },
  { to: '/coordinadores', label: 'Gestión de Coordinadores', icon: UserCog, roles: [ROLES.MASTER] },
  { to: '/seguridad-red', label: 'Seguridad de Red', icon: ShieldCheck, roles: [ROLES.MASTER] },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]

const roleLabels = {
  [ROLES.MASTER]: 'Coordinador Master',
  [ROLES.CARRERA]: 'Coordinador de Carrera',
}

const scopeLabels = {
  [ROLES.MASTER]: 'Todo el instituto',
  [ROLES.CARRERA]: 'Mi carrera',
}

export default function Sidebar() {
  const navigate = useNavigate()
  const user = getSessionUser()
  const rol = user?.rol
  const nombre = user?.nombre ?? 'Coordinador'
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(rol))

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col gap-5 border-r border-line bg-surface-sidebar px-2 py-6 lg:w-[260px] lg:px-4">
      <div className="flex items-center justify-center gap-2.5 px-2 lg:justify-start">
        <BookOpenCheck size={20} className="shrink-0 text-fg-muted" />
        <span className="hidden text-[13.5px] font-semibold tracking-tight text-fg-muted lg:inline">IUTAV · Asistencia</span>
      </div>

      {/* Alcance del coordinador (equivale al selector de curso de la referencia) */}
      <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface-card px-3 py-2.5 lg:flex">
        <Layers size={15} className="shrink-0 text-accent" />
        <span className="truncate text-[13px] font-medium text-fg">{scopeLabels[rol] ?? 'Panel'}</span>
      </div>

      <nav className="flex flex-col gap-1">
        {visibleItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors lg:justify-start ${
                isActive ? 'bg-white/[0.06] text-fg' : 'text-fg-muted hover:bg-white/[0.03] hover:text-fg'
              }`
            }
          >
            <Icon size={17} className="shrink-0 opacity-80" />
            <span className="hidden truncate lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-line pt-4">
        <div className="flex items-center justify-center gap-2.5 px-1 py-1.5 lg:justify-start lg:px-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-avatar text-xs font-semibold text-fg-muted"
            title={nombre}
          >
            {nombre.charAt(0).toUpperCase()}
          </span>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-[13px] font-medium text-fg">{nombre}</p>
            <p className="truncate text-[11.5px] text-fg-dim">{roleLabels[rol]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-fg-muted transition-colors hover:bg-rose-500/10 hover:text-rose-400 lg:justify-start"
        >
          <LogOut size={17} className="shrink-0" />
          <span className="hidden lg:inline">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
