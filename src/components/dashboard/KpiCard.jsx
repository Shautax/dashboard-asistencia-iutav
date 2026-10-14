import { AlertTriangle, LineChart } from 'lucide-react'

const WIDTH = 60
const HEIGHT = 24

// Mini gráfico de líneas con los % de inasistencia de las últimas clases
function Sparkline({ values }) {
  if (!values || values.length < 2) return null

  const max = Math.max(...values, 1)
  const step = WIDTH / (values.length - 1)
  const points = values.map((v, i) => [i * step, HEIGHT - 2 - (v / max) * (HEIGHT - 4)])
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-6 w-16" aria-hidden="true">
      <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} className="fill-accent/10" />
      <path d={line} className="fill-none stroke-accent" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// Columna KPI de la tarjeta principal (etiqueta pequeña, valor grande, subtítulo tenue)
export default function KpiCard({ title, value, subtitle, highlight = false, trend }) {
  const Icon = highlight ? AlertTriangle : LineChart
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="flex items-center gap-1.5 text-xs text-fg-muted" title={title}>
        <Icon size={13} className={`shrink-0 ${highlight ? 'text-amber-400' : ''}`} />
        <span className="truncate">{title}</span>
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="mt-0.5 text-[26px] font-semibold tracking-tight text-fg">{value}</p>
        <Sparkline values={trend} />
      </div>
      {subtitle && <p className="truncate text-xs text-fg-dim">{subtitle}</p>}
    </div>
  )
}
