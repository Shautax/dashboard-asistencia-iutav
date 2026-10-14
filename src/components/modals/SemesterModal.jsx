import { Loader2 } from 'lucide-react'
import Modal from '../common/Modal'

// Agrupa las materias por periodo (columna semestre); las que no tienen periodo van al final
function agruparPorSemestre(materias) {
  const grupos = new Map()
  for (const materia of materias) {
    const key = materia.semestre ?? 'sin'
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key).push(materia)
  }
  return [...grupos.entries()].map(([key, items]) => ({
    key,
    name: key === 'sin' ? 'Sin periodo asignado' : `Periodo ${key}`,
    materias: items,
  }))
}

const absenceColor = (pct) =>
  pct >= 25 ? 'text-red-600' : pct >= 15 ? 'text-amber-600' : 'text-slate-500'

export default function SemesterModal({ isOpen, onClose, title, materias, loading, error }) {
  const semestres = agruparPorSemestre(materias)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Cargando materias...
        </div>
      ) : error ? (
        <p className="m-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : materias.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">Esta carrera no tiene materias registradas.</p>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {semestres.map(({ key, name, materias: items }) => (
            <div key={key} className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <div className="bg-blue-50 px-4 py-2.5 font-medium text-slate-800">{name}</div>
              <ul className="divide-y divide-slate-100 px-4 text-sm">
                {items.map((m) => (
                  <li key={m.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-700">{m.nombre}</span>
                      <span
                        className={`shrink-0 text-xs font-semibold ${absenceColor(m.porcentaje_inasistencia)}`}
                        title="Inasistencia sin justificar"
                      >
                        {m.porcentaje_inasistencia}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {m.codigo && <span className="font-mono">{m.codigo} · </span>}
                      {m.profesores ?? 'Sin profesor asignado'} · {m.inscritos} inscritos
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
