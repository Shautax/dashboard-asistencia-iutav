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
  pct >= 25 ? 'text-rose-400' : pct >= 15 ? 'text-amber-400' : 'text-fg-muted'

export default function SemesterModal({ isOpen, onClose, title, materias, loading, error }) {
  const semestres = agruparPorSemestre(materias)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-fg-muted">
          <Loader2 size={18} className="animate-spin" />
          Cargando materias...
        </div>
      ) : error ? (
        <p className="m-6 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">{error}</p>
      ) : materias.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-fg-dim">Esta carrera no tiene materias registradas.</p>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {semestres.map(({ key, name, materias: items }) => (
            <div key={key} className="overflow-hidden rounded-xl border border-line bg-surface-input">
              <div className="border-b border-line bg-white/[0.03] px-4 py-2.5 text-[13px] font-semibold text-fg">{name}</div>
              <ul className="divide-y divide-line px-4 text-[13px]">
                {items.map((m) => (
                  <li key={m.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-fg">{m.nombre}</span>
                      <span
                        className={`shrink-0 text-xs font-semibold ${absenceColor(m.porcentaje_inasistencia)}`}
                        title="Inasistencia sin justificar"
                      >
                        {m.porcentaje_inasistencia}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-fg-dim">
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
