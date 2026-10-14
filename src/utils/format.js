// 30123456 -> V-30.123.456 (los coordinadores que solicitan acceso no tienen cédula)
export const formatCedula = (cedula) => (cedula ? `V-${Number(cedula).toLocaleString('es-VE')}` : '—')
