import { AlertTriangle, LineChart } from 'lucide-react'

const WIDTH = 60
const HEIGHT = 28

// Mini gráfico de líneas con los % de inasistencia de las últimas clases
function Sparkline({ values }) {
  if (!values || values.length < 2) return null

  const max = Math.max(...values, 1)
  const step = WIDTH / (values.length - 1)
  const points = values.map((v, i) => [i * step, HEIGHT - 2 - (v / max) * (HEIGHT - 4)])
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-8 w-20" aria-hidden="true">
      <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} className="fill-blue-100" />
      <path d={line} className="fill-none stroke-blue-500" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export default function KpiCard({ title, value, subtitle, highlight = false, trend }) {
  if (highlight) {
    return (
      <div className="flex flex-col justify-between rounded-xl bg-blue-300/70 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug text-slate-800">{title}</p>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-700">
            <AlertTriangle size={18} />
          </span>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-semibold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-700">{subtitle}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-slate-600">{title}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <LineChart size={16} />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <Sparkline values={trend} />
      </div>
    </div>
  )
}
