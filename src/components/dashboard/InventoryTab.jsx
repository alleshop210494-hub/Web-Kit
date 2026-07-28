import React from 'react'
import { Search, Plus, Edit3, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'

export const InventoryTab = ({
  paginatedItems,
  filteredItems,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  uniqueCategories,
  stockStatusFilter,
  setStockStatusFilter,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  handleOpenModal,
  handleDelete
}) => {
  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Sub Filter: Category, Stock Status */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status Stok:</span>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="low">Stok Menipis (&lt; 2)</option>
              <option value="out">Habis (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Produk */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">SKU / Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4">Lokasi & Supplier</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Tidak ada produk yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.sku || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {item.category || 'Lainnya'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        (item.stock || 0) === 0 
                          ? 'bg-rose-100 text-rose-700' 
                          : (item.stock || 0) < 2 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.stock || 0} unit
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      Rp {(item.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>Rak: <span className="font-medium text-slate-800">{item.location || '-'}</span></div>
                      <div>Supp: <span className="font-medium text-slate-800">{item.supplier || '-'}</span></div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {/* Tombol Aksi Edit & Hapus Aktif untuk Setiap Akun */}
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          title="Edit Produk"
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Produk"
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:px-6 border-t border-slate-200 gap-4">
          <div className="text-xs text-slate-500">
            Menampilkan halaman <span className="font-semibold text-slate-700">{currentPage}</span> dari <span className="font-semibold text-slate-700">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}