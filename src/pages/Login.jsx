import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'
import axiosClient from '../api/axiosClient'
import { getErrorMessage } from '../api/errors'
import Toast from '../components/common/Toast'
import AuthLayout, { AuthInput, authButtonClass, authLinkClass } from '../components/auth/AuthLayout'
import {
  clearSession,
  getSessionUser,
  isAllowedRole,
  setToken,
} from '../auth/session'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Aviso que llega desde otra pantalla (ej. registro exitoso)
  const location = useLocation()
  const [toast, setToast] = useState(location.state?.toast ?? '')
  const closeToast = useCallback(() => setToast(''), [])

  // Limpia el state del historial para que el aviso no reaparezca al recargar
  useEffect(() => {
    if (location.state?.toast) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  // Si ya hay una sesión válida de coordinador, no mostrar el Login
  const currentUser = getSessionUser()
  if (currentUser && isAllowedRole(currentUser.rol)) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await axiosClient.post('/login', { correo: email.trim(), password })
      const token = data.token ?? data.accessToken ?? data.data?.token
      if (!token) throw new Error('La respuesta del servidor no incluye un token.')

      setToken(token)
      const user = getSessionUser()

      if (!user || !isAllowedRole(user.rol)) {
        clearSession()
        setError('Acceso restringido: este panel es solo para coordinadores.')
        return
      }

      navigate('/', { replace: true })
    } catch (err) {
      // 401: credenciales inválidas. 403: solicitud de coordinador aún pendiente de aprobación.
      setError(err.response?.status === 401 ? 'Correo o contraseña incorrectos.' : getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Panel de Coordinación"
      subtitle="Sistema de Gestión Académica"
      footer={
        <>
          <p>
            <Link to="/recuperar" className={authLinkClass}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="text-fg-muted">
            ¿Eres coordinador?{' '}
            <Link to="/registro" className={authLinkClass}>
              Solicitar acceso como Coordinador
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={Mail}
          label="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@iutav.edu.ve"
          disabled={loading}
        />
        <AuthInput
          icon={Lock}
          label="Contraseña"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />

        {error && <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-400">{error}</p>}

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
      <Toast message={toast} onClose={closeToast} />
    </AuthLayout>
  )
}
