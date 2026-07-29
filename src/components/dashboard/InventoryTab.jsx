import React from 'react'
import { Search, Plus, Pencil, Trash2, Package } from 'lucide-react'

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
  handleDelete,
  customColumns
}) => {
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, SKU, atau lokasi..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Stok</option>
            <option value="low">Stok Menipis (&lt; 2)</option>
            <option value="out">Stok Habis (0)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-right">Harga Total</th>
                {customColumns.map(col => (
                  <th key={col} className="py-3.5 px-4">{col}</th>
                ))}
                <th className="py-3.5 px-4">Lokasi Rak</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={11 + customColumns.length} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>Tidak ada produk ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const totalVal = (item.stock || 0) * (item.price || 0)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                        {item.sku || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {item.category || 'Lainnya'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          (item.stock || 0) === 0 ? 'bg-rose-100 text-rose-700' :
                          (item.stock || 0) < 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.stock || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        Rp {(item.price || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        Rp {totalVal.toLocaleString('id-ID')}
                      </td>
                      {customColumns.map(col => (
                        <td key={col} className="py-3 px-4 text-slate-600">
                          {item.custom_fields?.[col] || '-'}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-slate-600">
                        {item.location || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dari total data</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-xs font-medium text-slate-600">
              Halaman {currentPage} dari {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default InventoryTab