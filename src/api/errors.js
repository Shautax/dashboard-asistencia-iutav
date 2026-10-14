// Mensaje legible a partir de un error de Axios
export const getErrorMessage = (error) =>
  error.response?.data?.message ??
  (error.request && !error.response ? 'No se pudo conectar con el servidor.' : error.message)
