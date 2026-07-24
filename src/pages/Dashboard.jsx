import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { itemService } from '../services/itemService'
import { Package, Layers, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X, Sparkles, ArrowUpRight, Search, Download, DollarSign, Tag, Archive } from 'lucide-react'

export const Dashboard = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State untuk pencarian
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // State khusus form Inventori
  const [namaBarang, setNamaBarang] = useState('')
  const [kategori, setKategori] = useState('Elektronik')
  const [stok, setStok] = useState('')
  const [harga, setHarga] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await itemService.getItems()
      setItems(data)
    } catch (err) {
      setError('Gagal memuat data inventori: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper untuk memparsing deskripsi gabungan kembali ke form edit
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setNamaBarang(item.title || '')
      
      // Parsing data dari format string deskripsi
      const desc = item.description || ''
      const katMatch = desc.match(/Kategori:\s*([^|]+)/)
      const stokMatch = desc.match(/Stok:\s*([0-9]+)/)
      const hargaMatch = desc.match(/Harga:\s*Rp\s*([0-9.]+)/)

      setKategori(katMatch ? katMatch[1].trim() : 'Elektronik')
      setStok(stokMatch ? stokMatch[1].trim() : '')
      setHarga(hargaMatch ? hargaMatch[1].trim().replace(/\./g, '') : '')
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
      // Mengemas data inventori rapi ke dalam format deskripsi teks
      const formattedDescription = `Kategori: ${kategori} | Stok: ${stok} | Harga: Rp ${Number(harga).toLocaleString('id-ID')}`

      if (editingId) {
        await itemService.updateItem(editingId, { 
          title: namaBarang, 
          description: formattedDescription 
        })
        setSuccess('Data barang berhasil diperbarui.')
      } else {
        await itemService.createItem({ 
          title: namaBarang, 
          description: formattedDescription, 
          user_id: user?.id 
        })
        setSuccess('Barang baru berhasil ditambahkan ke inventori.')
      }
      handleCloseModal()
      fetchItems()
    } catch (err) {
      setError('Gagal menyimpan data: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini dari inventori?')) return
    
    setError('')
    setSuccess('')
    try {
      await itemService.deleteItem(id)
      setSuccess('Barang berhasil dihapus.')
      fetchItems()
    } catch (err) {
      setError('Gagal menghapus data: ' + err.message)
    }
  }

  // Fungsi Ekspor Data ke CSV khusus Inventori
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      setError('Tidak ada data inventori yang dapat diekspor.')
      return
    }

    setError('')
    setSuccess('')

    const headers = ['ID', 'Nama Barang', 'Detail Inventori', 'Tanggal Ditambahkan']
    const csvRows = [headers.join(',')]

    filteredItems.forEach(item => {
      const row = [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${new Date(item.created_at).toLocaleDateString('id-ID')}"`
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_inventori_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setSuccess('Laporan inventori berhasil diekspor ke file CSV.')
  }

  // Filter data berdasarkan pencarian
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase()
    const matchTitle = item.title?.toLowerCase().includes(term)
    const matchDesc = item.description?.toLowerCase().includes(term)
    return matchTitle || matchDesc
  })

  // Hitung total nilai stok jika memungkinkan
  const totalItemCount = items.length

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Modern Hero Greeting Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul: Sistem Inventori Gudang</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Manajemen Stok Barang
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Kontrol stok, kategori, dan pendataan barang secara real-time. Masuk sebagai <span className="text-indigo-400 font-semibold">{user?.email}</span>.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Laporan</span>
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

      {/* Quick Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Jenis Barang</p>
            <p className="text-2xl font-bold text-slate-900">{totalItemCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Gudang</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Optimal / Aman</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Archive className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Terproteksi</p>
            <p className="text-sm font-semibold text-slate-800">Supabase RLS</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <ArrowUpRight className="w-5 h-5" />
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
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Datalog Inventori Gudang</h2>
            <p className="text-sm text-slate-500">Daftar produk dan ketersediaan stok saat ini</p>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang / kategori..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Memuat data inventori...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-medium">
              {items.length === 0 ? 'Belum ada data barang di inventori' : 'Barang tidak ditemukan'}
            </p>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {items.length === 0 ? 'Mulai tambahkan produk pertama Anda melalui tombol di atas.' : 'Coba gunakan kata kunci lain.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Nama Barang</th>
                  <th className="py-3.5 px-6">Rincian Inventori (Kategori, Stok, Harga)</th>
                  <th className="py-3.5 px-6">Tanggal Masuk</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <span>{item.title}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-sans font-medium">
                        {item.description || '-'}
                      </span>
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
                ))}
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
                <p className="text-xs text-slate-500">Formulir inventori gudang</p>
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
                  placeholder="Contoh: Laptop Asus ROG..."
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
                    placeholder="Contoh: 25"
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
                  placeholder="Contoh: 1500000"
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