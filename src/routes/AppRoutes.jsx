import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Signup'
import UpdatePassword from '../components/UpdatePassword'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/update-password" element={<UpdatePassword />} />
    </Routes>
  )
}

export default AppRoutes