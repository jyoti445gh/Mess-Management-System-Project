import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Green focus style applied to all inputs on this page
const inputCls = "h-10 focus-visible:border-green-500 focus-visible:ring-3 focus-visible:ring-green-500/30"

const WEAK_PASSWORDS = ["password", "123456", "password1", "qwerty", "abc123", "letmein", "welcome", "monkey", "dragon", "master"]

const Signup = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

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
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("All fields are required")
    }
    if (!formData.email.includes('@')) {
      return toast.error("Email must contain @ symbol")
    }
    const pwError = validatePassword(formData.password)
    if (pwError) return toast.error(pwError)

    try {
      setIsLoading(true)
      const res = await axios.post("http://localhost:8000/api/auth/register", formData)
      if (res.data.success) {
        toast.success(res.data.message)
        navigate(`/verify-otp/${formData.email}?type=registration`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-2xl shadow-lg shadow-green-200 mb-2">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-sm text-gray-500">Join MessMate to manage your meals</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign up</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jyoti Nehara"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="jyoti@gmail.com"
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    onChange={handleChange}
                    className={`${inputCls} pr-10`}
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

            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 h-10">
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                  : "Create account"}
              </Button>

              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  )
}

export default Signup
