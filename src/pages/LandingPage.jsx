import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  History,
  Mail,
  Menu,
  Smartphone,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import Modal from '../components/common/Modal'
import ParticleSphere from '../components/landing/ParticleSphere'
import { PANEL_PATH, getSessionUser, isAllowedRole } from '../auth/session'

// ── Contenido editable ────────────────────────────────────────────────────────
// Cambia estos datos sin tocar el diseño.

const CONTACTO = {
  soporte: 'soporte@iutav.edu.ve',
  controlEstudios: 'controldeestudios@iutav.edu.ve',
}

// fecha: texto libre (ej. '15 Nov 2026'); null muestra "Por confirmar"
const FECHAS_IMPORTANTES = [
  { evento: 'Cierre del 1er Corte', detalle: 'Último día para justificar inasistencias del corte', fecha: null },
  { evento: 'Semana de Exámenes', detalle: 'Evaluaciones parciales de todas las carreras', fecha: null },
  { evento: 'Cierre del 2do Corte', detalle: 'Consolidación de asistencias del semestre', fecha: null },
]

const FAQ = [
  {
    pregunta: '¿Cómo solicito mi acceso si soy nuevo ingreso?',
    respuesta:
      'Los estudiantes se registran desde la app móvil eligiendo su carrera y semestre. Los profesores reciben su cuenta de la coordinación de su carrera. Si eres coordinador, usa "Solicitar acceso como Coordinador" en la pantalla de inicio de sesión: tu cuenta se activa cuando el Coordinador Master la aprueba.',
  },
  {
    pregunta: '¿Dónde entrego mis justificativos médicos?',
    respuesta:
      'Desde la app: abre la inasistencia, escribe el motivo y adjunta el soporte (foto JPG/PNG o PDF de hasta 5 MB). Tu profesor lo revisa; si lo aprueba, la falta queda justificada y deja de contar en tu récord.',
  },
  {
    pregunta: '¿A qué departamento acudir si mis materias no aparecen?',
    respuesta:
      'Solo ves las materias de tu carrera y semestre registrados, y algunas cierran la inscripción cuando el profesor completa la lista. Si tus datos son correctos y la materia no aparece, acude a Control de Estudios o al coordinador de tu carrera.',
  },
]

const CARACTERISTICAS = [
  { icon: Zap, titulo: 'Rápido y Seguro', texto: 'Carga de asistencia en segundos con código QR, validada desde la red Wi-Fi del instituto.' },
  { icon: History, titulo: 'Historial Detallado', texto: 'Consulta de inasistencias acumuladas por materia, con presentes, ausencias y justificadas.' },
  { icon: BellRing, titulo: 'Alertas de Riesgo', texto: 'Notificaciones de materias en riesgo cuando te acercas al límite de faltas.' },
  { icon: Smartphone, titulo: 'Multiplataforma', texto: 'Diseño adaptado para usarse desde el teléfono en el salón de clases.' },
]

const COMUNIDAD = [
  {
    icon: GraduationCap,
    titulo: 'Para Estudiantes',
    texto: 'Revisa tu récord de asistencia, mantén el control de tus materias y evita riesgos académicos.',
    puntos: ['Marca tu asistencia escaneando el QR de la clase', 'Envía justificativos desde la app', 'Recibe avisos antes de llegar al límite'],
  },
  {
    icon: UserRound,
    titulo: 'Para Profesores',
    texto: 'Agiliza el pase de lista diario y automatiza el cálculo de porcentajes a final de semestre.',
    puntos: ['Genera el QR de la clase en un toque', 'Las ausencias se registran solas al cerrar la clase', 'Aprueba o rechaza justificativos en línea'],
  },
]

const NAV = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#comunidad', label: 'Comunidad' },
  { href: '#avisos', label: 'Avisos y FAQ' },
]

// ── Piezas de estilo ──────────────────────────────────────────────────────────

const glassCard =
  'rounded-2xl border border-ember/25 bg-gradient-to-br from-white/[0.07] to-white/[0.01] shadow-[0_0_40px_-14px_rgba(242,104,28,0.45)] backdrop-blur-md'

const ctaPrimario =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_-4px_rgba(242,104,28,0.7)] transition hover:bg-ember-light focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-light focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]'

function Etiqueta({ children }) {
  return (
    <span className="inline-block rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-xs font-medium text-ember-light">
      {children}
    </span>
  )
}

function Logo() {
  return (
    <a href="#inicio" className="flex items-center gap-2.5">
      <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
      <span className="text-[13px] font-semibold leading-tight text-white">
        Tecnológico
        <br />
        Américo Vespucio
      </span>
    </a>
  )
}

