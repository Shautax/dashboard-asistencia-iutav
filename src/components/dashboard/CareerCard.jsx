import { ChevronRight, GraduationCap } from 'lucide-react'

const MAX_MATERIAS_VISIBLES = 3

// Tarjeta de carrera con barra de progreso beige (estilo "objetivos" de la referencia)
export default function CareerCard({ name, subjects, absence, onClick }) {
  const visibles = subjects.slice(0, MAX_MATERIAS_VISIBLES)
  const restantes = subjects.length - visibles.length
  const width = Math.min(Math.max(absence, 0), 100)

  return (
    <button
      type="button"
      onClick={onClick}
      className="card group flex flex-col gap-4 p-5 text-left transition hover:-translate-y-px hover:border-line-strong"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-fg">
          <GraduationCap size={17} className="shrink-0 text-accent" />
          {name}
        </h3>
        <ChevronRight
          size={16}
          className="mt-0.5 shrink-0 text-fg-dim transition group-hover:translate-x-0.5 group-hover:text-fg"
        />
      </div>
      <p className="-mt-2 text-[12.5px] text-fg-muted">
        {subjects.length} {subjects.length === 1 ? 'materia registrada' : 'materias registradas'}
      </p>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11.5px] text-fg-dim">
          <span>Inasistencia</span>
          <span>Meta: &lt; 25%</span>
        </div>
        <div className="relative flex h-[22px] w-full items-center overflow-hidden rounded-full bg-surface-track">
          <div
            className="flex h-full min-w-[3rem] items-center justify-end rounded-full bg-beige pr-2.5 transition-[width] duration-700"
            style={{ width: `${width}%` }}
          >
            <span className="text-[11px] font-bold text-[#212328]">{absence}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium text-fg-dim">Materias</p>
        <div className="flex flex-wrap gap-1.5">
          {subjects.length === 0 && <span className="text-xs italic text-fg-dim">Sin materias registradas</span>}
          {visibles.map((subject) => (
            <span key={subject} className="pill max-w-full truncate">
              {subject}
            </span>
          ))}
          {restantes > 0 && <span className="pill">+{restantes}</span>}
        </div>
      </div>
    </button>
  )
}
