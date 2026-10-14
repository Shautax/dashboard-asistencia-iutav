import { useCallback, useEffect, useState } from 'react'
import { Globe, Loader2, ShieldCheck, Wifi } from 'lucide-react'
import { ErrorMessage, LoadingMessage } from '../components/common/StatusMessage'
import Toast from '../components/common/Toast'
import PageHeader from '../components/common/PageHeader'
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
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Seguridad de Red"
        subtitle="Solo se aceptarán asistencias desde esta red del instituto"
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
