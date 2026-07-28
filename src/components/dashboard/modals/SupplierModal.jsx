import React from 'react'
import { X } from 'lucide-react'

export const SupplierModal = ({
  isSupplierModalOpen,
  setIsSupplierModalOpen,
  handleAddSupplier,
  supNameInput,
  setSupNameInput,
  supPhoneInput,
  setSupPhoneInput,
  supAddrInput,
  setSupAddrInput
}) => {
  if (!isSupplierModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">Tambah Supplier Baru</h3>
          <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Supplier</label>
            <input
              type="text"
              required
              value={supNameInput}
              onChange={(e) => setSupNameInput(e.target.value)}
              placeholder="PT Sumber Jaya"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              value={supPhoneInput}
              onChange={(e) => setSupPhoneInput(e.target.value)}
              placeholder="08123456789"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
            <input
              type="text"
              value={supAddrInput}
              onChange={(e) => setSupAddrInput(e.target.value)}
              placeholder="Jl. Ahmad Yani No. 10"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-md"
            >
              Simpan Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}