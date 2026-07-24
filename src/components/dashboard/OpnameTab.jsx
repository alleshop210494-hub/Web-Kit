import React from 'react'
import { CheckSquare, Barcode, MapPin, RefreshCw } from 'lucide-react'

export const OpnameTab = ({ items, opnameInputs, setOpnameInputs, handleProcessOpname }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Stock Opname (Audit Fisik Gudang)</h2>
          <p className="text-sm text-slate-500">Periksa kecocokan stok sistem dengan jumlah fisik di rak penyimpanan secara langsung</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">SKU / Nama Barang</th>
              <th className="py-3.5 px-6">Kategori</th>
              <th className="py-3.5 px-6">Lokasi Rak</th>
              <th className="py-3.5 px-6">Stok Sistem</th>
              <th className="py-3.5 px-6">Stok Fisik Aktual</th>
              <th className="py-3.5 px-6 text-right">Aksi Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {items.map((item) => {
              const systemQty = item.stock || 0
              const physicalVal = opnameInputs[item.id] !== undefined ? opnameInputs[item.id] : ''

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
                  <td className="py-4 px-6 text-xs font-medium text-slate-600 flex items-center space-x-1 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{item.location || 'Rak Utama'}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {systemQty} Unit
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      min="0"
                      value={physicalVal}
                      onChange={(e) => setOpnameInputs({ ...opnameInputs, [item.id]: e.target.value })}
                      placeholder={systemQty.toString()}
                      className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleProcessOpname(item)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Simpan Opname</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}