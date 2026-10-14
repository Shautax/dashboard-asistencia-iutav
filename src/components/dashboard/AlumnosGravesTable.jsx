import { formatCedula } from '../../utils/format'

export default function AlumnosGravesTable({ alumnos, showCarrera }) {
  if (alumnos.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No hay alumnos en situación grave. 🎉</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2 font-medium">Alumno</th>
            <th className="px-3 py-2 font-medium">Cédula</th>
            <th className="px-3 py-2 font-medium">Materia</th>
            {showCarrera && <th className="px-3 py-2 font-medium">Carrera</th>}
            <th className="px-3 py-2 text-right font-medium">Faltas</th>
            <th className="px-3 py-2 text-right font-medium">Inasistencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alumnos.map((a) => (
            <tr key={`${a.estudiante_id}-${a.materia_id}`} className="hover:bg-slate-50">
              <td className="px-3 py-3 font-medium text-slate-800">{a.nombre}</td>
              <td className="px-3 py-3 text-slate-600">{formatCedula(a.cedula)}</td>
              <td className="px-3 py-3 text-slate-600">{a.materia}</td>
              {showCarrera && <td className="px-3 py-3 text-slate-600">{a.carrera}</td>}
              <td className="px-3 py-3 text-right text-slate-600">
                {a.ausencias}/{a.clases}
                {a.justificadas > 0 && (
                  <span className="ml-1 text-xs text-slate-400">(+{a.justificadas} just.)</span>
                )}
              </td>
              <td className="px-3 py-3 text-right">
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  {a.porcentaje}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
