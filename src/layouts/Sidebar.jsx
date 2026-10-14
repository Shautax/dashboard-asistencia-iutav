import { NavLink } from 'react-router-dom'
import { Home, Users, BookUser, UserCog, ShieldCheck, Settings, Menu } from 'lucide-react'
import { ROLES, getSessionUser } from '../auth/session'

// "roles" limita quién ve la opción; sin "roles" la ven todos los coordinadores
const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/alumnos', label: 'Alumnos', icon: Users },
  { to: '/gestion-docente', label: 'Gestión Docente', icon: BookUser },
  {
    to: '/coordinadores',
    label: 'Gestión de Coordinadores',
    icon: UserCog,
    roles: [ROLES.MASTER],
  },
  {
    to: '/seguridad-red',
    label: 'Seguridad de Red',
    icon: ShieldCheck,
    roles: [ROLES.MASTER],
  },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const rol = getSessionUser()?.rol
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(rol))

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center border-r border-slate-200 bg-slate-50 py-4">
      <button
        type="button"
        className="mb-6 rounded-lg p-2 text-slate-500 hover:bg-slate-200"
        aria-label="Menú"
      >
        <Menu size={22} />
      </button>

      <nav className="flex flex-col gap-3">
        {visibleItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `rounded-lg p-2 transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
