import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { ROLES, clearSession, getSessionUser } from '../auth/session'

const roleLabels = {
  [ROLES.MASTER]: 'Coordinador Master',
  [ROLES.CARRERA]: 'Coordinador de Carrera',
}

export default function TopBar() {
  const navigate = useNavigate()
  const user = getSessionUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-medium text-slate-800">
        Sistema de Gestión Académica
      </h1>

      <div className="flex items-center gap-5">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notificaciones"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-1 rounded-full p-1 hover:bg-slate-100"
            aria-label="Perfil de usuario"
            aria-expanded={menuOpen}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-slate-600">
              <User size={20} />
            </span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-800">
                  {user?.nombre ?? user?.name ?? user?.email ?? 'Coordinador'}
                </p>
                <p className="text-xs text-slate-500">{roleLabels[user?.rol]}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
