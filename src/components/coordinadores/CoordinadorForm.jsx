import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { ROLES } from '../../auth/session'

const initialForm = {
  nombre: '',
  cedula: '',
  correo: '',
  password: '',
  rol: ROLES.CARRERA,
  carrera_id: '',
}

const roleOptions = [
  {
    value: ROLES.CARRERA,
    label: 'Coordinador de Carrera',
    description: 'Gestiona una sola carrera.',
  },
  {
    value: ROLES.MASTER,
    label: 'Coordinador Master',
    description: 'Acceso total, puede crear coordinadores.',
  },
]

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export default function CoordinadorForm({ carreras, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      carrera_id: form.rol === ROLES.CARRERA ? Number(form.carrera_id) : null,
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo">
          <input
            required
            value={form.nombre}
            onChange={update('nombre')}
            className={inputClass}
            placeholder="Ej. María Pérez"
          />
        </Field>
        <Field label="Cédula">
          <input
            required
            inputMode="numeric"
            pattern="\d+"
            title="Solo números, sin puntos ni letras"
            value={form.cedula}
            onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value.replace(/\D/g, '') }))}
            className={inputClass}
            placeholder="Ej. 30123456"
          />
        </Field>
        <Field label="Correo electrónico">
          <input
            required
            type="email"
            value={form.correo}
            onChange={update('correo')}
            className={inputClass}
            placeholder="nombre@iutav.edu"
          />
        </Field>
        <Field label="Contraseña">
          <div className="relative">
            <input
              required
              minLength={6}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              className={`${inputClass} pr-10`}
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">Tipo de coordinador</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 rounded-lg border-2 p-3 transition-colors ${
                form.rol === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="rol"
                value={option.value}
                checked={form.rol === option.value}
                onChange={update('rol')}
                className="mt-1 accent-blue-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">{option.label}</span>
                <span className="block text-xs text-slate-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {form.rol === ROLES.CARRERA && (
        <Field label="Carrera asignada">
          <select
            required
            value={form.carrera_id}
            onChange={update('carrera_id')}
            className={inputClass}
          >
            <option value="" disabled>
              {carreras.length ? 'Selecciona una carrera' : 'No hay carreras registradas'}
            </option>
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.codigo})
              </option>
            ))}
          </select>
        </Field>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Guardando...' : 'Crear coordinador'}
        </button>
      </div>
    </form>
  )
}
