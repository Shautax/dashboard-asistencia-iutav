import PageHeader from './PageHeader'

export default function PagePlaceholder({ icon, title, description }) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} subtitle={description} icon={icon} />
      <div className="card border-dashed p-12 text-center text-[13px] text-fg-dim">Módulo en construcción</div>
    </div>
  )
}
