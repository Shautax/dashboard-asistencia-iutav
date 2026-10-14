import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './auth/session'
import Login from './pages/Login'
import Registro from './pages/Registro'
import RecuperarPassword from './pages/RecuperarPassword'
import Dashboard from './pages/Dashboard'
import Alumnos from './pages/Alumnos'
import GestionDocente from './pages/GestionDocente'
import Coordinadores from './pages/Coordinadores'
import Configuracion from './pages/Configuracion'
import ConfiguracionRed from './pages/ConfiguracionRed'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alumnos" element={<Alumnos />} />
            {/* Master y coordinador de carrera; el backend limita las materias a su carrera */}
            <Route path="gestion-docente" element={<GestionDocente />} />
            <Route path="profesores" element={<Navigate to="/gestion-docente" replace />} />
            <Route path="configuracion" element={<Configuracion />} />

            {/* Solo coordinador master */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.MASTER]} />}>
              <Route path="coordinadores" element={<Coordinadores />} />
              <Route path="seguridad-red" element={<ConfiguracionRed />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
