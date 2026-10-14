import { Navigate, Outlet } from 'react-router-dom'
import {
  ALLOWED_ROLES,
  PANEL_PATH,
  clearSession,
  getSessionUser,
} from '../../auth/session'

/**
 * Bloquea el acceso si no hay un token válido o si el rol no está permitido.
 * - Sin sesión / rol ajeno al panel (alumno, profesor): borra el token y va al Login.
 * - Coordinador sin permiso para esta sección: vuelve al inicio del panel.
 */
export default function ProtectedRoute({ allowedRoles = ALLOWED_ROLES, children }) {
  const user = getSessionUser()

  if (!user || !ALLOWED_ROLES.includes(user.rol)) {
    clearSession()
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to={PANEL_PATH} replace />
  }

  return children ?? <Outlet />
}
