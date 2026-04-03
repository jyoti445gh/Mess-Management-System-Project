import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const email = params.get("email")

  const handleResend = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/forgot-password", { email })
      if (res.data.success) toast.success("Verification email sent again")
    } catch {
      toast.error("Failed to resend email")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-sm text-gray-500">We've sent a verification link to your email</p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-100">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg">Verify your email</CardTitle>
            <CardDescription>
              A link was sent to{" "}
              <span className="font-semibold text-gray-700">{email || "your email"}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 text-center">
              Click the link in your email to activate your account
            </div>

            <Button variant="outline" onClick={handleResend} className="w-full h-10">
              <RefreshCw className="mr-2 w-4 h-4" />
              Resend Email
            </Button>

            <Button onClick={() => navigate('/login')} className="w-full bg-green-600 hover:bg-green-700 h-10">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyEmail
