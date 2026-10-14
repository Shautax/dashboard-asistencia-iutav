import { useCallback, useEffect, useState } from 'react'
import { Check, Clock, KeyRound, Loader2, Plus, UserCog, X } from 'lucide-react'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import CoordinadorForm from '../components/coordinadores/CoordinadorForm'
import { ROLES } from '../auth/session'
import { formatCedula } from '../utils/format'
import PageHeader from '../components/common/PageHeader'
import {
  aprobarSolicitud,
  crearCoordinador,
  getCatalogoCarreras,
  getCoordinadores,
  getErrorMessage,
  getSolicitudes,
  rechazarSolicitud,
  restablecerPassword,
} from '../services/coordinadorService'

const roleBadges = {
  [ROLES.MASTER]: { label: 'Master', className: 'bg-accent/15 text-accent' },
  [ROLES.CARRERA]: { label: 'Carrera', className: 'bg-accent/15 text-accent' },
}

const cardClass = 'card'
const inputClass = 'input py-2.5'
const primaryButton = 'btn-primary'
const ghostButton = 'btn-ghost'

// Modal de aprobación: el master elige la carrera que administrará el nuevo coordinador
function AprobarForm({ solicitud, carreras, onConfirm, onCancel }) {
  const [carreraId, setCarreraId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onConfirm(Number(carreraId))
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <p className="text-sm text-fg-muted">
        <span className="font-medium text-fg">{solicitud.nombre}</span> ({solicitud.correo}) tendrá
        acceso como Coordinador de Carrera. ¿Qué carrera administrará?
      </p>
      <select required value={carreraId} onChange={(e) => setCarreraId(e.target.value)} className={inputClass}>
        <option value="" disabled>
          {carreras.length ? 'Selecciona una carrera' : 'No hay carreras registradas'}
        </option>
        {carreras.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre} ({c.codigo})
          </option>
        ))}
      </select>
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onCancel} className={ghostButton}>
          Cancelar
        </button>
        <button type="submit" disabled={saving || !carreraId} className={primaryButton}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Aprobar
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ coordinador, onConfirm, onCancel }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onConfirm(password)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <p className="text-sm text-fg-muted">
        Asigna una contraseña temporal a <span className="font-medium text-fg">{coordinador.nombre}</span> y
        compártela por un medio seguro.
      </p>
      <input
        required
        minLength={6}
        type="text"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
        placeholder="Nueva contraseña (mínimo 6 caracteres)"
      />
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onCancel} className={ghostButton}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving && <Loader2 size={16} className="animate-spin" />}
          Restablecer
        </button>
      </div>
    </form>
  )
}

