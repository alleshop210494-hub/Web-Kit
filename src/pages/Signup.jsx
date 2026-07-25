import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) {
      setError(signupError.message)
    } else {
      setMessage('Registrasi berhasil! Akun Anda telah terhubung ke database. Mengalihkan ke halaman login...')
      setTimeout(() => {
        navigate('/') // Dialihkan ke halaman login setelah sukses
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h2>
          <p className="text-sm text-slate-500">Buat akun untuk mulai menggunakan aplikasi</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
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
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  )
}

export default Signup