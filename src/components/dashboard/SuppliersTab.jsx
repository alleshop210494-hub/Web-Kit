import React from 'react'
import { Truck, Phone, MapPin, Plus } from 'lucide-react'

export const SuppliersTab = ({ suppliers, userRole, setIsSupplierModalOpen }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Supplier & Vendor Resmi</h2>
          <p className="text-sm text-slate-500">Kelola daftar rekanan pemasok barang dan inventori gudang Anda</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Supplier</span>
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div key={sup.id} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{sup.name}</h3>
                <span className="text-xs text-indigo-600 font-medium">Vendor Aktif</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{sup.phone || '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{sup.address || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}