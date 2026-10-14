import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-16 lg:pl-[260px]">
        <main className="mx-auto w-full max-w-[1320px] px-5 pb-20 pt-9 lg:px-11">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
