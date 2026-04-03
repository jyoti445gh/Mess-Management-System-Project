import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const Verify = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading") // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/user/verify/${token}`)
        if (res.data.success) {
          setStatus("success")
          toast.success("Email verified successfully")
        }
      } catch {
        setStatus("error")
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-gray-100 text-center">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-3">
              {status === "loading" && (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {status === "error" && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </div>
            <CardTitle className="text-lg">
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait a moment"}
              {status === "success" && "Your account is now active. You can sign in."}
              {status === "error" && "The link may be expired or invalid."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-2">
            {status === "success" && (
              <Button onClick={() => navigate('/login')} className="w-full bg-green-600 hover:bg-green-700 h-10">
                Go to Login
              </Button>
            )}
            {status === "error" && (
              <Button variant="outline" onClick={() => navigate('/verify')} className="w-full h-10">
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Verify
