import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  
  const navigate = useNavigate()

  // Fungsi Login Utama
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
    } else {
      navigate('/dashboard') // Berhasil login, diarahkan ke dashboard
    }
    setLoading(false)
  }

  // Fungsi Kirim Tautan Lupa Password ke Email Customer (Diperbarui dengan URL pasti)
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://sistem-inventori-mu.vercel.app/update-password',
    })

    if (resetError) {
      setError('Gagal mengirim tautan: ' + resetError.message)
    } else {
      setMessage('Tautan reset password berhasil dikirim ke ' + email + '. Silakan cek kotak masuk atau folder spam email tersebut.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">
            {isForgotPassword ? 'Reset Password' : 'Login ke Sistem'}
          </h2>
          <p className="text-sm text-slate-500">
            {isForgotPassword 
              ? 'Masukkan email customer untuk menerima tautan pemulihan' 
              : 'Silakan masuk menggunakan akun Anda'}
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notifikasi Sukses */}
        {message && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Berganti Otomatis (Login vs Lupa Password) */}
        {!isForgotPassword ? (
          // TAMPILAN FORM LOGIN BIASA
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        ) : (
          // TAMPILAN FORM LUPA PASSWORD
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Customer</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alleshop210494@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all"
            >
              {loading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600"
              >
                ← Kembali ke Halaman Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}

export default Login