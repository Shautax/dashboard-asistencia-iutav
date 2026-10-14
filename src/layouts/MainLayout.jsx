import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-16">
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
