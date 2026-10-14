import { useCallback, useEffect, useState } from 'react'
import { BookUser, Link2, Loader2, X } from 'lucide-react'
import Toast from '../components/common/Toast'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import { getErrorMessage } from '../api/errors'
import { ROLES, getSessionUser } from '../auth/session'
import { asignarMateria, getProfesores, quitarMateria } from '../services/profesorService'
import { getCarreras } from '../services/dashboardService'
import PageHeader from '../components/common/PageHeader'
import { formatCedula } from '../utils/format'

const cardClass = 'card'
const selectClass = 'input py-2.5'

// Las carreras y materias llegan ya filtradas por el backend según el rol del coordinador
function AsignarMateriaForm({ profesores, carreras, onAssigned }) {
  const [profesorId, setProfesorId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { message } = await asignarMateria(Number(profesorId), Number(materiaId))
      setMateriaId('')
      await onAssigned(message)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select required value={profesorId} onChange={(e) => setProfesorId(e.target.value)} className={selectClass}>
          <option value="" disabled>
            Selecciona un profesor
          </option>
          {profesores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select required value={materiaId} onChange={(e) => setMateriaId(e.target.value)} className={selectClass}>
          <option value="" disabled>
            Selecciona una materia
          </option>
          {carreras.map((c) => (
            <optgroup key={c.id} label={c.nombre}>
              {c.materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.semestre ? `S${m.semestre} · ` : ''}
                  {m.nombre}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary py-2.5"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
          Asignar
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
    </form>
  )
}

export default function GestionDocente() {
  const user = getSessionUser()
  const esMaster = user?.rol === ROLES.MASTER
  const [profesores, setProfesores] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quitando, setQuitando] = useState(null)
  const [toast, setToast] = useState('')

  const loadProfesores = useCallback(async () => {
    setProfesores(await getProfesores())
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [, listaCarreras] = await Promise.all([loadProfesores(), getCarreras()])
      setCarreras(listaCarreras)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [loadProfesores])

  useEffect(() => {
    loadData()
  }, [loadData])

  const closeToast = useCallback(() => setToast(''), [])

  const handleAssigned = async (message) => {
    setToast(message)
    await loadProfesores()
  }

  const handleQuitar = async (profesor, materia) => {
    if (!window.confirm(`¿Retirar ${materia.nombre} a ${profesor.nombre}?`)) return
    const key = `${profesor.id}-${materia.id}`
    setQuitando(key)
    try {
      await quitarMateria(profesor.id, materia.id)
      setToast(`${materia.nombre} retirada a ${profesor.nombre}.`)
      await loadProfesores()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setQuitando(null)
    }
  }

  const alcance = esMaster
    ? 'Asigna materias de cualquier carrera a los profesores del instituto'
    : `Asigna materias de ${carreras[0]?.nombre ?? 'tu carrera'} a los profesores`

  return (
    <div className="space-y-8">
      <PageHeader title="Gestión Docente" subtitle={alcance} icon={BookUser} />

      {loading ? (
        <section className={cardClass}>
          <LoadingMessage>Cargando profesores...</LoadingMessage>
        </section>
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <>
          <section className={`${cardClass} p-6`}>
            <h2 className="mb-4 font-medium text-fg">Asignar materia</h2>
            <AsignarMateriaForm profesores={profesores} carreras={carreras} onAssigned={handleAssigned} />
          </section>

          <section className={cardClass}>
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-medium text-fg">Profesores ({profesores.length})</h2>
              {!esMaster && (
                <p className="text-xs text-fg-dim">Solo se muestran las materias de tu carrera.</p>
              )}
            </div>
            {profesores.length === 0 ? (
              <p className="py-10 text-center text-sm text-fg-dim">No hay profesores registrados.</p>
            ) : (
              <div className="overflow-x-auto px-6 py-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="px-3 py-2 font-medium">Nombre</th>
                      <th className="px-3 py-2 font-medium">Cédula</th>
                      <th className="px-3 py-2 font-medium">Correo</th>
                      <th className="px-3 py-2 font-medium">Materias asignadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {profesores.map((p) => (
                      <tr key={p.id} className="align-top">
                        <td className="px-3 py-3 font-medium text-fg">{p.nombre}</td>
                        <td className="px-3 py-3 text-fg-muted">{formatCedula(p.cedula)}</td>
                        <td className="px-3 py-3 text-fg-muted">{p.correo}</td>
                        <td className="px-3 py-3">
                          {p.materias.length === 0 ? (
                            <span className="text-xs italic text-fg-dim">Sin materias</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {p.materias.map((m) => {
                                const key = `${p.id}-${m.id}`
                                return (
                                  <span
                                    key={m.id}
                                    title={m.carrera}
                                    className="pill gap-1 py-0.5 pl-3 pr-1 text-fg"
                                  >
                                    {m.nombre}
                                    <button
                                      type="button"
                                      onClick={() => handleQuitar(p, m)}
                                      disabled={quitando === key}
                                      className="rounded-full p-0.5 text-fg-dim transition hover:bg-white/10 hover:text-rose-400 disabled:opacity-50"
                                      aria-label={`Retirar ${m.nombre}`}
                                    >
                                      {quitando === key ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <Toast message={toast} onClose={closeToast} />
    </div>
  )
}
