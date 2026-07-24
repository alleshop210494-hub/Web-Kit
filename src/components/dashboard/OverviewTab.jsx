import React, { useState } from 'react'
import { Package, TrendingUp, AlertTriangle, AlertCircle, BarChart2 } from 'lucide-react'

export const OverviewTab = ({ items, suppliers, totalItemsCount, totalValuation, lowStockCount, outOfStockCount, uniqueCategories, userRole }) => {
  const [hoveredCat, setHoveredCat] = useState(null)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Jenis Produk</p>
            <p className="text-2xl font-bold text-slate-900">{totalItemsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valuasi Aset Gudang</p>
            <p className="text-lg font-bold text-emerald-600">
              Rp {totalValuation.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis (&lt; 2)</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {lowStockCount} Item
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Habis (0)</p>
            <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {outOfStockCount} Item
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${outOfStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Distribusi Kategori Interaktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Grafik Visual Distribusi Kategori</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">Interaktif</span>
          </div>
          
          <div className="space-y-3 pt-2">
            {uniqueCategories.filter(c => c !== 'Semua').map((cat, idx) => {
              const count = items.filter(i => i.category === cat).length
              const percentage = totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0
              const isHovered = hoveredCat === cat

              return (
                <div 
                  key={idx} 
                  className={`space-y-1 p-2 rounded-xl transition-all cursor-pointer ${isHovered ? 'bg-indigo-50/70 scale-[1.01]' : 'hover:bg-slate-50'}`}
                  onMouseEnter={() => setHoveredCat(cat)}
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-indigo-600 font-bold">{count} Produk ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Aktivitas Sesi & Autentikasi</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-medium text-slate-700">Status Database Supabase</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">Terhubung (Realtime)</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-medium text-slate-700">Level Akses Akun</span>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-md">{userRole.toUpperCase()}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="font-medium text-slate-700">Total Supplier Terdaftar</span>
              <span className="font-bold text-slate-900">{suppliers.length} Vendor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}