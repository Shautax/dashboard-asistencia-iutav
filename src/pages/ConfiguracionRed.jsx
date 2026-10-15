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

// IPv4 exacta o rango CIDR (ej. 192.168.43.0/24): cada teléfono recibe su propia IP en la red,
// así que lo normal es permitir el rango completo de la red Wi-Fi del instituto
const IPV4_REGEX =
  /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\/(3[0-2]|[12]?\d))?$/
// Un SSID admite como máximo 32 bytes (no caracteres: una "ñ" ocupa 2)
const MAX_BYTES_SSID = 32

// Las claves coinciden con las que espera PUT /api/configuracion/red
const emptyForm = { ssid_permitido: '', ip_permitida: '' }

function validar({ ssid_permitido, ip_permitida }) {
  const errors = {}
  if (!ssid_permitido.trim()) errors.ssid_permitido = 'El nombre de la red es obligatorio.'
  else if (new TextEncoder().encode(ssid_permitido.trim()).length > MAX_BYTES_SSID) {
    errors.ssid_permitido = `El SSID no puede superar ${MAX_BYTES_SSID} bytes.`
  }

  if (!ip_permitida.trim()) errors.ip_permitida = 'La dirección IP es obligatoria.'
  else if (!IPV4_REGEX.test(ip_permitida.trim())) errors.ip_permitida = 'Ingresa una IPv4 o un rango CIDR válido (ej. 192.168.43.0/24).'

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
      const payload = { ssid_permitido: form.ssid_permitido.trim(), ip_permitida: form.ip_permitida.trim() }
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

  const isDirty = form.ssid_permitido !== initial.ssid_permitido || form.ip_permitida !== initial.ip_permitida

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
              id="ssid_permitido"
              label="Nombre de la Red (SSID)"
              icon={Wifi}
              placeholder="Ej. TECAV-Estudiantes"
              hint="Debe coincidir exactamente con el nombre de la red Wi-Fi (distingue mayúsculas)."
              value={form.ssid_permitido}
              onChange={handleChange}
              error={fieldErrors.ssid_permitido}
              disabled={saving}
              autoComplete="off"
              maxLength={32}
            />

            <Field
              id="ip_permitida"
              label="Dirección IP Permitida"
              icon={Globe}
              placeholder="Ej. 192.168.43.0/24"
              hint="Rango de la red Wi-Fi (ej. 192.168.43.0/24 cubre a todos los teléfonos conectados) o una IPv4 exacta."
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
