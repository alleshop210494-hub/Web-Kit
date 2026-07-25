import React from 'react'
import { BrowserRouter, useLocation, Link, useNavigate } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { supabase } from './services/supabase'

function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // Daftar halaman di mana Navbar TIDAK BOLEH dimunculkan
  const authPages = ['/', '/login', '/signup', '/register', '/update-password']
  const isAuthPage = authPages.includes(location.pathname)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar hanya akan tampil jika bukan halaman autentikasi/reset */}
      {!isAuthPage && (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="font-bold text-lg text-indigo-600">WebKit Pro</div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Keluar
            </button>
          </div>
        </nav>
      )}
      
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MainLayout />
    </BrowserRouter>
  )
}