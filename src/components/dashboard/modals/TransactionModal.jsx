import React from 'react'
import { X } from 'lucide-react'

export const TransactionModal = ({
  isTransModalOpen,
  setIsTransModalOpen,
  handleAddTransaction,
  transItem,
  setTransItem,
  allUserItems,
  transType,
  setTransType,
  transQty,
  setTransQty,
  transNotes,
  setTransNotes
}) => {
  if (!isTransModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">Catat Transaksi Mutasi Stok</h3>
          <button onClick={() => setIsTransModalOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk</label>
            <select
              required
              value={transItem}
              onChange={(e) => setTransItem(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">-- Pilih Barang --</option>
              {allUserItems.map(item => (
                <option key={item.id} value={item.id}>{item.title} (Stok: {item.stock || 0})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Mutasi</label>
              <select
                value={transType}
                onChange={(e) => setTransType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="MASUK">MASUK</option>
                <option value="KELUAR">KELUAR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Unit</label>
              <input
                type="number"
                required
                min="1"
                value={transQty}
                onChange={(e) => setTransQty(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Catatan</label>
            <input
              type="text"
              value={transNotes}
              onChange={(e) => setTransNotes(e.target.value)}
              placeholder="Pengiriman ke cabang"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTransModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-md"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}