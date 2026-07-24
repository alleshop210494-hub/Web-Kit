import React from 'react'
import { Package, Layers, TrendingUp, AlertTriangle, XCircle, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const OverviewTab = ({
  items = [],
  transactions = [],
  suppliers = [],
  totalItemsCount = 0,
  totalValuation = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
  uniqueCategories = []
}) => {
  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{totalItemsCount}</h3>
            <p className="text-xs text-slate-400">Jenis barang di gudang</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valuasi Aset</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Rp {totalValuation.toLocaleString('id-ID')}
            </h3>
            <p className="text-xs text-slate-400">Total nilai inventori</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis</p>
            <h3 className="text-2xl font-extrabold text-amber-600">{lowStockCount}</h3>
            <p className="text-xs text-slate-400">Stok kurang dari 2 unit</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Habis</p>
            <h3 className="text-2xl font-extrabold text-rose-600">{outOfStockCount}</h3>
            <p className="text-xs text-slate-400">Stok 0 unit</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Transactions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Mutasi & Transaksi Terbaru
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} Total Riwayat</span>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat transaksi mutasi stok.</p>
            ) : (
              transactions.slice(0, 5).map((tx, idx) => {
                const txType = (tx?.type || '').toUpperCase()
                const isMasuk = txType === 'MASUK'
                const isOpname = txType === 'OPNAME'

                return (
                  <div key={tx.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isMasuk ? 'bg-emerald-100 text-emerald-700' : isOpname ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isMasuk ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm">{tx.item_title || 'Barang Tanpa Nama'}</p>
                        <p className="text-xs text-slate-500">{tx.notes || '-'} • {tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${isMasuk ? 'bg-emerald-100 text-emerald-800' : isOpname ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
                        {txType || 'MUTASI'} {tx.qty}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Category & Supplier Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Kategori & Supplier
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Distribusi Kategori</p>
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {uniqueCategories.filter(c => c !== 'Semua').length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada kategori terdaftar.</p>
                ) : (
                  uniqueCategories.filter(c => c !== 'Semua').map((cat, idx) => {
                    const count = items.filter(i => i.category === cat).length
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 px-3 py-2 rounded-lg">
                        <span className="font-medium text-slate-700">{cat}</span>
                        <span className="font-bold text-indigo-600">{count} Produk</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Vendor Supplier Aktif</p>
              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center">
                <span className="text-xs font-medium text-indigo-900">Total Supplier Mitra</span>
                <span className="text-sm font-extrabold text-indigo-700">{suppliers.length} Vendor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}