import React, { useState } from 'react'
import { Search, Plus, ArrowUpRight, ArrowDownLeft, FileText, Calendar, X } from 'lucide-react'


export const TransactionsTab = ({
 transactions = [],
 items = [],
 onAddTransaction
}) => {
 const [searchTerm, setSearchTerm] = useState('')
 const [isModalOpen, setIsModalOpen] = useState(false)
  // State form transaksi baru
 const [formData, setFormData] = useState({
   itemId: '',
   type: 'in', // 'in' (Masuk) atau 'out' (Keluar)
   quantity: 1,
   notes: ''
 })


 const handleOpenModal = () => {
   setFormData({
     itemId: items.length > 0 ? items[0].id : '',
     type: 'in',
     quantity: 1,
     notes: ''
   })
   setIsModalOpen(true)
 }


 const handleSubmit = (e) => {
   e.preventDefault()
   if (!formData.itemId) return


   const selectedItem = items.find(i => String(i.id) === String(formData.itemId))
  
   const newTransaction = {
     id: Date.now().toString(),
     itemId: formData.itemId,
     itemTitle: selectedItem ? (selectedItem.title || selectedItem.name || selectedItem.nama) : 'Produk',
     type: formData.type,
     quantity: Number(formData.quantity),
     notes: formData.notes,
     date: new Date().toISOString()
   }


   if (onAddTransaction) {
     onAddTransaction(newTransaction)
   }
   setIsModalOpen(false)
 }


 const filteredTransactions = transactions.filter(tx =>
   (tx.itemTitle || tx.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
   (tx.notes || tx.catatan || '').toLowerCase().includes(searchTerm.toLowerCase())
 )


 return (
   <div className="space-y-6">
     {/* Toolbar & Search Bar */}
     <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
       <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input
             type="text"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             placeholder="Cari berdasarkan nama produk atau catatan transaksi..."
             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
           />
         </div>
         <div className="flex items-center gap-2">
           <button
             onClick={handleOpenModal}
             className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all cursor-pointer"
           >
             <Plus className="w-4 h-4" />
             <span>Catat Transaksi Baru</span>
           </button>
         </div>
       </div>
     </div>


     {/* Table Transaksi */}
     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
               <th className="py-3.5 px-4 sm:px-6">Waktu / Tanggal</th>
               <th className="py-3.5 px-4">Produk</th>
               <th className="py-3.5 px-4 text-center">Tipe</th>
               <th className="py-3.5 px-4 text-center">Jumlah</th>
               <th className="py-3.5 px-4">Catatan</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 text-sm">
             {filteredTransactions.length === 0 ? (
               <tr>
                 <td colSpan="5" className="py-12 text-center text-slate-400">
                   <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                   <p>Belum ada riwayat transaksi.</p>
                 </td>
               </tr>
             ) : (
               filteredTransactions.map((tx) => {
                 const isIn = tx.type === 'in' || tx.tipe === 'in' || tx.type === 'masuk'
                 return (
                   <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                     <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                       <div className="flex items-center space-x-1.5">
                         <Calendar className="w-3.5 h-3.5 text-slate-400" />
                         <span>
                           {tx.date
                             ? new Date(tx.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                             : (tx.tanggal || '-')}
                         </span>
                       </div>
                     </td>
                     <td className="py-3.5 px-4 font-semibold text-slate-900">
                       {tx.itemTitle || tx.title || tx.namaProduk || '-'}
                     </td>
                     <td className="py-3.5 px-4 text-center">
                       <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                         isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                       }`}>
                         {isIn ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                         <span>{isIn ? 'Barang Masuk' : 'Barang Keluar'}</span>
                       </span>
                     </td>
                     <td className={`py-3.5 px-4 text-center font-bold ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {isIn ? '+' : '-'}{tx.quantity || tx.jumlah || 0} unit
                     </td>
                     <td className="py-3.5 px-4 text-xs text-slate-600">
                       {tx.notes || tx.catatan || '-'}
                     </td>
                   </tr>
                 )
               })
             )}
           </tbody>
         </table>
       </div>
     </div>


     {/* Modal Form Catat Transaksi Baru */}
     {isModalOpen && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
         <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
           <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
             <h3 className="text-lg font-bold text-slate-900">Catat Transaksi Baru</h3>
             <button
               onClick={() => setIsModalOpen(false)}
               className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
             >
               <X className="w-5 h-5" />
             </button>
           </div>


           <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Produk</label>
               <select
                 required
                 value={formData.itemId}
                 onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
               >
                 <option value="" disabled>-- Pilih Produk --</option>
                 {items.map(item => (
                   <option key={item.id} value={item.id}>
                     {item.title || item.name || item.nama} (Stok: {item.stock || item.quantity || 0})
                   </option>
                 ))}
               </select>
             </div>


             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Transaksi</label>
               <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setFormData({ ...formData, type: 'in' })}
                   className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                     formData.type === 'in'
                       ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                       : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                   }`}
                 >
                   <ArrowDownLeft className="w-4 h-4" />
                   <span>Barang Masuk</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setFormData({ ...formData, type: 'out' })}
                   className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                     formData.type === 'out'
                       ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                       : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                   }`}
                 >
                   <ArrowUpRight className="w-4 h-4" />
                   <span>Barang Keluar</span>
                 </button>
               </div>
             </div>


             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Unit</label>
               <input
                 type="number"
                 min="1"
                 required
                 value={formData.quantity}
                 onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
               />
             </div>


             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan / Keterangan</label>
               <textarea
                 rows="3"
                 value={formData.notes}
                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                 placeholder="Contoh: Restock dari supplier / Penjualan offline"
                 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
               />
             </div>


             <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
               <button
                 type="button"
                 onClick={() => setIsModalOpen(false)}
                 className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all cursor-pointer"
               >
                 Simpan Transaksi
               </button>
             </div>
           </form>
         </div>
       </div>
     )}
   </div>
 )
}
