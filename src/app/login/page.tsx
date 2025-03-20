"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { triggerAuthChange } from "../utils/auth"
import { Mail, Lock, LogIn, AlertCircle, Loader2, ArrowRight } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  interface LoginResponse {
    ok: boolean
    message?: string
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response: Response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        triggerAuthChange()
        router.push("/")
      } else {
        const { message }: LoginResponse = await response.json()
        setError(message || "An error occurred.")
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error("An unknown error occurred.")
      }
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8F8] p-4">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#000100]">Welcome Back</h1>
          <p className="text-[#A1A6B4] mt-2">Sign in to continue to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 flex items-start">
              <AlertCircle className="text-red-500 mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#000100] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#A1A6B4]" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#A1A6B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94C5CC] focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#000100] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#A1A6B4]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#A1A6B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94C5CC] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-[#000100] text-white rounded-lg hover:bg-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#94C5CC] transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-[#A1A6B4]">
                Don&lsquo;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#94C5CC] hover:text-[#000100] font-medium inline-flex items-center transition-colors"
                >
                  Sign up now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
