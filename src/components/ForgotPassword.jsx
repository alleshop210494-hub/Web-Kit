import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

export const ForgotPasswordComponent = () => {
  const [email, setEmail] = useState('alleshop210494@gmail.com')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password', // Sesuaikan dengan URL halaman update password Anda
    })

    if (resetError) {
      setError('Gagal mengirim tautan: ' + resetError.message)
    } else {
      setMessage('Tautan reset password berhasil dikirim ke ' + email)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-slate-100 space-y-4">
      <div className="flex items-center space-x-2 border-b pb-3">
        <Mail className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Kirim Reset Password Customer</h3>
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

      <form onSubmit={handleResetPassword} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Customer</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all"
        >
          {loading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Password'}
        </button>
      </form>
    </div>
  )
}