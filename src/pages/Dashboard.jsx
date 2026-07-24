import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { itemService } from '../services/itemService'
import { supabase } from '../services/supabase'
import { Package, Layers, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X, Search, Download, TrendingUp, AlertTriangle } from 'lucide-react'

export const Dashboard = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State untuk pencarian & filter kategori
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // State form inventori
  const [namaBarang, setNamaBarang] = useState('')
  const [kategori, setKategori] = useState('Elektronik')
  const [stok, setStok] = useState('')
  const [harga, setHarga] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchItems()

    // Mengaktifkan Real-Time Listener dari Supabase
    const channel = supabase
      .channel('public:items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchItems = async () => {
    try {
      const data = await itemService.getItems()
      setItems(data)
    } catch (err) {
      setError('Gagal memuat data inventori: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setNamaBarang(item.title || '')
      setKategori(item.category || 'Elektronik')
      setStok(item.stock !== undefined ? item.stock.toString() : '')
      setHarga(item.price !== undefined ? item.price.toString() : '')
    } else {
      setEditingId(null)
      setNamaBarang('')
      setKategori('Elektronik')
      setStok('')
      setHarga('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setNamaBarang('')
    setKategori('Elektronik')
    setStok('')
    setHarga('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload = {
        title: namaBarang,
        category: kategori,
        stock: parseInt(stok, 10) || 0,
        price: parseFloat(harga) || 0,
        user_id: user?.id
      }

      if (editingId) {
        await itemService.updateItem(editingId, payload)
        setSuccess('Data barang berhasil diperbarui secara real-time.')
      } else {
        await itemService.createItem(payload)
        setSuccess('Barang baru berhasil ditambahkan ke gudang.')
      }
      handleCloseModal()
    } catch (err) {
      setError('Gagal menyimpan data: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) return
    
    setError('')
    setSuccess('')
    try {
      await itemService.deleteItem(id)
      setSuccess('Barang berhasil dihapus.')
    } catch (err) {
      setError('Gagal menghapus data: ' + err.message)
    }
  }

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      setError('Tidak ada data untuk diekspor.')
      return
    }

    const headers = ['ID', 'Nama Barang', 'Kategori', 'Stok', 'Harga Satuan (Rp)', 'Tanggal Masuk']
    const csvRows = [headers.join(',')]

    filteredItems.forEach(item => {
      const row = [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.category || 'Lainnya')}"`,
        item.stock || 0,
        item.price || 0,
        `"${new Date(item.created_at).toLocaleDateString('id-ID')}"`
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `inventori_advanced_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSuccess('Laporan berhasil diunduh.')
  }

  // Kalkulasi Advanced Metrics langsung dari kolom database
  const totalItemsCount = items.length
  
  const totalValuation = items.reduce((acc, item) => {
    const qty = item.stock || 0
    const price = item.price || 0
    return acc + (qty * price)
  }, 0)

  const lowStockCount = items.filter(item => {
    const qty = item.stock || 0
    return qty > 0 && qty < 5
  }).length

  // Filter Data berdasarkan Pencarian & Kategori
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase()
    const matchTitle = item.title?.toLowerCase().includes(term)
    const matchCategory = selectedCategory === 'Semua' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())

    return matchTitle && matchCategory
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Modern Hero Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Database Sync Active</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Advanced Inventory System
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Sistem inventori terstruktur dengan database Supabase native. Masuk sebagai <span className="text-indigo-400 font-semibold">{user?.email}</span>.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            <button 
              onClick={() => handleOpenModal()} 
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Quick Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Jenis Produk</p>
            <p className="text-2xl font-bold text-slate-900">{totalItemsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi Valuasi Aset</p>
            <p className="text-xl font-bold text-emerald-600">
              Rp {totalValuation.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis (&lt; 5)</p>
            <p className={`text-xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {lowStockCount} Item
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Notification Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Content Card / Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Datalog Gudang Real-Time</h2>
            <p className="text-sm text-slate-500">Pembaruan otomatis langsung dari database server</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Filter Kategori */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-auto"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Makanan/Minuman">Makanan/Minuman</option>
              <option value="Alat Kantor">Alat Kantor</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            {/* Kolom Pencarian */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari barang..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data real-time...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-medium">Tidak ada produk ditemukan</p>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Coba sesuaikan kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Nama Barang</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Stok</th>
                  <th className="py-3.5 px-6">Harga Satuan</th>
                  <th className="py-3.5 px-6">Tanggal Masuk</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredItems.map((item) => {
                  const qty = item.stock || 0
                  const isLowStock = qty > 0 && qty < 5

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <span>{item.title}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-medium text-xs">
                          {item.category || 'Lainnya'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'}`}>
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                          <span>{qty} Unit</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-900">
                        Rp {Number(item.price || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs font-medium">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all duration-150 inline-flex items-center shadow-sm"
                          title="Edit Barang"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-150 inline-flex items-center shadow-sm"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form Inventori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingId ? 'Edit Data Barang' : 'Tambah Barang Baru'}
                </h3>
                <p className="text-xs text-slate-500">Sinkronisasi database native aktif</p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: MacBook Pro M3..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
                  >
                    <option value="Elektronik">Elektronik</option>
                    <option value="Pakaian">Pakaian</option>
                    <option value="Makanan/Minuman">Makanan/Minuman</option>
                    <option value="Alat Kantor">Alat Kantor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Jumlah Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="Contoh: 15"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 18500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Barang')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}