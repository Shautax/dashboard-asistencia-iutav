import axiosClient from '../api/axiosClient'

export { getErrorMessage } from '../api/errors'

// true si el sistema ya está "sellado" (existe al menos un coordinador master)
export async function checkMaster() {
  const { data } = await axiosClient.get('/auth/check-master')
  return Boolean(data.hasMaster)
}

// Registro del panel: sin master + código de instalación válido crea el primer master;
// en cualquier otro caso la cuenta queda como coordinador de carrera pendiente
export async function registrarEnPanel({ nombre, correo, password, codigoInstalacion }) {
  const { data } = await axiosClient.post('/auth/registro', {
    nombre,
    correo,
    password,
    ...(codigoInstalacion ? { codigo_autorizacion: codigoInstalacion } : {}),
  })
  return data.usuario
}