export default function Coordinadores() {
  const [coordinadores, setCoordinadores] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setFormOpen] = useState(false)
  const [aprobando, setAprobando] = useState(null)
  const [restableciendo, setRestableciendo] = useState(null)
  const [rechazandoId, setRechazandoId] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [lista, pendientes, catalogo] = await Promise.all([
        getCoordinadores(),
        getSolicitudes(),
        getCatalogoCarreras(),
      ])
      setCoordinadores(lista)
      setSolicitudes(pendientes)
      setCarreras(catalogo)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const closeForm = useCallback(() => setFormOpen(false), [])
  const closeAprobar = useCallback(() => setAprobando(null), [])
  const closeRestablecer = useCallback(() => setRestableciendo(null), [])
  const closeToast = useCallback(() => setToast(''), [])

  // Los formularios muestran el mensaje del error que se relanza
  const withFormError = async (fn) => {
    try {
      await fn()
    } catch (err) {
      throw new Error(getErrorMessage(err))
    }
  }

  const handleCreate = (payload) =>
    withFormError(async () => {
      const nuevo = await crearCoordinador(payload)
      setFormOpen(false)
      setToast(`Coordinador "${nuevo.nombre}" creado correctamente.`)
      await loadData()
    })

  const handleAprobar = (carreraId) =>
    withFormError(async () => {
      const { message } = await aprobarSolicitud(aprobando.id, carreraId)
      setAprobando(null)
      setToast(message)
      await loadData()
    })

  const handleRestablecer = (password) =>
    withFormError(async () => {
      await restablecerPassword(restableciendo.id, password)
      setToast(`Contraseña de ${restableciendo.nombre} restablecida.`)
      setRestableciendo(null)
    })

  const handleRechazar = async (solicitud) => {
    if (!window.confirm(`¿Rechazar la solicitud de ${solicitud.nombre}? Se eliminará su cuenta pendiente.`)) return
    setRechazandoId(solicitud.id)
    try {
      await rechazarSolicitud(solicitud.id)
      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id))
      setToast('Solicitud rechazada.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRechazandoId(null)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestión de Coordinadores"
        subtitle="Aprueba solicitudes de acceso y administra los coordinadores"
        icon={UserCog}
        actions={
          <button type="button" onClick={() => setFormOpen(true)} className={primaryButton}>
            <Plus size={16} />
            Nuevo coordinador
          </button>
        }
      />

      {loading ? (
        <section className={cardClass}>
          <LoadingMessage>Cargando coordinadores...</LoadingMessage>
        </section>
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <>
          <section className={cardClass}>
            <div className="flex items-center gap-2 border-b border-line px-6 py-4">
              <Clock size={18} className="text-amber-400" />
              <h2 className="font-medium text-fg">Solicitudes pendientes</h2>
              {solicitudes.length > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {solicitudes.length}
                </span>
              )}
            </div>
            {solicitudes.length === 0 ? (
              <p className="py-10 text-center text-sm text-fg-dim">No hay solicitudes pendientes.</p>
            ) : (
              <div className="overflow-x-auto px-6 py-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="px-3 py-2 font-medium">Nombre</th>
                      <th className="px-3 py-2 font-medium">Correo</th>
                      <th className="px-3 py-2 font-medium">Estado</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {solicitudes.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-3 font-medium text-fg">{s.nombre}</td>
                        <td className="px-3 py-3 text-fg-muted">{s.correo}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRechazar(s)}
                              disabled={rechazandoId === s.id}
                              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                            >
                              {rechazandoId === s.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={() => setAprobando(s)}
                              className="flex items-center gap-1.5 rounded-full bg-green-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                            >
                              <Check size={14} />
                              Aprobar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={cardClass}>
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-medium text-fg">Coordinadores activos ({coordinadores.length})</h2>
            </div>
            {coordinadores.length === 0 ? (
              <p className="py-10 text-center text-sm text-fg-dim">No hay coordinadores registrados.</p>
            ) : (
              <div className="overflow-x-auto px-6 py-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="px-3 py-2 font-medium">Nombre</th>
                      <th className="px-3 py-2 font-medium">Cédula</th>
                      <th className="px-3 py-2 font-medium">Correo</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Carrera</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {coordinadores.map((c) => {
                      const badge = roleBadges[c.rol]
                      return (
                        <tr key={c.id}>
                          <td className="px-3 py-3 font-medium text-fg">{c.nombre}</td>
                          <td className="px-3 py-3 text-fg-muted">{formatCedula(c.cedula)}</td>
                          <td className="px-3 py-3 text-fg-muted">{c.correo}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge?.className}`}>
                              {badge?.label ?? c.rol}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-fg-muted">{c.carrera ?? '—'}</td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setRestableciendo(c)}
                              title="Restablecer contraseña"
                              aria-label={`Restablecer contraseña de ${c.nombre}`}
                              className="rounded-full p-2 text-fg-dim transition hover:bg-white/5 hover:text-fg"
                            >
                              <KeyRound size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <Modal isOpen={isFormOpen} onClose={closeForm} title="Nuevo coordinador" maxWidth="max-w-2xl">
        <CoordinadorForm carreras={carreras} onSubmit={handleCreate} onCancel={closeForm} />
      </Modal>

      <Modal isOpen={Boolean(aprobando)} onClose={closeAprobar} title="Aprobar coordinador" maxWidth="max-w-md">
        {aprobando && (
          <AprobarForm solicitud={aprobando} carreras={carreras} onConfirm={handleAprobar} onCancel={closeAprobar} />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(restableciendo)}
        onClose={closeRestablecer}
        title="Restablecer contraseña"
        maxWidth="max-w-md"
      >
        {restableciendo && (
          <PasswordForm coordinador={restableciendo} onConfirm={handleRestablecer} onCancel={closeRestablecer} />
        )}
      </Modal>

      <Toast message={toast} onClose={closeToast} />
    </div>
  )
}
