import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
    </div>
  )
}
