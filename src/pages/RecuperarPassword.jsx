import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AuthLayout, { authLinkClass } from '../components/auth/AuthLayout'

// El sistema no envía correos todavía: por seguridad, el restablecimiento lo hace el Coordinador Master
export default function RecuperarPassword() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      footer={
        <p>
          <Link to="/login" className={authLinkClass}>
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck size={22} />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">
          Por seguridad, las contraseñas del panel administrativo las restablece el{' '}
          <span className="font-medium text-slate-800">Coordinador Master</span>. Contáctalo indicando
          el correo con el que te registraste y te asignará una contraseña temporal.
        </p>
      </div>
    </AuthLayout>
  )
}
