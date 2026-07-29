import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { LogOut, Package } from 'lucide-react'


export const Navbar = () => {
 const navigate = useNavigate()


 const handleLogout = async () => {
   try {
     await supabase.auth.signOut()
     navigate('/login')
   } catch (error) {
     console.error('Gagal keluar:', error.message)
   }
 }


 return (
   <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
     {/* Bagian Kiri: Identitas Aplikasi */}
     <div className="flex items-center space-x-3">
       <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
         <Package className="w-5 h-5" />
       </div>
       <div>
         <h1 className="text-white font-bold text-base tracking-wide">Sistem Inventori</h1>
         <p className="text-xs text-slate-400">Manajemen Gudang</p>
       </div>
     </div>


     {/* Bagian Kanan: Tombol Keluar Terisolasi di Pojok Kanan Atas */}
     <div className="flex items-center">
       <button
         onClick={handleLogout}
         className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer"
       >
         <LogOut className="w-4 h-4" />
         <span>Keluar</span>
       </button>
     </div>
   </header>
 )
}
