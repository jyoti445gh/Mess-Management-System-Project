import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

const ChangePassword = () => {
  const { email } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!formData.newPassword || !formData.confirmPassword) return setError("All fields are required")
    if (formData.newPassword.length < 6) return setError("Password must be at least 6 characters")
    if (formData.newPassword !== formData.confirmPassword) return setError("Passwords do not match")

    try {
      setIsLoading(true)
      const res = await axios.post(`http://localhost:8000/api/auth/change-password/${email}`, {
        newPassword: formData.newPassword
      })
      toast.success(res.data.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-2xl shadow-lg shadow-green-200 mb-2">
            <LockKeyhole className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-sm text-gray-500">
            For <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Change Password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="h-10"
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 h-10">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ChangePassword
