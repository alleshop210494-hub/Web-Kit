import React from 'react'

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} WebKit Pro. Built with React, Supabase, and Tailwind CSS.</p>
      </div>
    </footer>
  )
}