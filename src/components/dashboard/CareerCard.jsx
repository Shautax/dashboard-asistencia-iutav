import { ChevronRight } from 'lucide-react'

const MAX_MATERIAS_VISIBLES = 4

export default function CareerCard({ name, subjects, absence, onClick }) {
  const visibles = subjects.slice(0, MAX_MATERIAS_VISIBLES)
  const restantes = subjects.length - visibles.length

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[170px] flex-col rounded-xl border-2 border-slate-200 bg-slate-50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-700 hover:bg-white hover:shadow-md"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <h3 className="text-lg font-medium text-slate-800">{name}</h3>
        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
        />
      </div>

      <ul className="mt-2 flex-1 space-y-0.5 text-sm text-slate-600">
        {subjects.length === 0 && <li className="italic text-slate-400">Sin materias registradas</li>}
        {visibles.map((subject) => (
          <li key={subject}>{subject}</li>
        ))}
        {restantes > 0 && <li className="text-slate-400">+{restantes} más</li>}
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        Inasistencia: <span className="font-semibold text-slate-700">{absence}%</span>
      </p>
    </button>
  )
}
