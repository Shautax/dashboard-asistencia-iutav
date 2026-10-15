import { useCallback, useEffect, useState } from 'react'
import { Compass, Crosshair, Loader2, MapPin, ShieldCheck } from 'lucide-react'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import Toast from '../components/common/Toast'
import PageHeader from '../components/common/PageHeader'
import {
  actualizarConfiguracionRed,
  getConfiguracionRed,
  getErrorMessage,
} from '../services/configuracionService'

// Las claves coinciden con las que espera PUT /api/configuracion/red
const emptyForm = { latitud: '', longitud: '', radio_permitido: '50' }

const esNumero = (v) => v.trim() !== '' && Number.isFinite(Number(v))

function validar({ latitud, longitud, radio_permitido }) {
  const errors = {}
  if (!latitud.trim()) errors.latitud = 'La latitud es obligatoria.'
  else if (!esNumero(latitud) || Math.abs(Number(latitud)) > 90) {
    errors.latitud = 'Ingresa una latitud válida entre -90 y 90.'
  }

  if (!longitud.trim()) errors.longitud = 'La longitud es obligatoria.'
  else if (!esNumero(longitud) || Math.abs(Number(longitud)) > 180) {
    errors.longitud = 'Ingresa una longitud válida entre -180 y 180.'
  }

  if (!radio_permitido.trim()) errors.radio_permitido = 'El radio es obligatorio.'
  else if (!esNumero(radio_permitido) || Number(radio_permitido) <= 0) {
    errors.radio_permitido = 'El radio debe ser un número mayor a 0 (en metros).'
  }

  return errors
}

function Field({ id, label, icon: Icon, hint, error, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim"
        />
        <input
          id={id}
          name={id}
          className={`input py-2.5 pl-10 ${
            error
              ? 'border-rose-500/50 focus:border-rose-500/60 focus:ring-rose-500/15'
              : 'border-line focus:border-line-focus focus:ring-accent/15'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
          {...inputProps}
        />
      </div>
      <p id={`${id}-help`} className={`text-xs ${error ? 'text-rose-400' : 'text-fg-dim'}`}>
        {error || hint}
      </p>
    </div>
  )
}

export default function ConfiguracionRed() {
  const [form, setForm] = useState(emptyForm)
  const [initial, setInitial] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const cfg = await getConfiguracionRed()
      setForm(cfg)
      setInitial(cfg)
    } catch (err) {
      setLoadError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const closeToast = useCallback(() => setToast(''), [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')

    const errors = validar(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSaving(true)
    try {
      const guardado = await actualizarConfiguracionRed(form)
      setForm(guardado)
      setInitial(guardado)
      setToast('Geocerca guardada correctamente.')
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const isDirty =
    form.latitud !== initial.latitud ||
    form.longitud !== initial.longitud ||
    form.radio_permitido !== initial.radio_permitido

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Seguridad de Red"
        subtitle="Solo se aceptarán asistencias dentro de esta zona del instituto"
        icon={ShieldCheck}
      />

      <section className="card p-6 sm:p-8">
        {loading ? (
          <LoadingMessage>Cargando configuración...</LoadingMessage>
        ) : loadError ? (
          <ErrorMessage message={loadError} onRetry={loadData} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Field
              id="latitud"
              label="Latitud"
              icon={MapPin}
              type="number"
              step="any"
              placeholder="Ej. 10.4806"
              hint="Coordenada decimal del centro del instituto (entre -90 y 90)."
              value={form.latitud}
              onChange={handleChange}
              error={fieldErrors.latitud}
              disabled={saving}
              autoComplete="off"
            />

            <Field
              id="longitud"
              label="Longitud"
              icon={Compass}
              type="number"
              step="any"
              placeholder="Ej. -66.9036"
              hint="Coordenada decimal del centro del instituto (entre -180 y 180)."
              value={form.longitud}
              onChange={handleChange}
              error={fieldErrors.longitud}
              disabled={saving}
              autoComplete="off"
            />

            <Field
              id="radio_permitido"
              label="Radio Permitido (metros)"
              icon={Crosshair}
              type="number"
              min="1"
              step="any"
              placeholder="50"
              hint="Distancia máxima desde el centro para aceptar una asistencia."
              value={form.radio_permitido}
              onChange={handleChange}
              error={fieldErrors.radio_permitido}
              disabled={saving}
              autoComplete="off"
            />

            {saveError && <ErrorMessage message={saveError} />}

            <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
              <button
                type="button"
                onClick={() => {
                  setForm(initial)
                  setFieldErrors({})
                  setSaveError('')
                }}
                disabled={!isDirty || saving}
                className="btn-ghost"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="btn-primary"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </section>

      <Toast message={toast} onClose={closeToast} />
    </div>
  )
}
