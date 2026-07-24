import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { itemService } from '../services/itemService'
import { supabase } from '../services/supabase'
import { 
  Package, Layers, Plus, Trash2, Edit2, AlertCircle, CheckCircle, 
  X, Search, Download, TrendingUp, AlertTriangle, ArrowDownRight, 
  ArrowUpRight, Truck, MapPin, Barcode, Users, FileText, Printer 
} from 'lucide-react'

export const Dashboard = () => {
  const { user } = useAuth()
  
  // Fungsi penentu role berdasarkan email spesifik agar 100% akurat
  const determineRole = (currentUser) => {
    if (!currentUser?.email) return 'staff'
    if (currentUser.email === 'admin@email.com') return 'admin'
    if (currentUser.email === 'staff@email.com') return 'staff'
    return currentUser?.user_metadata?.role || 'staff'
  }

  const [currentRole, setCurrentRole] = useState(determineRole(user))

  // Tab Navigation State ('overview' | 'inventory' | 'transactions' | 'suppliers')
  const [activeTab, setActiveTab] = useState('overview')

  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'PT Sumber Makmur Jaya', phone: '08123456789', address: 'Jl. Industri No. 12, Jakarta' },
    { id: 2, name: 'CV Berkah Sentosa', phone: '08987654321', address: 'Jl. Raya Darmo No. 45, Surabaya' }
  ])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State pencarian & filter
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isTransModalOpen, setIsTransModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // State Form Produk
  const [namaBarang, setNamaBarang] = useState('')
  const [kategori, setKategori] = useState('')
  const [stok, setStok] = useState('')
  const [harga, setHarga] = useState('')
  const [sku, setSku] = useState('')
  const [lokasiRak, setLokasiRak] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // State Form Supplier Baru
  const [supNameInput, setSupNameInput] = useState('')
  const [supPhoneInput, setSupPhoneInput] = useState('')
  const [supAddrInput, setSupAddrInput] = useState('')

  // State Form Transaksi (Stock In / Stock Out)
  const [transItem, setTransItem] = useState('')
  const [transType, setTransType] = useState('MASUK')
  const [transQty, setTransQty] = useState('')
  const [transNotes, setTransNotes] = useState('')

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { data } = await supabase.auth.refreshSession()
        const activeUser = data?.session?.user || user
        if (activeUser) {
          setCurrentRole(determineRole(activeUser))
        }
      } catch (err) {
        console.error('Gagal memperbarui sesi role:', err.message)
      }

      fetchData()
    }

    initDashboard()

    // Mengaktifkan Real-Time Listener dari Supabase untuk items & transactions
    const channel = supabase
      .channel('public:inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const userRole = currentRole

  const fetchData = async () => {
    try {
      setLoading(true)
      const dataItems = await itemService.getItems()
      setItems(dataItems || [])
      await fetchTransactions()
    } catch (err) {
      setError('Gagal memuat data inventori: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setTransactions(data)
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat transaksi:', err.message)
    }
  }

  const handleOpenModal = (item = null) => {
    if (userRole === 'staff') {
      setError('Akses ditolak: Staff tidak diizinkan menambah atau mengubah data produk.')
      return
    }

    if (item) {
      setEditingId(item.id)
      setNamaBarang(item.title || '')
      setKategori(item.category || '')
      setStok(item.stock !== undefined ? item.stock.toString() : '')
      setHarga(item.price !== undefined ? item.price.toString() : '')
      setSku(item.sku || '')
      setLokasiRak(item.location || '')
      setSupplierName(item.supplier || '')
    } else {
      setEditingId(null)
      setNamaBarang('')
      setKategori('')
      setStok('')
      setHarga('')
      setSku('SKU-' + Math.floor(1000 + Math.random() * 9000))
      setLokasiRak('Rak A-01')
      setSupplierName(suppliers[0]?.name || '')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (userRole === 'staff') {
      setError('Akses ditolak: Staff tidak memiliki izin untuk menyimpan data produk.')
      return
    }

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const payload = {
        title: namaBarang,
        category: kategori.trim() || 'Lainnya',
        stock: parseInt(stok, 10) || 0,
        price: parseFloat(harga) || 0,
        sku: sku || 'SKU-GENERAL',
        location: lokasiRak || 'Gudang Utama',
        supplier: supplierName || 'Umum',
        user_id: user?.id
      }

      if (editingId) {
        await itemService.updateItem(editingId, payload)
        setSuccess('Data barang berhasil diperbarui.')
      } else {
        await itemService.createItem(payload)
        
        // Catat transaksi stok awal ke database Supabase
        await supabase.from('transactions').insert([
          {
            item_title: namaBarang,
            type: 'MASUK',
            qty: parseInt(stok, 10) || 0,
            notes: 'Stok Awal / Input Produk Baru',
            user_email: user?.email || 'admin@email.com'
          }
        ])

        setSuccess('Barang baru berhasil ditambahkan ke gudang.')
      }
      
      await fetchData()
      handleCloseModal()
    } catch (err) {
      setError('Gagal menyimpan data: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (userRole === 'staff') {
      setError('Akses ditolak: Staff tidak diizinkan menghapus data barang.')
      return
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) return
    
    setError('')
    setSuccess('')
    try {
      await itemService.deleteItem(id)
      await fetchData()
      setSuccess('Barang berhasil dihapus.')
    } catch (err) {
      setError('Gagal menghapus data: ' + err.message)
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    if (!transItem || !transQty) return

    const qtyNum = parseInt(transQty, 10)
    const targetItem = items.find(i => String(i.id) === String(transItem))
    if (!targetItem) return

    if (transType === 'KELUAR' && targetItem.stock < qtyNum) {
      setError('Stok tidak mencukupi untuk pengeluaran barang ini!')
      return
    }

    const newStock = transType === 'MASUK' ? targetItem.stock + qtyNum : targetItem.stock - qtyNum

    try {
      await itemService.updateItem(targetItem.id, { ...targetItem, stock: newStock })
      
      // Simpan transaksi mutasi ke tabel transactions Supabase
      await supabase.from('transactions').insert([
        {
          item_title: targetItem.title,
          type: transType,
          qty: qtyNum,
          notes: transNotes || 'Mutasi Manual Gudang',
          user_email: user?.email || 'user'
        }
      ])

      await fetchData()
      setSuccess(`Transaksi ${transType} berhasil dicatat dan disimpan ke database.`)
      setIsTransModalOpen(false)
      setTransQty('')
      setTransNotes('')
    } catch (err) {
      setError('Gagal memproses transaksi: ' + err.message)
    }
  }

  const handleAddSupplier = (e) => {
    e.preventDefault()
    if (userRole === 'staff') {
      setError('Akses ditolak: Staff tidak diizinkan menambah supplier.')
      return
    }
    if (!supNameInput) return
    const newSup = {
      id: Date.now(),
      name: supNameInput,
      phone: supPhoneInput || '-',
      address: supAddrInput || '-'
    }
    setSuppliers([...suppliers, newSup])
    setSupNameInput('')
    setSupPhoneInput('')
    setSupAddrInput('')
    setIsSupplierModalOpen(false)
    setSuccess('Supplier baru berhasil ditambahkan.')
  }

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      setError('Tidak ada data untuk diekspor.')
      return
    }

    const headers = ['ID', 'SKU', 'Nama Barang', 'Kategori', 'Stok', 'Harga Satuan (Rp)', 'Lokasi Rak', 'Supplier', 'Tanggal Masuk']
    const csvRows = [headers.join(';')]

    filteredItems.forEach(item => {
      const row = [
        item.id,
        `"${item.sku || '-'}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.category || 'Lainnya')}"`,
        item.stock || 0,
        item.price || 0,
        `"${item.location || '-'}"`,
        `"${item.supplier || '-'}"`,
        `"${new Date(item.created_at).toLocaleDateString('id-ID')}"`
      ]
      csvRows.push(row.join(';'))
    })

    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `enterprise_inventory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSuccess('Laporan berhasil diunduh.')
  }

  // FITUR CETAK LAPORAN INVENTORI (PDF VIA BROWSER PRINT)
  const handlePrintInventoryReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up diblokir oleh browser. Harap izinkan pop-up untuk mencetak laporan.')
      return
    }

    const totalValuation = items.reduce((acc, item) => acc + ((item.stock || 0) * (item.price || 0)), 0)
    const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Inventori Gudang - ${printDate}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; color: #1e1b4b; }
            .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; background: #f8fafc; padding: 10px; border-radius: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ENTERPRISE INVENTORY MANAGEMENT SYSTEM</h1>
            <p>Laporan Resmi Stok Barang & Valuasi Gudang</p>
          </div>
          <div class="summary">
            <div><strong>Tanggal Cetak:</strong> ${printDate}</div>
            <div><strong>Total Jenis Produk:</strong> ${items.length} Item</div>
            <div><strong>Total Valuasi Aset:</strong> Rp ${totalValuation.toLocaleString('id-ID')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>SKU</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th class="text-right">Harga Satuan</th>
                <th>Lokasi Rak</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.sku || '-'}</td>
                  <td><strong>${item.title}</strong></td>
                  <td>${item.category || 'Lainnya'}</td>
                  <td>${item.stock || 0} Unit</td>
                  <td class="text-right">Rp ${Number(item.price || 0).toLocaleString('id-ID')}</td>
                  <td>${item.location || '-'}</td>
                  <td>${item.supplier || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Dicetak oleh: <strong>${user?.email || 'Admin'}</strong></p>
            <br><br>
            <p>( __________________________ )</p>
            <p>Kepala Gudang / Penanggung Jawab</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // FITUR CETAK INVOICE / BUKTI TRANSAKSI (PDF VIA BROWSER PRINT)
  const handlePrintInvoice = (tx) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up diblokir oleh browser.')
      return
    }

    const txDateFormatted = tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : new Date().toLocaleString()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice Mutasi Stok - #${tx.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 30px; }
            .invoice-box { max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .title { font-size: 20px; font-weight: bold; color: #1e1b4b; margin-bottom: 5px; }
            .subtitle { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            .info-table { width: 100%; margin-bottom: 20px; font-size: 13px; border-collapse: collapse; }
            .info-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .badge-masuk { background: #d1fae5; color: #065f46; }
            .badge-keluar { background: #ffe4e6; color: #9f1239; }
            .footer { margin-top: 40px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="title">INVOICE MUTASI STOK GUDANG</div>
            <div class="subtitle">No. Referensi: TX-${tx.id} | Waktu: ${txDateFormatted}</div>
            
            <table class="info-table">
              <tr>
                <td><strong>Jenis Mutasi:</strong></td>
                <td><span class="badge ${tx.type === 'MASUK' ? 'badge-masuk' : 'badge-keluar'}">${tx.type}</span></td>
              </tr>
              <tr>
                <td><strong>Nama Produk:</strong></td>
                <td><strong>${tx.item_title}</strong></td>
              </tr>
              <tr>
                <td><strong>Jumlah Unit:</strong></td>
                <td>${tx.qty} Unit</td>
              </tr>
              <tr>
                <td><strong>Keterangan / Catatan:</strong></td>
                <td>${tx.notes || '-'}</td>
              </tr>
              <tr>
                <td><strong>Operator / User:</strong></td>
                <td>${tx.user_email || user?.email || 'Admin'}</td>
              </tr>
            </table>

            <div class="footer">
              <p>Disetujui Oleh,</p>
              <br><br>
              <p><strong>( ______________________ )</strong></p>
              <p>Bagian Logistik & Inventori</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Kalkulasi Metrik
  const totalItemsCount = items.length
  const totalValuation = items.reduce((acc, item) => acc + ((item.stock || 0) * (item.price || 0)), 0)
  const lowStockCount = items.filter(item => (item.stock || 0) > 0 && (item.stock || 0) < 2).length
  const outOfStockCount = items.filter(item => (item.stock || 0) === 0).length

  const uniqueCategories = ['Semua', ...new Set(items.map(item => item.category).filter(Boolean))]

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase()
    const matchTitle = item.title?.toLowerCase().includes(term) || item.sku?.toLowerCase().includes(term)
    const matchCategory = selectedCategory === 'Semua' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())
    return matchTitle && matchCategory
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Bar Banner & Info Role Login */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Enterprise Sync Active</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
                Login Sebagai: {userRole.toUpperCase()} ({user?.email || 'User'})
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Enterprise Inventory Management System
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Sistem terpadu dengan manajemen stok masuk/keluar, pelacakan rak, supplier, dan analitik real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTransModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Catat Transaksi</span>
            </button>
            <button
              onClick={handlePrintInventoryReport}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-sm transition-all"
              title="Cetak Laporan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor CSV</span>
            </button>
            {userRole === 'admin' && (
              <button 
                onClick={() => handleOpenModal()} 
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/35 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ringkasan & Analitik</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Package className="w-4 h-4" />
          <span>Manajemen Produk ({items.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'transactions' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FileText className="w-4 h-4" />
          <span>Riwayat Transaksi</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'suppliers' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Supplier ({suppliers.length})</span>
        </button>
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

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Jenis Produk</p>
                <p className="text-2xl font-bold text-slate-900">{totalItemsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valuasi Aset Gudang</p>
                <p className="text-lg font-bold text-emerald-600">
                  Rp {totalValuation.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis (&lt; 2)</p>
                <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {lowStockCount} Item
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Habis (0)</p>
                <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {outOfStockCount} Item
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${outOfStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Distribusi Kategori Produk</h3>
              <div className="space-y-3">
                {uniqueCategories.filter(c => c !== 'Semua').map((cat, idx) => {
                  const count = items.filter(i => i.category === cat).length
                  const percentage = totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{cat}</span>
                        <span>{count} Produk ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Aktivitas Sesi & Autentikasi</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">Status Database Supabase</span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">Terhubung (Realtime)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">Level Akses Akun</span>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-md">{userRole.toUpperCase()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-700">Total Supplier Terdaftar</span>
                  <span className="font-bold text-slate-900">{suppliers.length} Vendor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Inventori Barang & Rak Penyimpanan</h2>
              <p className="text-sm text-slate-500">Kelola SKU, lokasi fisik, dan supplier produk</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-auto"
              >
                {uniqueCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Memuat data inventori...</span>
            </div>
          ) : filteredItems.length === 0 ? (
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
                  {filteredItems.map((item) => {
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
        </div>
      )}

      {/* TAB 3: TRANSACTIONS HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Riwayat Stok Masuk & Keluar (Database)</h2>
              <p className="text-sm text-slate-500">Log audit seluruh mutasi stok barang di gudang secara permanen</p>
            </div>
            <button
              onClick={() => setIsTransModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              + Buat Transaksi Baru
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">Belum ada transaksi tercatat pada database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Jumlah</th>
                    <th className="py-3 px-4">Keterangan / Catatan</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Invoice PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold">
                        {tx.type === 'MASUK' ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>MASUK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>KELUAR</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{tx.item_title}</td>
                      <td className="py-3 px-4 font-bold">{tx.qty} Unit</td>
                      <td className="py-3 px-4 text-slate-500">{tx.notes}</td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{tx.user_email || '-'}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handlePrintInvoice(tx)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                          title="Cetak Invoice Transaksi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manajemen Supplier / Vendor</h2>
              <p className="text-sm text-slate-500">Daftar rekanan penyuplai barang inventori</p>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                + Tambah Supplier
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-base">{sup.name}</h3>
                  <Truck className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-xs text-slate-600">Telepon: <span className="font-semibold text-slate-800">{sup.phone}</span></p>
                <p className="text-xs text-slate-600">Alamat: <span className="font-semibold text-slate-800">{sup.address}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: FORM PRODUK (TAMBAH/EDIT) */}
      {isModalOpen && userRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Produk & Atribut' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Barang</label>
                  <input
                    type="text"
                    required
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    placeholder="Contoh: Laptop Asus..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">SKU / Kode Barcode</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Contoh: SKU-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Kategori</label>
                  <input
                    type="text"
                    required
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    placeholder="Contoh: Elektronik"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Lokasi Rak / Zona</label>
                  <input
                    type="text"
                    required
                    value={lokasiRak}
                    onChange={(e) => setLokasiRak(e.target.value)}
                    placeholder="Contoh: Rak B-03"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Jumlah Stok</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="5000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Pilih Supplier / Vendor</label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.name}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md">
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSAKSI MASUK / KELUAR */}
      {isTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Catat Mutasi Stok</h3>
              <button onClick={() => setIsTransModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Pilih Produk</label>
                <select
                  required
                  value={transItem}
                  onChange={(e) => setTransItem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">-- Pilih Produk --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.title} (Stok: {item.stock})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Jenis Transaksi</label>
                <select
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                >
                  <option value="MASUK">Stok Masuk (Restock / Pembelian)</option>
                  <option value="KELUAR">Stok Keluar (Penjualan / Pemakaian)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Jumlah Unit</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transQty}
                  onChange={(e) => setTransQty(e.target.value)}
                  placeholder="Contoh: 5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={transNotes}
                  onChange={(e) => setTransNotes(e.target.value)}
                  placeholder="Contoh: PO-001 dari Supplier"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsTransModalOpen(false)} className="px-4 py-2 border rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Proses Mutasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SUPPLIER */}
      {isSupplierModalOpen && userRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Tambah Supplier Baru</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Perusahaan / Supplier</label>
                <input
                  type="text"
                  required
                  value={supNameInput}
                  onChange={(e) => setSupNameInput(e.target.value)}
                  placeholder="Contoh: PT Jaya Abadi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Telepon</label>
                <input
                  type="text"
                  value={supPhoneInput}
                  onChange={(e) => setSupPhoneInput(e.target.value)}
                  placeholder="Contoh: 081234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Alamat</label>
                <input
                  type="text"
                  value={supAddrInput}
                  onChange={(e) => setSupAddrInput(e.target.value)}
                  placeholder="Contoh: Jl. Ahmad Yani No. 10"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 border rounded-xl text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Simpan Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}