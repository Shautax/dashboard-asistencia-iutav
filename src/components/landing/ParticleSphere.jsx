import { useEffect, useRef } from 'react'

const PUNTOS = 900
const GIRO_POR_FRAME = 0.0025
const INCLINACION = 0.45

// Puntos repartidos de forma uniforme sobre una esfera (espiral de Fibonacci)
const esfera = Array.from({ length: PUNTOS }, (_, i) => {
  const y = 1 - (i / (PUNTOS - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const theta = Math.PI * (3 - Math.sqrt(5)) * i
  return [Math.cos(theta) * r, y, Math.sin(theta) * r]
})

// Esfera de partículas naranjas que gira lentamente (decorativa).
// Con "reducir movimiento" activado en el sistema se dibuja una sola vez, quieta.
export default function ParticleSphere({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const quieta = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let angulo = 0
    let frame = 0

    const ajustarTamano = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const dibujar = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const radio = Math.min(width, height) * 0.42
      const cx = width / 2
      const cy = height / 2
      const [sinA, cosA] = [Math.sin(angulo), Math.cos(angulo)]
      const [sinT, cosT] = [Math.sin(INCLINACION), Math.cos(INCLINACION)]

      ctx.clearRect(0, 0, width, height)
      for (const [x, y, z] of esfera) {
        // Giro sobre el eje Y y luego inclinación sobre el eje X
        const x1 = x * cosA - z * sinA
        const z1 = x * sinA + z * cosA
        const y2 = y * cosT - z1 * sinT
        const z2 = y * sinT + z1 * cosT
        const profundidad = (z2 + 1) / 2 // 0 = atrás, 1 = adelante
        ctx.globalAlpha = 0.12 + profundidad * 0.88
        ctx.fillStyle = profundidad > 0.55 ? '#ff8a3d' : '#f2681c'
        ctx.beginPath()
        ctx.arc(cx + x1 * radio, cy + y2 * radio, 0.6 + profundidad * 1.3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const animar = () => {
      angulo += GIRO_POR_FRAME
      dibujar()
      frame = requestAnimationFrame(animar)
    }

    const alRedimensionar = () => {
      ajustarTamano()
      dibujar()
    }

    ajustarTamano()
    if (quieta) dibujar()
    else animar()
    window.addEventListener('resize', alRedimensionar)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', alRedimensionar)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
