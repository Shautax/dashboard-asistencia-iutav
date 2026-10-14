import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Loader2, Lock, Mail, User } from 'lucide-react'
import AuthLayout, { AuthInput, authButtonClass, authLinkClass } from '../components/auth/AuthLayout'
import { ROLES } from '../auth/session'
import { checkMaster, getErrorMessage, registrarEnPanel } from '../services/authService'

const LARGO_MINIMO_PASSWORD = 6

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', codigoInstalacion: '' })
  // null mientras se consulta; si la consulta falla se asume sellado (el campo no se muestra)
  const [hasMaster, setHasMaster] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelado = false
    checkMaster()
      .then((sellado) => !cancelado && setHasMaster(sellado))
      .catch(() => !cancelado && setHasMaster(true))
    return () => {
      cancelado = true
    }
  }, [])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const usuario = await registrarEnPanel({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        password: form.password,
        codigoInstalacion: hasMaster ? '' : form.codigoInstalacion.trim(),
      })
      const toast =
        usuario?.rol === ROLES.MASTER
          ? 'Registro exitoso. Ya puedes iniciar sesión como Coordinador Master.'
          : 'Registro exitoso. Espera a que el Coordinador Master apruebe tu cuenta'
      navigate('/login', { replace: true, state: { toast } })
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Solicitar acceso"
      subtitle="Registro de Coordinador"
      footer={
        <p className="text-fg-muted">
          ¿Ya tienes acceso?{' '}
          <Link to="/login" className={authLinkClass}>
            Inicia sesión
          </Link>
        </p>
      }
    >
      {hasMaster === null ? (
        <div className="flex justify-center py-10 text-fg-dim">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            icon={User}
            label="Nombre completo"
            required
            autoComplete="name"
            value={form.nombre}
            onChange={update('nombre')}
            placeholder="Ej. María Pérez"
            disabled={loading}
          />
          <AuthInput
            icon={Mail}
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            value={form.correo}
            onChange={update('correo')}
            placeholder="nombre@iutav.edu.ve"
            disabled={loading}
          />
          <AuthInput
            icon={Lock}
            label="Contraseña"
            type="password"
            required
            minLength={LARGO_MINIMO_PASSWORD}
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            placeholder={`Mínimo ${LARGO_MINIMO_PASSWORD} caracteres`}
            disabled={loading}
          />

          {/* Solo existe en el DOM mientras el sistema no tenga un master */}
          {!hasMaster && (
            <div className="rounded-2xl border border-dashed border-line bg-surface-input p-3.5">
              <AuthInput
                icon={KeyRound}
                label="Código de Instalación"
                type="password"
                autoComplete="off"
                value={form.codigoInstalacion}
                onChange={update('codigoInstalacion')}
                placeholder="Opcional"
                disabled={loading}
              />
              <p className="mt-2 text-xs leading-relaxed text-fg-dim">
                Solo para la configuración inicial: crea la cuenta del Coordinador Master.
              </p>
            </div>
          )}

          {error && <p className="rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Enviando...' : 'Registrarme'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
