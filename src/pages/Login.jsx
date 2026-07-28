import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Lock, Mail, AlertCircle, CheckCircle, LogIn, ArrowLeft, KeyRound } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State mode tampilan: 'login', 'forgot', atau 'update_password'
  const [viewMode, setViewMode] = useState('login')

  // Mendengarkan event dari Supabase jika user mengklik link reset password dari email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setViewMode('update_password')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handler untuk Login Normal
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      setSuccess('Login berhasil! Mengalihkan ke dashboard...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)

    } catch (err) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  // Handler untuk Kirim Tautan Lupa Password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) throw error

      setSuccess('Tautan reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.')
    } catch (err) {
      setError(err.message || 'Gagal mengirim tautan reset password.')
    } finally {
      setLoading(false)
    }
  }

  // Handler untuk Menyimpan Password Baru
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error

      setSuccess('Password berhasil diperbarui! Mengalihkan ke dashboard...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Gagal memperbarui password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl border border-slate-200 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-2">
            {viewMode === 'update_password' ? <KeyRound className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {viewMode === 'forgot' && 'Reset Password'}
            {viewMode === 'update_password' && 'Buat Password Baru'}
            {viewMode === 'login' && 'Login ke Sistem'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {viewMode === 'forgot' && 'Masukkan email Anda untuk menerima tautan pemulihan kata sandi'}
            {viewMode === 'update_password' && 'Silakan masukkan kata sandi baru untuk akun Anda'}
            {viewMode === 'login' && 'Silakan masuk menggunakan akun Anda'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tampilan 1: Form Login */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot')
                    setError('')
                    setSuccess('')
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        )}

        {/* Tampilan 2: Form Lupa Password (Kirim Email) */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Terdaftar</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login')
                  setError('')
                  setSuccess('')
                }}
                className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-indigo-600"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke halaman login</span>
              </button>
            </div>
          </form>
        )}

        {/* Tampilan 3: Form Masukkan Password Baru (Setelah klik link email) */}
        {viewMode === 'update_password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        {/* Link ke Halaman Register / Daftar */}
        {viewMode === 'login' && (
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1">
                Daftar sekarang
              </Link>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}