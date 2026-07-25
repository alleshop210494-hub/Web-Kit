import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { itemService } from '../services/itemService'
import { supabase } from '../services/supabase'
import { 
  Package, Layers, Plus, AlertCircle, CheckCircle, 
  X, Download, TrendingUp, Truck, FileText, Printer, CheckSquare, Camera 
} from 'lucide-react'
// Import Sub-Komponen Terpisah
import { OverviewTab } from '../components/dashboard/OverviewTab'
import { InventoryTab } from '../components/dashboard/InventoryTab'
import { OpnameTab } from '../components/dashboard/OpnameTab'
import { TransactionsTab } from '../components/dashboard/TransactionsTab'
import { SuppliersTab } from '../components/dashboard/SuppliersTab'

export const Dashboard = () => {
  const { user } = useAuth()
  
  const determineRole = (currentUser) => {
    if (!currentUser?.email) return 'staff'
    if (currentUser.email === 'admin@email.com') return 'admin'
    if (currentUser.email === 'staff@email.com') return 'staff'
    return currentUser?.user_metadata?.role || 'staff'
  }
  
  const [currentRole, setCurrentRole] = useState(determineRole(user))
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
  
  // State Filter, Pencarian, Sorting, & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // State Modal & Kamera Scanner
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isTransModalOpen, setIsTransModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannerResult, setScannerResult] = useState('')
  const videoRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  
  const [namaBarang, setNamaBarang] = useState('')
  const [kategori, setKategori] = useState('')
  const [stok, setStok] = useState('')
  const [harga, setHarga] = useState('')
  const [sku, setSku] = useState('')
  const [lokasiRak, setLokasiRak] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [supNameInput, setSupNameInput] = useState('')
  const [supPhoneInput, setSupPhoneInput] = useState('')
  const [supAddrInput, setSupAddrInput] = useState('')
  const [transItem, setTransItem] = useState('')
  const [transType, setTransType] = useState('MASUK')
  const [transQty, setTransQty] = useState('')
  const [transNotes, setTransNotes] = useState('')
  const [opnameInputs, setOpnameInputs] = useState({})

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

  // Efek untuk menyalakan kamera saat modal scanner terbuka
  useEffect(() => {
    let stream = null
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error('Kamera tidak dapat diakses:', err)
          setError('Akses kamera ditolak atau tidak tersedia pada perangkat ini.')
        })
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isScannerOpen])

  const userRole = currentRole

  const fetchData = async () => {
    try {
      setLoading(true)
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      const userId = activeUser?.id

      // Ambil data item HANYA milik user yang sedang login (jika user baru daftar, hasilnya kosong / dari 0)
      const dataItems = await itemService.getItems(userId)
      setItems(dataItems || [])
      await fetchTransactions(activeUser?.email)
    } catch (err) {
      setError('Gagal memuat data inventori: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (userEmail) => {
    try {
      const emailQuery = userEmail || user?.email
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false })
      
      if (emailQuery) {
        query = query.eq('user_email', emailQuery)
      }

      const { data, error } = await query
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
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      const payload = {
        title: namaBarang,
        category: kategori.trim() || 'Lainnya',
        stock: parseInt(stok, 10) || 0,
        price: parseFloat(harga) || 0,
        sku: sku || 'SKU-GENERAL',
        location: lokasiRak || 'Gudang Utama',
        supplier: supplierName || 'Umum',
        user_id: activeUser?.id
      }
      if (editingId) {
        await itemService.updateItem(editingId, payload)
        setSuccess('Data barang berhasil diperbarui.')
      } else {
        await itemService.createItem(payload)
        
        await supabase.from('transactions').insert([
          {
            item_title: namaBarang,
            type: 'MASUK',
            qty: parseInt(stok, 10) || 0,
            notes: 'Stok Awal / Input Produk Baru',
            user_email: activeUser?.email || 'admin@email.com'
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
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      await itemService.updateItem(targetItem.id, { ...targetItem, stock: newStock })
      
      await supabase.from('transactions').insert([
        {
          item_title: targetItem.title,
          type: transType,
          qty: qtyNum,
          notes: transNotes || 'Mutasi Manual Gudang',
          user_email: activeUser?.email || 'user'
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

  const handleProcessOpname = async (item) => {
    const physicalVal = opnameInputs[item.id]
    if (physicalVal === undefined || physicalVal === '') {
      setError(`Masukkan jumlah stok fisik yang valid untuk ${item.title}`)
      return
    }
    const physicalQty = parseInt(physicalVal, 10)
    const systemQty = item.stock || 0
    const diff = physicalQty - systemQty
    if (diff === 0) {
      setSuccess(`Stok ${item.title} sudah sinkron (tidak ada selisih).`)
      return
    }
    try {
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      await itemService.updateItem(item.id, { ...item, stock: physicalQty })
      await supabase.from('transactions').insert([
        {
          item_title: item.title,
          type: 'OPNAME',
          qty: Math.abs(diff),
          notes: `Stock Opname: Sistem=${systemQty}, Fisik=${physicalQty} (Selisih: ${diff > 0 ? '+' : ''}${diff})`,
          user_email: activeUser?.email || 'user'
        }
      ])
      await fetchData()
      setSuccess(`Stock Opname untuk ${item.title} berhasil disimpan. Selisih dicatat: ${diff > 0 ? '+' : ''}${diff}`)
      setOpnameInputs({ ...opnameInputs, [item.id]: '' })
    } catch (err) {
      setError('Gagal memproses Stock Opname: ' + err.message)
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

  // FITUR CETAK LAPORAN PDF
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up diblokir oleh browser. Harap izinkan pop-up untuk mencetak laporan.')
      return
    }
    const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    let title = ''
    let contentHtml = ''
    if (activeTab === 'overview') {
      title = 'Laporan Ringkasan & Analitik Gudang'
      contentHtml = `
        <h3 style="color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Ringkasan Utama Aset</h3>
        <table>
          <tr><td>Total Jenis Produk</td><td><strong>${totalItemsCount} Item</strong></td></tr>
          <tr><td>Valuasi Aset Gudang</td><td><strong>Rp ${totalValuation.toLocaleString('id-ID')}</strong></td></tr>
          <tr><td>Stok Menipis (&lt; 2)</td><td><strong>${lowStockCount} Item</strong></td></tr>
          <tr><td>Stok Habis (0)</td><td><strong>${outOfStockCount} Item</strong></td></tr>
          <tr><td>Total Supplier Terdaftar</td><td><strong>${suppliers.length} Vendor</strong></td></tr>
        </table>
      `
    } else if (activeTab === 'inventory') {
      title = 'Laporan Manajemen Produk & Inventori'
      contentHtml = `
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
            ${filteredItems.map((item, index) => `
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
      `
    } else if (activeTab === 'opname') {
      title = 'Laporan Lembar Kerja Stock Opname (Audit Fisik)'
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>SKU</th>
              <th>Nama Barang</th>
              <th>Kategori</th>
              <th>Lokasi Rak</th>
              <th>Stok Sistem</th>
              <th>Stok Fisik Aktual</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.sku || '-'}</td>
                <td><strong>${item.title}</strong></td>
                <td>${item.category || 'Lainnya'}</td>
                <td>${item.location || '-'}</td>
                <td>${item.stock || 0} Unit</td>
                <td>__________________</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'transactions') {
      title = 'Laporan Riwayat Mutasi & Transaksi Gudang'
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Waktu & Tanggal</th>
              <th>Jenis Mutasi</th>
              <th>Nama Produk</th>
              <th>Jumlah Unit</th>
              <th>Keterangan</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map((tx, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}</td>
                <td><strong>${tx.type}</strong></td>
                <td>${tx.item_title}</td>
                <td>${tx.qty} Unit</td>
                <td>${tx.notes || '-'}</td>
                <td>${tx.user_email || 'Admin'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'suppliers') {
      title = 'Laporan Daftar Supplier & Vendor Resmi'
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Perusahaan / Supplier</th>
              <th>Nomor Telepon</th>
              <th>Alamat</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map((sup, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${sup.name}</strong></td>
                <td>${sup.phone || '-'}</td>
                <td>${sup.address || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${printDate}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; color: #1e1b4b; }
            .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
            .meta-info { margin-bottom: 15px; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ENTERPRISE INVENTORY MANAGEMENT SYSTEM</h1>
            <p>${title}</p>
          </div>
          <div class="meta-info">
            <div><strong>Tanggal Cetak:</strong> ${printDate}</div>
            <div><strong>Dicetak Oleh:</strong> ${user?.email || 'Admin'}</div>
          </div>
          ${contentHtml}
          <div class="footer">
            <br><br>
            <p>( __________________________ )</p>
            <p>Kepala Gudang / Penanggung Jawab</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // EKSPOR CSV
  const handleExportCSV = () => {
    let headers = []
    let csvRows = []
    let filename = ''
    if (activeTab === 'overview') {
      headers = ['Metrik Ringkasan', 'Nilai']
      csvRows.push(headers.join(';'))
      csvRows.push(`"Total Jenis Produk";${totalItemsCount}`)
      csvRows.push(`"Valuasi Aset Gudang (Rp)";${totalValuation}`)
      csvRows.push(`"Stok Menipis (< 2)";${lowStockCount}`)
      csvRows.push(`"Stok Habis (0)";${outOfStockCount}`)
      csvRows.push(`"Total Supplier Terdaftar";${suppliers.length}`)
      filename = `ringkasan_analitik_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (activeTab === 'inventory') {
      if (filteredItems.length === 0) {
        setError('Tidak ada data produk untuk diekspor.')
        return
      }
      headers = ['ID', 'SKU', 'Nama Barang', 'Kategori', 'Stok', 'Harga Satuan (Rp)', 'Lokasi Rak', 'Supplier', 'Tanggal Masuk']
      csvRows.push(headers.join(';'))
      filteredItems.forEach(item => {
        csvRows.push([
          item.id,
          `"${item.sku || '-'}"`,
          `"${(item.title || '').replace(/"/g, '""')}"`,
          `"${(item.category || 'Lainnya')}"`,
          item.stock || 0,
          item.price || 0,
          `"${item.location || '-'}"`,
          `"${item.supplier || '-'}"`,
          `"${new Date(item.created_at).toLocaleDateString('id-ID')}"`
        ].join(';'))
      })
      filename = `manajemen_produk_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (activeTab === 'opname') {
      if (items.length === 0) {
        setError('Tidak ada data stock opname untuk diekspor.')
        return
      }
      headers = ['ID', 'SKU', 'Nama Barang', 'Kategori', 'Lokasi Rak', 'Stok Sistem']
      csvRows.push(headers.join(';'))
      items.forEach(item => {
        csvRows.push([
          item.id,
          `"${item.sku || '-'}"`,
          `"${(item.title || '').replace(/"/g, '""')}"`,
          `"${(item.category || 'Lainnya')}"`,
          `"${item.location || '-'}"`,
          item.stock || 0
        ].join(';'))
      })
      filename = `stock_opname_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (activeTab === 'transactions') {
      if (transactions.length === 0) {
        setError('Tidak ada riwayat transaksi untuk diekspor.')
        return
      }
      headers = ['ID', 'Waktu', 'Jenis Mutasi', 'Nama Produk', 'Jumlah Unit', 'Keterangan', 'Operator']
      csvRows.push(headers.join(';'))
      transactions.forEach(tx => {
        csvRows.push([
          tx.id,
          `"${tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}"`,
          `"${tx.type}"`,
          `"${(tx.item_title || '').replace(/"/g, '""')}"`,
          tx.qty,
          `"${(tx.notes || '-').replace(/"/g, '""')}"`,
          `"${tx.user_email || 'Admin'}"`
        ].join(';'))
      })
      filename = `riwayat_transaksi_${new Date().toISOString().slice(0, 10)}.csv`
    } else if (activeTab === 'suppliers') {
      if (suppliers.length === 0) {
        setError('Tidak ada data supplier untuk diekspor.')
        return
      }
      headers = ['ID', 'Nama Supplier', 'Nomor Telepon', 'Alamat']
      csvRows.push(headers.join(';'))
      suppliers.forEach(sup => {
        csvRows.push([
          sup.id,
          `"${(sup.name || '').replace(/"/g, '""')}"`,
          `"${sup.phone || '-'}"`,
          `"${(sup.address || '-').replace(/"/g, '""')}"`
        ].join(';'))
      })
      filename = `daftar_supplier_${new Date().toISOString().slice(0, 10)}.csv`
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSuccess('File laporan CSV berhasil diunduh.')
  }

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
            .badge-opname { background: #e0e7ff; color: #3730a3; }
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
                <td><span class="badge ${tx.type === 'MASUK' ? 'badge-masuk' : tx.type === 'KELUAR' ? 'badge-keluar' : 'badge-opname'}">${tx.type}</span></td>
              </tr>
              <tr>
                <td><strong>Nama Produk:</strong></td>
                <td><strong>${tx.item_title}</strong></td>
              </tr>
              <tr>
                <td><strong>Jumlah Unit / Selisih:</strong></td>
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
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Kalkulasi Ringkasan
  const totalItemsCount = items.length
  const totalValuation = items.reduce((acc, item) => acc + ((item.stock || 0) * (item.price || 0)), 0)
  const lowStockCount = items.filter(item => (item.stock || 0) > 0 && (item.stock || 0) < 2).length
  const outOfStockCount = items.filter(item => (item.stock || 0) === 0).length
  const uniqueCategories = ['Semua', ...new Set(items.map(item => item.category).filter(Boolean))]

  // Filtering & Searching & Sorting Logic
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase()
    const matchTitle = item.title?.toLowerCase().includes(term) || item.sku?.toLowerCase().includes(term)
    const matchCategory = selectedCategory === 'Semua' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())
    
    let matchStatus = true
    const qty = item.stock || 0
    if (stockStatusFilter === 'low') {
      matchStatus = qty > 0 && qty < 2
    } else if (stockStatusFilter === 'out') {
      matchStatus = qty === 0
    }
    return matchTitle && matchCategory && matchStatus
  })

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '')
    } else if (sortBy === 'stock-asc') {
      return (a.stock || 0) - (b.stock || 0)
    } else if (sortBy === 'price-desc') {
      return (b.price || 0) - (a.price || 0)
    } else {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    }
  })

  // Pagination Logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-16">
      {/* Top Bar Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Enterprise Sync Active</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
                Role: {userRole.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Inventory Management
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Sistem terpadu dengan analitik, scanner barcode kamera, stock opname, dan laporan lengkap.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
            <button
              onClick={() => setIsTransModalOpen(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Transaksi</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
              title="Cetak Laporan PDF Berdasarkan Tab Aktif"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 shadow-sm transition-all"
              title="Ekspor CSV Berdasarkan Tab Aktif"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            {userRole === 'admin' && (
              <button 
                onClick={() => handleOpenModal()} 
                className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/35 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ringkasan & Analitik</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Package className="w-4 h-4" />
          <span>Manajemen Produk</span>
        </button>
        <button
          onClick={() => setActiveTab('opname')}
          className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'opname' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Stock Opname</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'transactions' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Truck className="w-4 h-4" />
          <span>Riwayat Transaksi</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 sm:px-5 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'suppliers' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Supplier</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'overview' && (
        <OverviewTab
          items={items}
          transactions={transactions}
          suppliers={suppliers}
          totalItemsCount={totalItemsCount}
          totalValuation={totalValuation}
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
          uniqueCategories={uniqueCategories}
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryTab
          paginatedItems={paginatedItems}
          filteredItems={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          uniqueCategories={uniqueCategories}
          stockStatusFilter={stockStatusFilter}
          setStockStatusFilter={setStockStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          userRole={userRole}
          handleOpenModal={handleOpenModal}
          handleDelete={handleDelete}
          setIsScannerOpen={setIsScannerOpen}
        />
      )}
      {activeTab === 'opname' && (
        <OpnameTab
          items={items}
          opnameInputs={opnameInputs}
          setOpnameInputs={setOpnameInputs}
          handleProcessOpname={handleProcessOpname}
        />
      )}
      {activeTab === 'transactions' && (
        <TransactionsTab
          transactions={transactions}
          handlePrintInvoice={handlePrintInvoice}
        />
      )}
      {activeTab === 'suppliers' && (
        <SuppliersTab
          suppliers={suppliers}
          userRole={userRole}
          setIsSupplierModalOpen={setIsSupplierModalOpen}
        />
      )}

      {/* Modal Produk (Tambah/Edit) */}
      {isModalOpen && (
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
      )}

      {/* Modal Supplier */}
      {isSupplierModalOpen && (
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Supplier / Perusahaan</label>
                <input
                  type="text"
                  required
                  value={supNameInput}
                  onChange={(e) => setSupNameInput(e.target.value)}
                  placeholder="Contoh: PT Sumber Jaya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={supPhoneInput}
                  onChange={(e) => setSupPhoneInput(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input
                  type="text"
                  value={supAddrInput}
                  onChange={(e) => setSupAddrInput(e.target.value)}
                  placeholder="Contoh: Jl. Ahmad Yani No. 10"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md"
                >
                  Simpan Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transaksi */}
      {isTransModalOpen && (
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
                  {items.map(item => (
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
                    placeholder="Contoh: 5"
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
                  placeholder="Contoh: Pengiriman ke toko cabang"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 shadow-md"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Scanner Kamera */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" /> Scanner Barcode / Kamera
              </h3>
              <button onClick={() => setIsScannerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-indigo-500/50 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">Arahkan ke Barcode Produk</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Pastikan pencahayaan cukup dan kamera fokus pada barcode atau QR code barang.
            </p>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700"
            >
              Tutup Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  )
}