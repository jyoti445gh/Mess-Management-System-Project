import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import API from '@/api/axios'

const AuthSuccess = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me")
        if (res.data.success) {
          login(res.data)
          const role = res.data.user.role
          setTimeout(() => {
            if (role === "admin") navigate("/admin")
            else if (role === "mess_manager") navigate("/manager")
            else navigate("/student")
          }, 1500)
        }
      } catch {
        navigate("/login")
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Authentication Successful</h1>
        <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
        <Loader2 className="w-5 h-5 text-green-600 animate-spin mx-auto" />
      </div>
    </div>
  )
}

export default AuthSuccess
