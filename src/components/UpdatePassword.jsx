import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
        setError('Gagal memperbarui password: ' + updateError.message)
    } else {
        setMessage('Password berhasil diperbarui! Silakan gunakan password baru Anda untuk login.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 space-y-4">
      <div className="flex items-center space-x-2 border-b pb-3">
        <Lock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Perbarui Password Customer</h3>
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

      <form onSubmit={handleUpdatePassword} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password baru"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all"
        >
          {loading ? 'Memperbarui...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  )
}