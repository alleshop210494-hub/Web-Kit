import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { itemService } from '../services/itemService'
import { supabase } from '../services/supabase'
import { 
  Package, Layers, Plus, AlertCircle, CheckCircle, 
  X, Download, Upload, TrendingUp, Truck, FileText, Printer, CheckSquare, Camera, Pencil 
} from 'lucide-react'
import { OverviewTab } from '../components/dashboard/OverviewTab'
import { InventoryTab } from '../components/dashboard/InventoryTab'
import { OpnameTab } from '../components/dashboard/OpnameTab'
import { TransactionsTab } from '../components/dashboard/TransactionsTab'
import { SuppliersTab } from '../components/dashboard/SuppliersTab'

export const Dashboard = () => {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [items, setItems] = useState([])
  const [allUserItems, setAllUserItems] = useState([]) 
  const [transactions, setTransactions] = useState([])
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'PT Sumber Makmur Jaya', phone: '08123456789', address: 'Jl. Industri No. 12, Jakarta' },
    { id: 2, name: 'CV Berkah Sentosa', phone: '08987654321', address: 'Jl. Raya Darmo No. 45, Surabaya' }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // State untuk Nama Perusahaan & Fitur Edit Inline
  const [companyName, setCompanyName] = useState('Enterprise Inventory Control')
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [tempCompanyName, setTempCompanyName] = useState('')
  const [savingCompany, setSavingCompany] = useState(false)

  // State Filter, Pencarian, & Server-Side Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [stockStatusFilter, setStockStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItemsCountServer, setTotalItemsCountServer] = useState(0)
  
  // State Modal & Kamera Scanner & File Ref
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isTransModalOpen, setIsTransModalOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
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

  // Ambil data setiap kali parameter pencarian/halaman berubah
  useEffect(() => {
    fetchData()
  }, [user, currentPage, itemsPerPage, searchTerm, selectedCategory, stockStatusFilter])

  // Real-time listener yang difilter spesifik berdasarkan user_id
  useEffect(() => {
    let channel = null
    const setupRealtime = async () => {
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      const userId = activeUser?.id
      if (!userId) return
      channel = supabase
        .channel(`public:items:user_id=eq.${userId}`)
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'items',
            filter: `user_id=eq.${userId}` 
          }, 
          () => {
            fetchData()
          }
        )
        .subscribe()
    }
    setupRealtime()
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  // Efek kamera scanner
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

  const fetchData = async () => {
    try {
      setLoading(true)
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      const userId = activeUser?.id
      
      if (userId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', userId)
          .single()
          
        if (profileData && profileData.company_name) {
          setCompanyName(profileData.company_name)
          setTempCompanyName(profileData.company_name)
        } else {
          setTempCompanyName(companyName)
        }
      }
      
      const result = await itemService.getItems(
        userId, 
        currentPage, 
        itemsPerPage, 
        searchTerm, 
        selectedCategory, 
        stockStatusFilter
      )
      setItems(result.data)
      setTotalItemsCountServer(result.count)
      
      const allResult = await itemService.getItems(userId, 1, 1000, '', 'Semua', 'all')
      setAllUserItems(allResult.data)
      await fetchTransactions(userId)
    } catch (err) {
      setError('Gagal memuat data inventori: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCompanyName = async (e) => {
    e.preventDefault()
    setSavingCompany(true)
    setError('')
    setSuccess('')
    try {
      const activeUser = user || (await supabase.auth.getUser()).data?.user
      if (!activeUser) throw new Error('Pengguna tidak terautentikasi.')
      
      // Menggunakan upsert agar jika baris profil belum ada, otomatis dibuatkan baru
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: activeUser.id,
          company_name: tempCompanyName,
          updated_at: new Date()
        })

      if (updateError) throw updateError
      
      setCompanyName(tempCompanyName)
      setIsEditingCompany(false)
      setSuccess('Nama perusahaan berhasil diperbarui dan disimpan secara permanen.')
    } catch (err) {
      setError('Gagal memperbarui nama perusahaan: ' + err.message)
    } finally {
      setSavingCompany(false)
    }
  }

  const fetchTransactions = async (userId) => {
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false })
      if (userId) {
        query = query.eq('user_id', userId)
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
            user_id: activeUser?.id
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
    const targetItem = allUserItems.find(i => String(i.id) === String(transItem)) || items.find(i => String(i.id) === String(transItem))
    if (!targetItem) {
      setError('Produk tidak ditemukan.')
      return
    }
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
          user_id: activeUser?.id
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
          user_id: activeUser?.id
        }
      ])
      await fetchData()
      setSuccess(`Stock Opname untuk ${item.title} berhasil disimpan.`)
      setOpnameInputs({ ...opnameInputs, [item.id]: '' })
    } catch (err) {
      setError('Gagal memproses Stock Opname: ' + err.message)
    }
  }

  const handleAddSupplier = (e) => {
    e.preventDefault()
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

  const handleImportCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const lines = text.split('\n').filter(line => line.trim() !== '')
        if (lines.length <= 1) {
          setError('File CSV kosong atau tidak memiliki data baris.')
          return
        }
        const firstLine = lines[0]
        const separator = firstLine.includes(';') ? ';' : ','
        const headers = firstLine.split(separator).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())
        const getIndex = (keywords) => {
          return headers.findIndex(h => keywords.some(keyword => h.includes(keyword)))
        }
        const titleIdx = getIndex(['nama', 'title', 'barang', 'product', 'item', 'produk'])
        const catIdx = getIndex(['kategori', 'category', 'jenis'])
        const stockIdx = getIndex(['stok', 'stock', 'qty', 'jumlah'])
        const priceIdx = getIndex(['harga', 'price', 'nilai', 'cost', 'satuan'])
        const skuIdx = getIndex(['sku', 'kode', 'code'])
        const locIdx = getIndex(['lokasi', 'location', 'rak', 'warehouse'])
        const supIdx = getIndex(['supplier', 'pemasok', 'vendor'])
        if (titleIdx === -1) {
          setError('Format CSV tidak dikenali: Kolom nama barang tidak ditemukan di baris header.')
          return
        }
        const activeUser = user || (await supabase.auth.getUser()).data?.user
        if (!activeUser) {
          setError('Pengguna tidak terautentikasi. Silakan login kembali.')
          return
        }
        let successCount = 0
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          const cols = line.split(separator).map(col => col.replace(/^"|"$/g, '').trim())
          
          const titleVal = titleIdx !== -1 ? cols[titleIdx] : ''
          if (!titleVal) continue
          const payload = {
            title: titleVal,
            category: (catIdx !== -1 && cols[catIdx]) ? cols[catIdx] : 'Lainnya',
            stock: (stockIdx !== -1 && cols[stockIdx]) ? (parseInt(cols[stockIdx], 10) || 0) : 0,
            price: (priceIdx !== -1 && cols[priceIdx]) ? (parseFloat(cols[priceIdx]) || 0) : 0,
            sku: (skuIdx !== -1 && cols[skuIdx]) ? cols[skuIdx] : 'SKU-' + Math.floor(1000 + Math.random() * 9000),
            location: (locIdx !== -1 && cols[locIdx]) ? cols[locIdx] : 'Gudang Utama',
            supplier: (supIdx !== -1 && cols[supIdx]) ? cols[supIdx] : 'Umum',
            user_id: activeUser.id
          }
          await itemService.createItem(payload)
          successCount++
        }
        await fetchData()
        setSuccess(`Berhasil mengimpor ${successCount} produk dari file CSV.`)
      } catch (err) {
        setError('Gagal memproses file CSV: ' + err.message)
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const totalItemsCount = allUserItems.length
  const totalValuation = allUserItems.reduce((acc, item) => acc + ((item.stock || 0) * (item.price || 0)), 0)
  const lowStockCount = allUserItems.filter(item => (item.stock || 0) > 0 && (item.stock || 0) < 2).length
  const outOfStockCount = allUserItems.filter(item => (item.stock || 0) === 0).length
  const uniqueCategories = ['Semua', ...new Set(allUserItems.map(item => item.category).filter(Boolean))]
  const totalPages = Math.ceil(totalItemsCountServer / itemsPerPage) || 1

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let reportTitle = 'Laporan Inventori Gudang'
    let contentHTML = ''
    if (activeTab === 'overview') {
      reportTitle = 'Laporan Ringkasan & Analitik Eksekutif'
      contentHTML = `
        <div class="summary-container">
          <div class="summary-card">
            <div class="summary-title">Total Jenis Produk</div>
            <div class="summary-value">${totalItemsCount} Item</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Total Valuasi Aset</div>
            <div class="summary-value">Rp ${totalValuation.toLocaleString('id-ID')}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Stok Menipis</div>
            <div class="summary-value">${lowStockCount} Item</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Stok Habis</div>
            <div class="summary-value">${outOfStockCount} Item</div>
          </div>
        </div>
        <h3 style="margin-top: 25px; margin-bottom: 10px; font-size: 11px; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #94a3b8; padding-bottom: 4px;">Rincian Valuasi Berdasarkan Kategori</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 8%;" class="text-center">No</th>
              <th style="width: 42%;">Kategori Produk</th>
              <th style="width: 20%;" class="text-center">Jumlah Jenis</th>
              <th style="width: 30%;" class="text-right">Total Valuasi Aset</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueCategories.filter(c => c !== 'Semua').map((cat, index) => {
              const catItems = allUserItems.filter(i => i.category === cat)
              const catValuation = catItems.reduce((acc, i) => acc + ((i.stock || 0) * (i.price || 0)), 0)
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td><b>${cat}</b></td>
                  <td class="text-center">${catItems.length} Item</td>
                  <td class="text-right">Rp ${catValuation.toLocaleString('id-ID')}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'inventory') {
      reportTitle = 'Laporan Manajemen Produk Inventori'
      contentHTML = `
        <div class="summary-container" style="grid-template-columns: repeat(2, 1fr);">
          <div class="summary-card">
            <div class="summary-title">Total Keseluruhan Item</div>
            <div class="summary-value">${totalItemsCount} Produk</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Total Nilai Valuasi Gudang</div>
            <div class="summary-value">Rp ${totalValuation.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;" class="text-center">No</th>
              <th style="width: 16%;">SKU / Kode</th>
              <th style="width: 29%;">Nama Produk</th>
              <th style="width: 15%;">Kategori</th>
              <th style="width: 10%;" class="text-center">Stok</th>
              <th style="width: 15%;" class="text-right">Harga Satuan</th>
              <th style="width: 10%;">Lokasi Rak</th>
            </tr>
          </thead>
          <tbody>
            ${allUserItems.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td><b>${item.sku || '-'}</b></td>
                <td>${item.title || ''}</td>
                <td>${item.category || 'Lainnya'}</td>
                <td class="text-center"><b>${item.stock || 0}</b></td>
                <td class="text-right">Rp ${(item.price || 0).toLocaleString('id-ID')}</td>
                <td>${item.location || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'opname') {
      reportTitle = 'Lembar Kerja Stock Opname Gudang'
      contentHTML = `
        <p style="margin-bottom: 15px; color: #475569; font-size: 10px;">Lembar audit fisik inventori gudang. Harap catat hasil perhitungan stok fisik di kolom yang tersedia.</p>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;" class="text-center">No</th>
              <th style="width: 15%;">SKU</th>
              <th style="width: 32%;">Nama Produk</th>
              <th style="width: 12%;" class="text-center">Stok Sistem</th>
              <th style="width: 13%;" class="text-center">Stok Fisik</th>
              <th style="width: 13%;" class="text-center">Selisih (+/-)</th>
              <th style="width: 10%;" class="text-center">Paraf</th>
            </tr>
          </thead>
          <tbody>
            ${allUserItems.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td><b>${item.sku || '-'}</b></td>
                <td>${item.title || ''}</td>
                <td class="text-center"><b>${item.stock || 0}</b></td>
                <td style="background: #fff;"></td>
                <td></td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'transactions') {
      reportTitle = 'Laporan Riwayat Mutasi Transaksi Gudang'
      contentHTML = `
        <table>
          <thead>
            <tr>
              <th style="width: 5%;" class="text-center">No</th>
              <th style="width: 22%;">Waktu / Tanggal</th>
              <th style="width: 30%;">Nama Produk</th>
              <th style="width: 13%;" class="text-center">Jenis Mutasi</th>
              <th style="width: 10%;" class="text-center">Qty</th>
              <th style="width: 20%;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map((tx, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${new Date(tx.created_at).toLocaleString('id-ID')}</td>
                <td><b>${tx.item_title || '-'}</b></td>
                <td class="text-center">
                  <span style="font-weight: bold; color: ${tx.type === 'MASUK' ? '#16a34a' : tx.type === 'KELUAR' ? '#dc2626' : '#2563eb'};">
                    ${tx.type}
                  </span>
                </td>
                <td class="text-center"><b>${tx.qty}</b></td>
                <td>${tx.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else if (activeTab === 'suppliers') {
      reportTitle = 'Laporan Daftar Mitra Supplier / Pemasok'
      contentHTML = `
        <table>
          <thead>
            <tr>
              <th style="width: 6%;" class="text-center">No</th>
              <th style="width: 32%;">Nama Supplier / Vendor</th>
              <th style="width: 24%;">Nomor Telepon</th>
              <th style="width: 38%;">Alamat Lengkap</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map((sup, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td><b>${sup.name}</b></td>
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
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 30px;
            font-size: 11px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 3px double #0f172a;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-info h1 {
            font-size: 18px;
            margin: 0 0 4px 0;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .company-info p {
            margin: 0;
            color: #64748b;
            font-size: 10px;
          }
          .report-meta {
            text-align: right;
          }
          .report-meta h2 {
            font-size: 13px;
            margin: 0 0 4px 0;
            color: #334155;
            text-transform: uppercase;
          }
          .report-meta p {
            margin: 0;
            color: #64748b;
            font-size: 10px;
          }
          .summary-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 25px;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            border-radius: 4px;
          }
          .summary-title {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .summary-value {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #94a3b8;
            padding: 7px 9px;
            text-align: left;
          }
          th {
            background-color: #e2e8f0;
            color: #0f172a;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            font-size: 10px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .footer-note {
            font-size: 9px;
            color: #64748b;
          }
          .signature-box {
            text-align: center;
            width: 180px;
          }
          .signature-space {
            height: 55px;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${companyName}</h1>
            <p>Pusat Manajemen Logistik & Pergudangan Terpadu</p>
          </div>
          <div class="report-meta">
            <h2>${reportTitle}</h2>
            <p>Dicetak Pada: ${currentDate}</p>
          </div>
        </div>
        ${contentHTML}
        <div class="footer">
          <div class="footer-note">
            <p>Dokumen ini dicetak otomatis secara elektronik dari sistem Enterprise Inventory.<br/>Sah dan berlaku tanpa tanda tangan basah apabila terverifikasi database.</p>
          </div>
          <div class="signature-box">
            <p>Mengetahui,</p>
            <div class="signature-space"></div>
            <p><b>Administrator / Kepala Gudang</b></p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const handleExportCSV = () => {
    let headers = ['ID', 'SKU', 'Nama Barang', 'Kategori', 'Stok', 'Harga Satuan (Rp)', 'Lokasi Rak', 'Supplier']
    let csvRows = [headers.join(';')]
    allUserItems.forEach(item => {
      csvRows.push([
        item.id,
        `"${item.sku || '-'}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.category || 'Lainnya')}"`,
        item.stock || 0,
        item.price || 0,
        `"${item.location || '-'}"`,
        `"${item.supplier || '-'}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `laporan_inventori_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSuccess('File laporan CSV berhasil diunduh.')
  }

  const handlePrintInvoice = (tx) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`<html><body><h3>Invoice #${tx.id}</h3><p>${tx.item_title} - ${tx.type} (${tx.qty} Unit)</p></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-16">
      <input 
        type="file" 
        accept=".csv,.xlsx" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleImportCSV} 
      />
      
      {/* Header Card dengan Fitur Edit Nama Perusahaan Inline */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Professional Print Layout Active</span>
              </span>
            </div>
            {/* Judul / Nama Perusahaan dengan Tombol Edit */}
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {companyName}
              </h1>
              {!isEditingCompany && (
                <button
                  onClick={() => {
                    setTempCompanyName(companyName)
                    setIsEditingCompany(true)
                  }}
                  className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 transition-all border border-indigo-500/30"
                  title="Ubah Nama Perusahaan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Form Edit Nama Perusahaan Inline */}
            {isEditingCompany && (
              <form onSubmit={handleUpdateCompanyName} className="flex items-center space-x-2 pt-2 max-w-md">
                <input
                  type="text"
                  required
                  value={tempCompanyName}
                  onChange={(e) => setTempCompanyName(e.target.value)}
                  placeholder="Nama Perusahaan Baru"
                  className="flex-1 bg-slate-800 border border-slate-600 px-3 py-1.5 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-all shadow-md"
                >
                  {savingCompany ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingCompany(false)
                    setTempCompanyName(companyName)
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all border border-slate-700"
                >
                  Batal
                </button>
              </form>
            )}
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Sistem terpadu dengan performa tinggi, analitik dan paginasi server.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-2 md:pt-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF ({activeTab.toUpperCase()})</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

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

      {activeTab === 'overview' && (
        <OverviewTab
          items={allUserItems}
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
          paginatedItems={items}
          filteredItems={items}
          searchTerm={searchTerm}
          setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          selectedCategory={selectedCategory}
          setSelectedCategory={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
          uniqueCategories={uniqueCategories}
          stockStatusFilter={stockStatusFilter}
          setStockStatusFilter={(val) => { setStockStatusFilter(val); setCurrentPage(1); }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          handleOpenModal={handleOpenModal}
          handleDelete={handleDelete}
          setIsScannerOpen={setIsScannerOpen}
        />
      )}
      {activeTab === 'opname' && (
        <OpnameTab
          items={allUserItems}
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
          setIsSupplierModalOpen={setIsSupplierModalOpen}
        />
      )}

      {/* Modal Produk */}
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
      )}

      {/* Modal Scanner */}
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
            </div>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-medium"
            >
              Tutup Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  )
}