import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    // Jika user mencoba masuk dashboard tapi sedang dalam proses reset password, cegah!
    const isResetting = sessionStorage.getItem('isResettingPassword')
    if (isResetting === 'true') {
      navigate('/update-password')
    }
  }, [navigate])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Selamat Datang di Dashboard Inventori</h1>
        <p className="text-slate-500 text-sm mt-1">Anda berhasil masuk ke sistem utama.</p>
      </div>
    </div>
  )
}

export default Dashboard