import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'token'

export const ROLES = {
  MASTER: 'coordinador_master',
  CARRERA: 'coordinador_carrera',
}

export const ALLOWED_ROLES = [ROLES.MASTER, ROLES.CARRERA]

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const clearSession = () => localStorage.removeItem(TOKEN_KEY)

/**
 * Decodifica el token guardado. Devuelve null si no existe,
 * está mal formado o ya expiró.
 */
export function getSessionUser() {
  const token = getToken()
  if (!token) return null

  try {
    const payload = jwtDecode(token)
    if (payload.exp && payload.exp * 1000 < Date.now()) return null

    return {
      ...payload,
      // El backend puede enviar el rol como "rol" o "role"
      rol: payload.rol ?? payload.role ?? null,
    }
  } catch {
    return null
  }
}

export const isAllowedRole = (rol) => ALLOWED_ROLES.includes(rol)
