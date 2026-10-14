export default function PagePlaceholder({ icon: Icon, title, description }) {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Icon size={20} />
          </span>
          <div>
            <h2 className="text-lg font-medium text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Módulo en construcción
        </div>
      </section>
    </div>
  )
}
