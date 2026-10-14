// Título de sección con insignia de icono y descripción tenue
export default function SectionHeader({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface-card text-fg-muted">
            <Icon size={15} />
          </span>
        )}
        <h2 className="text-base font-semibold text-fg">{title}</h2>
        {description && <p className="text-[12.5px] text-fg-dim sm:ml-2">{description}</p>}
      </div>
      {action}
    </div>
  )
}
