import { useCallback, useEffect, useState } from 'react'
import { Globe, Loader2, ShieldCheck, Wifi } from 'lucide-react'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import Toast from '../components/common/Toast'
import {
  actualizarConfiguracionRed,
  getConfiguracionRed,
  getErrorMessage,
} from '../services/configuracionService'

// IPv4 con CIDR opcional (ej. 192.168.1.10 o 192.168.1.0/24)
const IPV4_REGEX =
  /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\/(3[0-2]|[12]?\d))?$/

const emptyForm = { ssid: '', ip_permitida: '' }

function validar({ ssid, ip_permitida }) {
  const errors = {}
  if (!ssid.trim()) errors.ssid = 'El nombre de la red es obligatorio.'
  else if (ssid.trim().length > 32) errors.ssid = 'El SSID no puede superar 32 caracteres.'

  if (!ip_permitida.trim()) errors.ip_permitida = 'La dirección IP es obligatoria.'
  else if (!IPV4_REGEX.test(ip_permitida.trim())) errors.ip_permitida = 'Ingresa una IPv4 válida.'

  return errors
}

function Field({ id, label, icon: Icon, hint, error, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          name={id}
          className={`w-full rounded-xl border bg-slate-50/60 py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:opacity-60 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-help`}
          {...inputProps}
        />
      </div>
      <p id={`${id}-help`} className={`text-xs ${error ? 'text-red-500' : 'text-slate-400'}`}>
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
      const payload = { ssid: form.ssid.trim(), ip_permitida: form.ip_permitida.trim() }
      await actualizarConfiguracionRed(payload)
      setForm(payload)
      setInitial(payload)
      setToast('Configuración de red guardada correctamente.')
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const isDirty = form.ssid !== initial.ssid || form.ip_permitida !== initial.ip_permitida

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <header className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Seguridad de Red</h1>
          <p className="text-sm text-slate-500">
            Solo se aceptarán asistencias desde esta red del instituto.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
        {loading ? (
          <LoadingMessage>Cargando configuración...</LoadingMessage>
        ) : loadError ? (
          <ErrorMessage message={loadError} onRetry={loadData} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Field
              id="ssid"
              label="Nombre de la Red (SSID)"
              icon={Wifi}
              placeholder="Ej. TECAV-Estudiantes"
              hint="Debe coincidir exactamente con el nombre de la red Wi-Fi (distingue mayúsculas)."
              value={form.ssid}
              onChange={handleChange}
              error={fieldErrors.ssid}
              disabled={saving}
              autoComplete="off"
              maxLength={32}
            />

            <Field
              id="ip_permitida"
              label="Dirección IP Permitida"
              icon={Globe}
              placeholder="Ej. 190.202.10.15"
              hint="IP pública de salida del instituto. Admite notación CIDR (ej. 10.0.0.0/24)."
              value={form.ip_permitida}
              onChange={handleChange}
              error={fieldErrors.ip_permitida}
              disabled={saving}
              autoComplete="off"
              inputMode="decimal"
            />

            {saveError && <ErrorMessage message={saveError} />}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => {
                  setForm(initial)
                  setFieldErrors({})
                  setSaveError('')
                }}
                disabled={!isDirty || saving}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Descartar
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
