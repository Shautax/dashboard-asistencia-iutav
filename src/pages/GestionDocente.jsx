import { useCallback, useEffect, useState } from 'react'
import { BookUser, Link2, Loader2, X } from 'lucide-react'
import Toast from '../components/common/Toast'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import { getErrorMessage } from '../api/errors'
import { ROLES, getSessionUser } from '../auth/session'
import { asignarMateria, getProfesores, quitarMateria } from '../services/profesorService'
import { getCarreras } from '../services/dashboardService'
import { formatCedula } from '../utils/format'

const cardClass = 'rounded-3xl border border-slate-200/70 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]'
const selectClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'

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
          className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
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
    ? 'Asigna materias de cualquier carrera a los profesores del instituto.'
    : `Asigna materias de ${carreras[0]?.nombre ?? 'tu carrera'} a los profesores.`

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
          <BookUser size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Gestión Docente</h1>
          <p className="text-sm text-slate-500">{alcance}</p>
        </div>
      </header>

      {loading ? (
        <section className={cardClass}>
          <LoadingMessage>Cargando profesores...</LoadingMessage>
        </section>
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadData} />
      ) : (
        <>
          <section className={`${cardClass} p-6`}>
            <h2 className="mb-4 font-medium text-slate-800">Asignar materia</h2>
            <AsignarMateriaForm profesores={profesores} carreras={carreras} onAssigned={handleAssigned} />
          </section>

          <section className={cardClass}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-medium text-slate-800">Profesores ({profesores.length})</h2>
              {!esMaster && (
                <p className="text-xs text-slate-400">Solo se muestran las materias de tu carrera.</p>
              )}
            </div>
            {profesores.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">No hay profesores registrados.</p>
            ) : (
              <div className="overflow-x-auto px-6 py-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-2 font-medium">Nombre</th>
                      <th className="px-3 py-2 font-medium">Cédula</th>
                      <th className="px-3 py-2 font-medium">Correo</th>
                      <th className="px-3 py-2 font-medium">Materias asignadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profesores.map((p) => (
                      <tr key={p.id} className="align-top">
                        <td className="px-3 py-3 font-medium text-slate-800">{p.nombre}</td>
                        <td className="px-3 py-3 text-slate-600">{formatCedula(p.cedula)}</td>
                        <td className="px-3 py-3 text-slate-600">{p.correo}</td>
                        <td className="px-3 py-3">
                          {p.materias.length === 0 ? (
                            <span className="text-xs italic text-slate-400">Sin materias</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {p.materias.map((m) => {
                                const key = `${p.id}-${m.id}`
                                return (
                                  <span
                                    key={m.id}
                                    title={m.carrera}
                                    className="flex items-center gap-1 rounded-full bg-blue-50 py-0.5 pl-2.5 pr-1 text-xs text-blue-700"
                                  >
                                    {m.nombre}
                                    <button
                                      type="button"
                                      onClick={() => handleQuitar(p, m)}
                                      disabled={quitando === key}
                                      className="rounded-full p-0.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50"
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
