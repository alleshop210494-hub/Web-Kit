import React from 'react'
import { FileText, Printer, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'

export const TransactionsTab = ({ transactions, setIsTransModalOpen, handlePrintInvoice }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Mutasi & Transaksi Gudang</h2>
          <p className="text-sm text-slate-500">Catat dan pantau seluruh arus masuk, keluar, serta hasil stock opname barang</p>
        </div>
        <button
          onClick={() => setIsTransModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <span>Catat Transaksi Baru</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-medium">Belum ada riwayat transaksi tercatat</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Waktu & Tanggal</th>
                <th className="py-3.5 px-6">Jenis Mutasi</th>
                <th className="py-3.5 px-6">Nama Produk</th>
                <th className="py-3.5 px-6">Jumlah</th>
                <th className="py-3.5 px-6">Keterangan</th>
                <th className="py-3.5 px-6">Operator</th>
                <th className="py-3.5 px-6 text-right">Cetak Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {transactions.map((tx) => {
                const isMasuk = tx.type === 'MASUK'
                const isOpname = tx.type === 'OPNAME'

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/85 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold ${isMasuk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isOpname ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {isMasuk ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : isOpname ? <RefreshCw className="w-3 h-3 text-indigo-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {tx.item_title}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {tx.qty} Unit
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                      {tx.notes || '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {tx.user_email || 'Admin'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handlePrintInvoice(tx)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition inline-flex items-center"
                        title="Cetak Invoice Mutasi"
                      >
                        <Printer className="w-4 h-4" />
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
  )
}