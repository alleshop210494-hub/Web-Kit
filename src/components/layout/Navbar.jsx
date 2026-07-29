import React from 'react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Tombol Hamburger khusus untuk HP / Tablet kecil */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">SaaS Dashboard</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Halo, Admin</span>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow-inner">
            A
          </div>
        </div>
      </div>
    </header>
  );
}