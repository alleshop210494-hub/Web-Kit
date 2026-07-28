import React from 'react'
import { Camera, X } from 'lucide-react'

export const ScannerModal = ({
  isScannerOpen,
  setIsScannerOpen,
  videoRef
}) => {
  if (!isScannerOpen) return null

  return (
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
  )
}