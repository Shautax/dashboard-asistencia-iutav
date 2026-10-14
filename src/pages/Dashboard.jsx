import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import CareerCard from '../components/dashboard/CareerCard'
import AlumnosGravesTable from '../components/dashboard/AlumnosGravesTable'
import SemesterModal from '../components/modals/SemesterModal'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import { getErrorMessage } from '../api/errors'
import {
  getAlumnosGraves,
  getCarreras,
  getEstadisticas,
  getMateriasCarrera,
} from '../services/dashboardService'

function SkeletonCard({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
}

// Convierte la respuesta de /dashboard/estadisticas en las 4 tarjetas KPI
function buildKpis(stats) {
  const general = stats.inasistencia_general
  const esInstituto = stats.alcance.tipo === 'instituto'

  return [
    {
      key: 'general',
      highlight: true,
      title: esInstituto
        ? 'Inasistencia General del Instituto'
        : `Inasistencia General de ${stats.alcance.carrera?.nombre ?? 'la Carrera'}`,
      value: `${general.porcentaje}%`,
      subtitle: `${general.ausencias} faltas en ${general.clases_cerradas} clases`,
    },
    ...stats.top_materias.map((m) => ({
      key: m.id,
      title: `Inasistencia de ${m.nombre}`,
      value: `${m.porcentaje}%`,
      subtitle: esInstituto ? m.carrera : `${m.ausencias} faltas`,
      trend: m.tendencia,
    })),
  ]
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [carreras, setCarreras] = useState([])
  const [graves, setGraves] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedCareer, setSelectedCareer] = useState(null)
  const [materias, setMaterias] = useState([])
  const [materiasLoading, setMateriasLoading] = useState(false)
  const [materiasError, setMateriasError] = useState('')
  const requestedCareer = useRef(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [estadisticas, listaCarreras, alumnosGraves] = await Promise.all([
        getEstadisticas(),
        getCarreras(),
        getAlumnosGraves(),
      ])
      setStats(estadisticas)
      setCarreras(listaCarreras)
      setGraves(alumnosGraves)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openCareer = async (career) => {
    requestedCareer.current = career.id
    setSelectedCareer(career)
    setMaterias([])
    setMateriasError('')
    setMateriasLoading(true)
    try {
      const data = await getMateriasCarrera(career.id)
      // Si el usuario abrió otra carrera mientras cargaba, se descarta esta respuesta
      if (requestedCareer.current === career.id) setMaterias(data)
    } catch (err) {
      if (requestedCareer.current === career.id) setMateriasError(getErrorMessage(err))
    } finally {
      if (requestedCareer.current === career.id) setMateriasLoading(false)
    }
  }

  const closeCareer = useCallback(() => {
    requestedCareer.current = null
    setSelectedCareer(null)
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    )
  }

  const esInstituto = stats?.alcance.tipo === 'instituto'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} className="h-36" />)
          : buildKpis(stats).map(({ key, ...kpi }) => <KpiCard key={key} {...kpi} />)}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-slate-800">Carreras Universitarias</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} className="h-[170px]" />)
            : carreras.map((career) => (
                <CareerCard
                  key={career.id}
                  name={career.nombre}
                  subjects={career.materias.map((m) => m.nombre)}
                  absence={career.porcentaje_inasistencia}
                  onClick={() => openCareer(career)}
                />
              ))}
        </div>
        {!loading && carreras.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No hay carreras registradas.</p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2 className="text-lg font-medium text-slate-800">
              Alumnos en situación grave{graves ? ` (${graves.total})` : ''}
            </h2>
            {graves && (
              <p className="text-sm text-slate-500">
                {graves.umbral_porcentaje}% o más de faltas sin justificar en una materia
              </p>
            )}
          </div>
        </div>
        {loading ? (
          <LoadingMessage>Cargando alumnos...</LoadingMessage>
        ) : (
          <AlumnosGravesTable alumnos={graves.alumnos} showCarrera={esInstituto} />
        )}
      </section>

      <SemesterModal
        isOpen={Boolean(selectedCareer)}
        onClose={closeCareer}
        title={`Materias por Periodo -${selectedCareer?.nombre ?? ''}`}
        materias={materias}
        loading={materiasLoading}
        error={materiasError}
      />
    </div>
  )
}
