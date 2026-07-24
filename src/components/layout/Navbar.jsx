import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, LayoutDashboard, Home } from 'lucide-react'

export const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Gagal keluar:', error.message)
    }
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-slate-900 tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span>WebKit Pro</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/25 transition-all"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}