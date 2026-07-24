import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { AlertTriangle } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="text-center py-20 space-y-6">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      </div>
      <Link to="/">
        <Button variant="primary">Kembali ke Beranda</Button>
      </Link>
    </div>
  )
}