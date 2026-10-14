import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Building2, GraduationCap, Layers, RefreshCw } from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import CareerCard from '../components/dashboard/CareerCard'
import AlumnosGravesTable from '../components/dashboard/AlumnosGravesTable'
import SemesterModal from '../components/modals/SemesterModal'
import PageHeader from '../components/common/PageHeader'
import SectionHeader from '../components/common/SectionHeader'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import { getErrorMessage } from '../api/errors'
import {
  getAlumnosGraves,
  getCarreras,
  getEstadisticas,
  getMateriasCarrera,
} from '../services/dashboardService'

function SkeletonCard({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-card ${className}`} />
}

// Convierte la respuesta de /dashboard/estadisticas en las 4 tarjetas KPI
function buildKpis(stats) {
  const general = stats.inasistencia_general
  const esInstituto = stats.alcance.tipo === 'instituto'

  return [
    {
      key: 'general',
      highlight: true,
      title: 'Inasistencia General',
      value: `${general.porcentaje}%`,
      subtitle: `${general.ausencias} faltas en ${general.clases_cerradas} clases`,
    },
    ...stats.top_materias.map((m) => ({
      key: m.id,
      title: m.nombre,
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
      <div>
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    )
  }

  const esInstituto = stats?.alcance.tipo === 'instituto'
  const alcanceNombre = esInstituto ? 'Instituto IUTAV' : (stats?.alcance.carrera?.nombre ?? 'Mi carrera')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Control de Asistencia"
        subtitle={loading ? 'Cargando…' : `${alcanceNombre} • Inasistencia sin justificar`}
        icon={Layers}
        actions={
          <button type="button" onClick={loadData} disabled={loading} className="btn-secondary">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        }
      />

      {/* Tarjeta principal: alcance + KPIs */}
      {loading ? (
        <SkeletonCard className="h-[120px]" />
      ) : (
        <section className="card grid items-center gap-6 px-7 py-6 sm:grid-cols-2 xl:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
          <div className="flex items-center gap-4 sm:col-span-2 xl:col-span-1 xl:border-r xl:border-line xl:pr-5">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#2a2d38] text-fg">
              {esInstituto ? <Building2 size={22} /> : <GraduationCap size={22} />}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-tight text-fg">{alcanceNombre}</h3>
              <p className="mt-0.5 text-[13px] text-fg-muted">
                {esInstituto ? 'Vista de todas las carreras' : 'Vista de tu carrera'}
              </p>
            </div>
          </div>
          {buildKpis(stats).map(({ key, ...kpi }) => (
            <KpiCard key={key} {...kpi} />
          ))}
        </section>
      )}

      <section className="space-y-4">
        <SectionHeader
          icon={GraduationCap}
          title="Carreras"
          description="Inasistencia por carrera; abre una para ver sus materias por periodo"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} className="h-[230px]" />)
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
          <p className="card py-10 text-center text-[13px] text-fg-dim">No hay carreras registradas.</p>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={AlertTriangle}
          title={`Alumnos en situación grave${graves ? ` (${graves.total})` : ''}`}
          description={graves ? `${graves.umbral_porcentaje}% o más de faltas sin justificar en una materia` : undefined}
        />
        <div className="card p-5">
          {loading ? (
            <LoadingMessage>Cargando alumnos...</LoadingMessage>
          ) : (
            <AlumnosGravesTable alumnos={graves.alumnos} showCarrera={esInstituto} />
          )}
        </div>
      </section>

      <SemesterModal
        isOpen={Boolean(selectedCareer)}
        onClose={closeCareer}
        title={`Materias por periodo · ${selectedCareer?.nombre ?? ''}`}
        materias={materias}
        loading={materiasLoading}
        error={materiasError}
      />
    </div>
  )
}
