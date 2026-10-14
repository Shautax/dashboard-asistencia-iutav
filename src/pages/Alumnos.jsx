import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
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
    <div className="space-y-8">
      <PageHeader
        title={`Alumnos${data ? ` (${data.total})` : ''}`}
        subtitle="Estudiantes inscritos y su inasistencia sin justificar"
        icon={Users}
      />
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, cédula o correo"
              className="input pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-6">
          {loading ? (
            <LoadingMessage>Cargando alumnos...</LoadingMessage>
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadData} />
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-fg-dim">
              {query ? 'Ningún alumno coincide con la búsqueda.' : 'No hay alumnos inscritos.'}
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Cédula</th>
                  <th className="px-3 py-2 font-medium">Correo</th>
                  <th className="px-3 py-2 font-medium">Carrera</th>
                  <th className="px-3 py-2 text-right font-medium">Materias</th>
                  <th className="px-3 py-2 text-right font-medium">Faltas</th>
                  <th className="px-3 py-2 text-right font-medium">Inasistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((a) => {
                  const grave = a.porcentaje >= data.umbral_porcentaje
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 font-medium text-fg">{a.nombre}</td>
                      <td className="px-3 py-3 text-fg-muted">{formatCedula(a.cedula)}</td>
                      <td className="px-3 py-3 text-fg-muted">{a.correo}</td>
                      <td className="px-3 py-3 text-fg-muted">{a.carreras}</td>
                      <td className="px-3 py-3 text-right text-fg-muted">{a.materias}</td>
                      <td className="px-3 py-3 text-right text-fg-muted">
                        {a.ausencias}/{a.clases}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`status ${
                            grave ? 'bg-rose-500/10 text-rose-400' : 'bg-green-500/10 text-green-400'
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
