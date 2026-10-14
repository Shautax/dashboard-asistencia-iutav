import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import { getErrorMessage } from '../api/errors'
import { getAlumnos } from '../services/dashboardService'
import { formatCedula } from '../utils/format'

export default function Alumnos() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await getAlumnos())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!data) return []
    if (!q) return data.alumnos
    return data.alumnos.filter(
      (a) => a.nombre.toLowerCase().includes(q) || String(a.cedula).includes(q) || a.correo.toLowerCase().includes(q),
    )
  }, [data, query])

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-lg font-medium text-slate-800">
                Alumnos{data ? ` (${data.total})` : ''}
              </h2>
              <p className="text-sm text-slate-500">Estudiantes inscritos y su inasistencia sin justificar.</p>
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, cédula o correo"
              className="w-72 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-6">
          {loading ? (
            <LoadingMessage>Cargando alumnos...</LoadingMessage>
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadData} />
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              {query ? 'Ningún alumno coincide con la búsqueda.' : 'No hay alumnos inscritos.'}
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Cédula</th>
                  <th className="px-3 py-2 font-medium">Correo</th>
                  <th className="px-3 py-2 font-medium">Carrera</th>
                  <th className="px-3 py-2 text-right font-medium">Materias</th>
                  <th className="px-3 py-2 text-right font-medium">Faltas</th>
                  <th className="px-3 py-2 text-right font-medium">Inasistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => {
                  const grave = a.porcentaje >= data.umbral_porcentaje
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-800">{a.nombre}</td>
                      <td className="px-3 py-3 text-slate-600">{formatCedula(a.cedula)}</td>
                      <td className="px-3 py-3 text-slate-600">{a.correo}</td>
                      <td className="px-3 py-3 text-slate-600">{a.carreras}</td>
                      <td className="px-3 py-3 text-right text-slate-600">{a.materias}</td>
                      <td className="px-3 py-3 text-right text-slate-600">
                        {a.ausencias}/{a.clases}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            grave ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {a.porcentaje}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
