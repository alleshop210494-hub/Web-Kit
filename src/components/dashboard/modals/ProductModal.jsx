import React from 'react'
import { X } from 'lucide-react'

const ProductModal = ({
  isModalOpen,
  handleCloseModal,
  editingId,
  handleSubmit,
  submitting,
  namaBarang,
  setNamaBarang,
  kategori,
  setKategori,
  sku,
  setSku,
  stok,
  setStok,
  harga,
  setHarga,
  lokasiRak,
  setLokasiRak,
  supplierName,
  setSupplierName,
  suppliers,
  productCustomValues,
  setProductCustomValues
}) => {
  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingId ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Barang</label>
            <input
              type="text"
              required
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              placeholder="Contoh: Semen Gresik 50kg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Contoh: Bahan Bangunan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Kode Barang</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: SKU-1001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Stok Awal</label>
              <input
                type="number"
                required
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                required
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Rak / Gudang</label>
              <input
                type="text"
                value={lokasiRak}
                onChange={(e) => setLokasiRak(e.target.value)}
                placeholder="Rak A-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
              <select
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.name}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="border-t pt-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Atribut / Kolom Kustom Produk</h4>
            <p className="text-[11px] text-slate-500">Anda bisa menambah kolom baru dengan mengetik nama atribut di bawah.</p>
            
            {Object.entries(productCustomValues).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="w-1/3 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                />
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setProductCustomValues({ ...productCustomValues, [key]: e.target.value })}
                  placeholder="Nilai atribut"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...productCustomValues }
                    delete updated[key]
                    setProductCustomValues(updated)
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="Hapus Atribut"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                id="newCustomKey"
                placeholder="Nama Kolom Baru (Cth: Merk)"
                className="w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                id="newCustomVal"
                placeholder="Nilai Atribut"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const keyInput = document.getElementById('newCustomKey')
                  const valInput = document.getElementById('newCustomVal')
                  if (keyInput && keyInput.value.trim()) {
                    const newKey = keyInput.value.trim()
                    const newVal = valInput ? valInput.value : ''
                    setProductCustomValues({ ...productCustomValues, [newKey]: newVal })
                    keyInput.value = ''
                    if (valInput) valInput.value = ''
                  }
                }}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-medium"
              >
                Tambah
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal