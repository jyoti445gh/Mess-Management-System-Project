import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

const VerifyOTP = () => {
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef([])
  const { email } = useParams()
  const navigate = useNavigate()

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const updated = [...otp]
    updated[index] = value
    setOtp(updated)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const finalOtp = otp.join("")
    if (finalOtp.length !== 6) return setError("Please enter all 6 digits")

    try {
      setIsLoading(true)
      setError("")
      const res = await axios.post(`http://localhost:8000/api/auth/verify-otp/${email}`, { otp: finalOtp })
      toast.success(res.data.message)
      setIsVerified(true)
      setTimeout(() => navigate(`/change-password/${email}`), 1500)
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""])
    setError("")
    inputRefs.current[0]?.focus()
  }

  const resendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/forgot-password", { email })
      toast.success(res.data.message)
    } catch {
      toast.error("Failed to resend OTP")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-2xl shadow-lg shadow-green-200 mb-2">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-sm text-gray-500">
            We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Enter OTP</CardTitle>
            <CardDescription>
              {isVerified ? "Verification successful! Redirecting..." : "Enter the code from your email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isVerified ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600 w-8 h-8" />
                </div>
                <p className="text-sm text-gray-600">Redirecting to change password...</p>
                <Loader2 className="animate-spin w-4 h-4 text-green-600" />
              </div>
            ) : (
              <>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-12 text-center text-xl font-bold p-0"
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <Button onClick={handleVerify} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 h-10">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify OTP"}
                  </Button>
                  <Button variant="outline" onClick={clearOtp} className="w-full h-10">
                    <RotateCcw className="mr-2 w-4 h-4" />
                    Clear
                  </Button>
                  <Button variant="ghost" onClick={resendOtp} className="w-full h-10 text-green-600 hover:text-green-700">
                    Resend OTP
                  </Button>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Wrong email?{" "}
              <Link to="/forgot-password" className="text-green-600 hover:underline">Go back</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default VerifyOTP
