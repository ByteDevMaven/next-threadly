"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PenSquare, Loader2, ArrowLeft } from "lucide-react"

export default function CreateDiscussion() {
  const router = useRouter()
  interface User {
    id: string;
    name: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  // Ref for component mounted state
  const isMounted = useRef(true)

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true

    return () => {
      // Set isMounted to false when component unmounts
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          const userData = await response.json()
          if (isMounted.current) {
            setUser(userData)
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error checking authentication:", error.message)
        } else {
          console.error("Error checking authentication:", error)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    checkAuth()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form
    if (!formData.title.trim() || !formData.content.trim()) {
      setMessage({ text: "Title and content are required", type: "error" })
      return
    }

    setCreateLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          author: user?.name,
          title: formData.title,
          content: formData.content,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ text: "Discussion created successfully!", type: "success" })

        // Reset form
        setFormData({
          title: "",
          content: "",
        })

        // Redirect to the new discussion after a short delay
        setTimeout(() => {
          if (isMounted.current) {
            router.push(`/discussions/${result.discussion.id}`)
          }
        }, 1500)
      } else {
        setMessage({ text: result.error || "Failed to create discussion", type: "error" })
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating discussion:", error.message)
      } else {
        console.error("Error creating discussion:", error)
      }
      setMessage({ text: "An error occurred while creating your discussion", type: "error" })
    } finally {
      if (isMounted.current) {
        setCreateLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-[#A1A6B4]" size={30} />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-[#000100] mb-4">Authentication Required</h2>
            <p className="text-[#A1A6B4] mb-6">You need to be logged in to create a discussion.</p>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] py-12">
      <div className="container mx-auto px-4">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/discussions" className="text-[#A1A6B4] hover:text-[#000100] flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Back to Discussions
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#000100]">Create Discussion</h1>
          <p className="text-[#A1A6B4] mt-2">Share your thoughts with the community</p>
        </div>

        {/* Message display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Create Discussion Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-[#000100] flex items-center">
              <PenSquare size={24} className="mr-3" />
              New Discussion
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-[#A1A6B4] text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                placeholder="Enter a descriptive title for your discussion"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="block text-[#A1A6B4] text-sm font-medium">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC] min-h-[250px]"
                placeholder="Share your thoughts, questions, or ideas in detail..."
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-end">
              <Link
                href="/discussions"
                className="px-6 py-3 rounded-lg border border-[#A1A6B4] text-[#A1A6B4] font-medium hover:bg-[#F8F8F8] transition-colors duration-200 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createLoading}
                className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center justify-center"
              >
                {createLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Publish Discussion"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Author Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#94C5CC] flex items-center justify-center text-white font-bold mr-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[#000100]">Posting as {user.name}</p>
              <p className="text-sm text-[#A1A6B4]">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
