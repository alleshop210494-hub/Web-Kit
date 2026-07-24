import React from 'react'
import { Package, Search, Barcode, AlertTriangle, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

export const InventoryTab = ({ 
  items, 
  loading, 
  paginatedItems, 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm, 
  uniqueCategories, 
  userRole, 
  handleOpenModal, 
  handleDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  sortBy,
  setSortBy,
  stockStatusFilter,
  setStockStatusFilter,
  setIsScannerOpen
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden space-y-4">
      {/* Header & Filter Bar */}
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Inventori Barang & Rak Penyimpanan</h2>
            <p className="text-sm text-slate-500">Kelola SKU, lokasi fisik, dan supplier produk</p>
          </div>

          {/* Tombol Buka Scanner Kamera */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Barcode / Kamera</span>
          </button>
        </div>

        {/* Bar Filter Lanjutan & Pencarian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Pencarian */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau SKU..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {uniqueCategories.map((cat, idx) => (
              <option key={idx} value={cat}>Kategori: {cat}</option>
            ))}
          </select>

          {/* Status Stok */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <option value="all">Semua Status Stok</option>
            <option value="low">Stok Menipis (&lt; 2)</option>
            <option value="out">Stok Habis (0)</option>
          </select>

          {/* Pengurutan (Sorting) */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <option value="newest">Urutkan: Terbaru</option>
            <option value="title-asc">Nama (A - Z)</option>
            <option value="stock-asc">Stok Terendah</option>
            <option value="price-desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data inventori...</span>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-medium">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">SKU / Nama Barang</th>
                <th className="py-3.5 px-6">Kategori</th>
                <th className="py-3.5 px-6">Stok</th>
                <th className="py-3.5 px-6">Harga Satuan</th>
                <th className="py-3.5 px-6">Lokasi Rak</th>
                <th className="py-3.5 px-6">Supplier</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {paginatedItems.map((item) => {
                const qty = item.stock || 0
                const isLowStock = qty > 0 && qty < 2
                const isOut = qty === 0

                return (
                  <tr key={item.id} className="hover:bg-slate-50/85 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 flex items-center space-x-2">
                        <Barcode className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 ml-6">{item.sku || 'SKU-GENERAL'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-medium text-xs">
                        {item.category || 'Lainnya'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold ${isOut ? 'bg-red-50 text-red-700 border border-red-200' : isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'}`}>
                        {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        <span>{qty} Unit</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-900">
                      Rp {Number(item.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-600 flex items-center space-x-1 mt-3">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.location || 'Rak Utama'}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {item.supplier || 'Umum'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {userRole === 'admin' ? (
                        <>
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition inline-flex items-center"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition inline-flex items-center"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Hanya Baca</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center space-x-2">
          <span>Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per halaman</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500">
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}