import { formatCedula } from '../../utils/format'

export default function AlumnosGravesTable({ alumnos, showCarrera }) {
  if (alumnos.length === 0) {
    return <p className="py-10 text-center text-[13px] text-fg-dim">No hay alumnos en situación grave. 🎉</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="table-head">
            <th className="px-3 py-2.5 font-medium">Alumno</th>
            <th className="px-3 py-2.5 font-medium">Cédula</th>
            <th className="px-3 py-2.5 font-medium">Materia</th>
            {showCarrera && <th className="px-3 py-2.5 font-medium">Carrera</th>}
            <th className="px-3 py-2.5 text-right font-medium">Faltas</th>
            <th className="px-3 py-2.5 text-right font-medium">Inasistencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {alumnos.map((a) => (
            <tr key={`${a.estudiante_id}-${a.materia_id}`} className="transition-colors hover:bg-white/[0.02]">
              <td className="px-3 py-3 font-medium text-fg">{a.nombre}</td>
              <td className="px-3 py-3 text-fg-muted">{formatCedula(a.cedula)}</td>
              <td className="px-3 py-3 text-fg-muted">{a.materia}</td>
              {showCarrera && <td className="px-3 py-3 text-fg-muted">{a.carrera}</td>}
              <td className="px-3 py-3 text-right font-semibold tabular-nums text-fg">
                {a.ausencias}/{a.clases}
                {a.justificadas > 0 && (
                  <span className="ml-1 text-xs font-normal text-fg-dim">(+{a.justificadas} just.)</span>
                )}
              </td>
              <td className="px-3 py-3 text-right">
                <span className="status bg-rose-500/10 text-rose-400">{a.porcentaje}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
