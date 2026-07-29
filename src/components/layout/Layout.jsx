import React, { useState } from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar di atas */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Backdrop untuk HP saat sidebar terbuka */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Samping (Responsif Drawer / Statis di Desktop) */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 transform transition-transform duration-200 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <span className="font-bold text-lg text-gray-900">Menu Navigasi</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close Menu"
            >
              ✕
            </button>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            <a href="/dashboard" className="block px-4 py-2.5 rounded-lg text-blue-600 bg-blue-50 font-medium transition-colors">Dashboard</a>
            <a href="/transactions" className="block px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Transactions</a>
            <a href="/settings" className="block px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Settings</a>
          </nav>
        </aside>

        {/* Konten Utama yang otomatis menyesuaikan lebar layar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}