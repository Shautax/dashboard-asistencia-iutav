// Encabezado de vista: título grande + subtítulo en acento morado (como la referencia)
export default function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {subtitle && (
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
            {Icon && <Icon size={14} />}
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  )
}
