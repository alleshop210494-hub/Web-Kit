import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Signup'
import UpdatePassword from '../components/UpdatePassword'
import { supabase } from '../services/supabase'

export function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    // Mendeteksi jika link email membuka token pemulihan password
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

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