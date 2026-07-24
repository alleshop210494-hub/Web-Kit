import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Shield, Zap, Database, GitBranch } from 'lucide-react'

export const Home = () => {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-6 max-w-3xl mx-auto py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
          Full Stack Modern <span className="text-indigo-600">Web Kit & Template</span>
        </h1>
        <p className="text-lg text-gray-600">
          Arsitektur tingkat expert siap pakai untuk React (JavaScript), Supabase Database, dan integrasi GitHub repository yang clean, scalable, dan anti-error.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/register">
            <Button variant="primary" className="text-base px-6 py-3">Mulai Sekarang</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="text-base px-6 py-3">Masuk Akun</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">React + Vite</h3>
          <p className="text-sm text-gray-500">Performa kilat dengan konfigurasi modern siap dikembangkan ke berbagai jenis web.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Supabase Ready</h3>
          <p className="text-sm text-gray-500">Autentikasi dan database real-time terintegrasi secara aman dan bersih.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Protected Routes</h3>
          <p className="text-sm text-gray-500">Sistem manajemen session dan hak akses halaman privat yang sangat aman.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">GitHub Version Control</h3>
          <p className="text-sm text-gray-500">Struktur modular memudahkan kolaborasi tim dan deployment berkelanjutan.</p>
        </div>
      </div>
    </div>
  )
}