function PreguntaFrecuente({ pregunta, respuesta, abierta, onToggle, id }) {
  return (
    <div className={`${glassCard} overflow-hidden`}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={abierta}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-white/[0.03]"
        >
          {pregunta}
          <ChevronDown
            size={18}
            className={`shrink-0 text-ember-light transition-transform duration-300 ${abierta ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ${abierta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{respuesta}</p>
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const user = getSessionUser()
  const conSesion = Boolean(user && isAllowedRole(user.rol))
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [conFondo, setConFondo] = useState(false)
  const [faqAbierta, setFaqAbierta] = useState(0)
  const [modal, setModal] = useState(null) // 'recuperar' | 'privacidad' | null
  const cerrarModal = useCallback(() => setModal(null), [])

  // La barra superior se vuelve opaca al hacer scroll
  useEffect(() => {
    const onScroll = () => setConFondo(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const botonAcceso = conSesion ? (
    <Link to={PANEL_PATH} className={ctaPrimario}>
      Ir al panel
      <ArrowRight size={16} />
    </Link>
  ) : (
    <Link to="/login" className={ctaPrimario}>
      Iniciar Sesión
      <ArrowRight size={16} />
    </Link>
  )

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0b0d] text-white antialiased">
      {/* Barra superior */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          conFondo || menuAbierto ? 'border-b border-white/5 bg-[#0b0b0d]/85 backdrop-blur-lg' : ''
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ul className="hidden items-center gap-7 text-[13px] text-white/60 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition hover:text-ember-light">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link
              to={conSesion ? PANEL_PATH : '/login'}
              className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-medium transition hover:border-ember/60 hover:text-ember-light sm:inline-block"
            >
              {conSesion ? 'Ir al panel' : 'Iniciar Sesión'}
            </Link>
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/5 md:hidden"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        {menuAbierto && (
          <ul className="space-y-1 border-t border-white/5 px-4 pb-4 pt-2 md:hidden">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Link to={conSesion ? PANEL_PATH : '/login'} className={`${ctaPrimario} w-full`}>
                {conSesion ? 'Ir al panel' : 'Iniciar Sesión'}
              </Link>
            </li>
          </ul>
        )}
      </header>

      <main>
        {/* 1. Hero */}
        <section id="inicio" className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:pb-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-ember/25 blur-[120px] motion-safe:animate-drift" />
            <div className="absolute -right-32 top-24 h-[28rem] w-[28rem] rounded-full bg-ember-dark/20 blur-[120px] motion-safe:animate-drift-slow" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Portal de Gestión de <span className="text-ember">Asistencia</span>
                <span className="mt-3 block text-lg font-semibold tracking-normal text-white/70 sm:text-xl">
                  <span className="sr-only">- </span>Tecnológico Américo Vespucio
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0">
                Control y seguimiento académico en tiempo real para la comunidad estudiantil y docente.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4 lg:items-start">
                {botonAcceso}
                {/* Descarga del APK: solo visible en móviles */}
                <a
                  href="/app-asistencia.apk"
                  download="Asistencia-IUTAV.apk"
                  type="application/vnd.android.package-archive"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#3DDC84] px-6 py-3 text-sm font-bold text-[#0b0b0d] shadow-[0_0_28px_-4px_rgba(61,220,132,0.7)] transition hover:bg-[#5ae69a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3DDC84] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d] md:hidden"
                >
                  <Download size={18} strokeWidth={2.5} />
                  Descargar App (Android)
                </a>
                <button
                  type="button"
                  onClick={() => setModal('recuperar')}
                  className="text-sm text-white/50 underline-offset-4 transition hover:text-ember-light hover:underline"
                >
                  ¿Problemas para ingresar?
                </button>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-md lg:max-w-none">
              <div className="absolute inset-[18%] rounded-full bg-ember/20 blur-3xl" aria-hidden="true" />
              <ParticleSphere className="relative h-full w-full motion-safe:animate-float" />
            </div>
          </div>
        </section>

        {/* 2. Características */}
        <section id="caracteristicas" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Etiqueta>Funcionalidades</Etiqueta>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Optimiza el control diario</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CARACTERISTICAS.map(({ icon: Icon, titulo, texto }) => (
                <article key={titulo} className={`${glassCard} p-6 transition duration-300 hover:-translate-y-1 hover:border-ember/50`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ember/30 bg-ember/10 text-ember-light">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Comunidad */}
        <section id="comunidad" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Etiqueta>Comunidad</Etiqueta>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Una herramienta para cada rol</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {COMUNIDAD.map(({ icon: Icon, titulo, texto, puntos }, i) => (
                <article
                  key={titulo}
                  className={
                    i === 0
                      ? 'rounded-2xl bg-gradient-to-br from-ember to-ember-dark p-7 shadow-[0_0_60px_-18px_rgba(242,104,28,0.8)] sm:p-8'
                      : `${glassCard} p-7 sm:p-8`
                  }
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${i === 0 ? 'bg-white/20 text-white' : 'border border-ember/30 bg-ember/10 text-ember-light'}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-2xl font-bold">{titulo}</h3>
                  <p className={`mt-3 leading-relaxed ${i === 0 ? 'text-white/90' : 'text-white/60'}`}>{texto}</p>
                  <ul className="mt-6 space-y-2.5">
                    {puntos.map((p) => (
                      <li key={p} className={`flex items-start gap-2.5 text-sm ${i === 0 ? 'text-white/90' : 'text-white/60'}`}>
                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${i === 0 ? 'text-white' : 'text-ember-light'}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Avisos y FAQ */}
        <section id="avisos" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Etiqueta>Avisos</Etiqueta>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Fechas importantes</h2>
              <ol className={`${glassCard} mt-8 divide-y divide-white/5`}>
                {FECHAS_IMPORTANTES.map(({ evento, detalle, fecha }) => (
                  <li key={evento} className="flex items-start gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember/15 text-ember-light">
                      <CalendarDays size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="font-semibold">{evento}</p>
                        <span className={`text-xs font-medium ${fecha ? 'text-ember-light' : 'text-white/40'}`}>
                          {fecha ?? 'Por confirmar'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/50">{detalle}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <Etiqueta>Ayuda</Etiqueta>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
              <div className="mt-8 space-y-3">
                {FAQ.map((item, i) => (
                  <PreguntaFrecuente
                    key={item.pregunta}
                    id={`faq-${i}`}
                    {...item}
                    abierta={faqAbierta === i}
                    onToggle={() => setFaqAbierta((actual) => (actual === i ? null : i))}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="relative mt-10 overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#120d0a] to-[#0b0b0d] px-4 pt-14 sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-ember/15 blur-[110px]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Sistema de control de asistencia y justificativos para estudiantes y docentes.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/55">
              <li>
                <p className="text-white/35">Soporte técnico</p>
                <a href={`mailto:${CONTACTO.soporte}`} className="inline-flex items-center gap-2 break-all transition hover:text-ember-light">
                  <Mail size={14} className="shrink-0" />
                  {CONTACTO.soporte}
                </a>
              </li>
              <li>
                <p className="text-white/35">Control de Estudios</p>
                <a href={`mailto:${CONTACTO.controlEstudios}`} className="inline-flex items-center gap-2 break-all transition hover:text-ember-light">
                  <Mail size={14} className="shrink-0" />
                  {CONTACTO.controlEstudios}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Accesos</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/55">
              <li>
                <Link to={conSesion ? PANEL_PATH : '/login'} className="transition hover:text-ember-light">
                  Panel de coordinación
                </Link>
              </li>
              <li>
                <Link to="/registro" className="transition hover:text-ember-light">
                  Solicitar acceso como Coordinador
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => setModal('recuperar')} className="transition hover:text-ember-light">
                  ¿Problemas para ingresar?
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="relative mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-xs text-white/40 sm:flex-row">
          <p>
            © 2026 Tecnológico Américo Vespucio -{' '}
            <button type="button" onClick={() => setModal('privacidad')} className="underline-offset-4 transition hover:text-ember-light hover:underline">
              Políticas de Privacidad
            </button>
          </p>
          <BookOpenCheck size={18} className="text-ember/70" aria-hidden="true" />
        </div>
      </footer>

      <Modal isOpen={modal === 'recuperar'} onClose={cerrarModal} title="¿Problemas para ingresar?" maxWidth="max-w-md">
        <div className="space-y-4 p-6 text-[13px] leading-relaxed text-fg-muted">
          <p>
            <span className="font-medium text-fg">Estudiantes y profesores:</span> escribe a Control de Estudios desde tu
            correo registrado indicando tu nombre y cédula.
          </p>
          <p>
            <span className="font-medium text-fg">Coordinadores:</span> el Coordinador Master restablece tu contraseña y te
            asigna una temporal. Si tu solicitud de acceso sigue pendiente, debe aprobarla primero.
          </p>
          <div className="space-y-2 rounded-xl border border-line bg-surface-input p-4">
            <a href={`mailto:${CONTACTO.controlEstudios}`} className="flex items-center gap-2 text-fg hover:text-ember-light">
              <Mail size={14} /> {CONTACTO.controlEstudios}
            </a>
            <a href={`mailto:${CONTACTO.soporte}`} className="flex items-center gap-2 text-fg hover:text-ember-light">
              <Mail size={14} /> {CONTACTO.soporte}
            </a>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'privacidad'} onClose={cerrarModal} title="Políticas de Privacidad" maxWidth="max-w-lg">
        <div className="space-y-3 p-6 text-[13px] leading-relaxed text-fg-muted">
          <p>
            El sistema guarda solo los datos necesarios para el control de asistencia: nombre, cédula, correo, carrera,
            semestre, registros de asistencia y los justificativos que envías con su soporte.
          </p>
          <p>
            Para validar una asistencia se compara el nombre de la red Wi-Fi y la IP reportados por la app con la red del
            instituto; no se guarda tu ubicación.
          </p>
          <p>
            Tus datos solo los consultan tus profesores y la coordinación académica, y no se comparten con terceros. Para
            corregirlos o eliminarlos, escribe a Control de Estudios.
          </p>
        </div>
      </Modal>
    </div>
  )
}
