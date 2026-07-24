import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, ShieldCheck, Zap, Layers, CheckCircle2 } from 'lucide-react'

export const Home = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-16 text-white shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>Solusi Digital Profesional & Skalabel</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Platform Modern untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Kebutuhan Bisnis Anda</span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem web terintegrasi dengan performa tinggi, keamanan tingkat lanjut, dan antarmuka responsif yang dirancang khusus untuk mengoptimalkan operasional Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200"
              >
                <span>Buka Dashboard Utama</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200"
                >
                  <span>Masuk ke Sistem</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all duration-200"
                >
                  <span>Daftar Akun Baru</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Keunggulan Sistem Kami
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Dibangun dengan standar teknologi terkecuali untuk menjamin kecepatan, keamanan, dan kenyamanan pengguna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Performa Real-Time</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Sinkronisasi data otomatis seketika tanpa jeda, memastikan seluruh informasi selalu akurat di setiap perangkat.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Keamanan Terjamin</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dilindungi sistem otentikasi ketat berbasis enkripsi modern untuk menjaga privasi data dan hak akses pengguna.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Arsitektur Modular</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Struktur kode yang bersih dan terorganisir memudahkan penambahan fitur baru sesuai perkembangan kebutuhan bisnis.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Siap Memulai Pengelolaan Digital?</h3>
            <p className="text-slate-300 text-sm max-w-lg">
              Masuk sekarang untuk mengelola data operasional Anda dengan mudah melalui panel kontrol terpusat.
            </p>
          </div>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
          >
            {user ? "Buka Panel Kontrol" : "Mulai Masuk"}
          </Link>
        </div>
      </section>
    </div>
  )
}