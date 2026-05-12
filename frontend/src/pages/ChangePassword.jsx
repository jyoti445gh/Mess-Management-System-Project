import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

const WEAK_PASSWORDS = ["password", "123456", "password1", "qwerty", "abc123", "letmein", "welcome", "monkey", "dragon", "master"]

const inputCls = "h-10 focus-visible:border-green-500 focus-visible:ring-3 focus-visible:ring-green-500/30"

const ChangePassword = () => {
  const { email } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRegistration = searchParams.get('type') === 'registration'

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validatePassword = (pw) => {
    if (!pw) return "Password is required"
    if (pw.length < 6) return "Password must be at least 6 characters"
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter"
    if (!/\d/.test(pw)) return "Password must contain at least one number"
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "Password must contain at least one special character (!@#$…)"
    if (WEAK_PASSWORDS.includes(pw.toLowerCase())) return "Password is too common. Please choose a stronger password"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.newPassword || !formData.confirmPassword) {
      return setError("All fields are required")
    }

    const pwError = validatePassword(formData.newPassword)
    if (pwError) return setError(pwError)

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match")
    }

    try {
      setIsLoading(true)
      const res = await axios.post(
        `http://localhost:8000/api/auth/change-password/${email}`,
        { newPassword: formData.newPassword }
      )
      toast.success(res.data.message || "Password updated successfully!")
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-2xl shadow-lg shadow-green-200 mb-2">
            <LockKeyhole className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegistration ? 'Set your password' : 'Set new password'}
          </h1>
          <p className="text-sm text-gray-500">
            For <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {isRegistration ? 'Create Password' : 'Change Password'}
            </CardTitle>
            <CardDescription>
              {isRegistration
                ? 'Set a strong password to secure your account'
                : 'Choose a strong new password for your account'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 h-10"
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                  : isRegistration ? 'Set Password & Continue' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  )
}

export default ChangePassword
