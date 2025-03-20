"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  User,
  Mail,
  Calendar,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  PenSquare,
} from "lucide-react"
import Link from "next/link"

interface Discussion {
  id: number | string
  title: string
  content: string
  comment_count: number
  created_at: string
  updated_at: string
  user_id: number | string
}

interface UserProfileType {
  id: number | string
  name: string
  email: string
  password: string
  created_at: string
  updated_at?: string
}

export default function UserProfile() {
  const [user, setUser] = useState<UserProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("profile") // "profile" or "discussions"
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false)
  const [discussionFormData, setDiscussionFormData] = useState({
    title: "",
    content: "",
  })
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [discussionsLoading, setDiscussionsLoading] = useState(false)
  const [discussionMessage, setDiscussionMessage] = useState({ text: "", type: "" })
  const [createDiscussionLoading, setCreateDiscussionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          const verifiedUser = await response.json()
          if (isMounted.current) {
            setUser(verifiedUser)

            // Initialize form data with user data
            setFormData({
              name: verifiedUser.name || "",
              email: verifiedUser.email || "",
              password: "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, []) // Add empty dependency array here

  // Wrap fetchUserDiscussions in useCallback to prevent it from being recreated on every render
  const fetchUserDiscussions = useCallback(async () => {
    if (!user) return

    setDiscussionsLoading(true)

    try {
      // Create an AbortController for the fetch request
      const controller = new AbortController()
      const signal = controller.signal

      const response = await fetch(`/api/discussions/user?id=${user.id}`, {
        signal,
      })

      // If the request was aborted or component unmounted, don't proceed
      if (signal.aborted || !isMounted.current) return

      const data = await response.json()

      if (data.success && isMounted.current) {
        setDiscussions(data.data)
        setTotalPages(data.totalPages || 1)
      } else if (isMounted.current) {
        setDiscussionMessage({
          text: "Failed to load discussions. Please try again.",
          type: "error",
        })
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Error fetching discussions:", error)
        setDiscussionMessage({
          text: "An error occurred while loading discussions.",
          type: "error",
        })
      }
    } finally {
      if (isMounted.current) {
        setDiscussionsLoading(false)
      }
    }
  }, [user]) // Only recreate when user changes

  useEffect(() => {
    // Only fetch discussions when the discussions tab is active and we have a user
    if (activeTab === "discussions" && user) {
      fetchUserDiscussions()
    }
  }, [activeTab, user, currentPage, fetchUserDiscussions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDiscussionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDiscussionFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
      })
    }
    setIsEditing(!isEditing)
    setMessage({ text: "", type: "" })
  }

  const toggleCreateDiscussion = () => {
    setIsCreatingDiscussion(!isCreatingDiscussion)
    setDiscussionFormData({
      title: "",
      content: "",
    })
    setDiscussionMessage({ text: "", type: "" })
  }

  const updateUserInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdateLoading(true)
    setMessage({ text: "", type: "" })

    try {
      // Security check - ensure the user can only update their own info
      if (!user || !user.id) {
        setMessage({ text: "Authentication error. Please log in again.", type: "error" })
        setUpdateLoading(false)
        return
      }

      const updateData = {
        id: user.id, // Ensure this is the logged-in user's ID
        name: formData.name,
        email: formData.email,
        password: formData.password || user.password, // Keep existing password if not changed
      }

      const response = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify(updateData),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        // Update local user state with new data
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })

        setMessage({ text: "Profile updated successfully!", type: "success" })
        setIsEditing(false)
      } else {
        setMessage({ text: result.error || "Failed to update profile", type: "error" })
      }
    } catch (error) {
      console.error("Error updating user info:", error)
      setMessage({ text: "An error occurred while updating your profile", type: "error" })
    } finally {
      setUpdateLoading(false)
    }
  }

  const createDiscussion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form
    if (!discussionFormData.title.trim() || !discussionFormData.content.trim()) {
      setDiscussionMessage({ text: "Title and content are required", type: "error" })
      return
    }

    setCreateDiscussionLoading(true)
    setDiscussionMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          author: user?.name,
          title: discussionFormData.title,
          content: discussionFormData.content,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setDiscussionMessage({ text: "Discussion created successfully!", type: "success" })
        setDiscussionFormData({
          title: "",
          content: "",
        })

        // Refresh discussions list
        fetchUserDiscussions()

        // Close the create form after a delay
        setTimeout(() => {
          if (isMounted.current) {
            setIsCreatingDiscussion(false)
            setDiscussionMessage({ text: "", type: "" })
          }
        }, 2000)
      } else {
        setDiscussionMessage({ text: result.error || "Failed to create discussion", type: "error" })
      }
    } catch (error) {
      console.error("Error creating discussion:", error)
      setDiscussionMessage({ text: "An error occurred while creating your discussion", type: "error" })
    } finally {
      setCreateDiscussionLoading(false)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return dateString
    }
  }

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
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
            <h2 className="text-2xl font-bold text-[#000100] mb-4">User Not Found</h2>
            <p className="text-[#A1A6B4] mb-6">
              We couldn&lsquo;t find your user profile. Please try logging in again.
            </p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#000100]">My Account</h1>
          <p className="text-[#A1A6B4] mt-2">Manage your profile and discussions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            <button type="button"
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-1 font-medium ${
                activeTab === "profile"
                  ? "text-[#000100] border-b-2 border-[#000100]"
                  : "text-[#A1A6B4] hover:text-[#000100]"
              } transition-colors duration-200`}
            >
              Profile
            </button>
            <button type="button"
              onClick={() => setActiveTab("discussions")}
              className={`pb-4 px-1 font-medium ${
                activeTab === "discussions"
                  ? "text-[#000100] border-b-2 border-[#000100]"
                  : "text-[#A1A6B4] hover:text-[#000100]"
              } transition-colors duration-200`}
            >
              My Discussions
            </button>
          </div>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <>
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

            {/* Profile Card */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#94C5CC] flex items-center justify-center text-white font-bold mr-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#000100]">{isEditing ? "Edit Profile" : "My Profile"}</h2>
                    <p className="text-[#A1A6B4]">Member since {formatDate(user.created_at)}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button type="button"
                    onClick={toggleEditMode}
                    className="px-4 py-2 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    title="Cancel editing profile"
                    onClick={toggleEditMode}
                    className="p-2 rounded-full hover:bg-[#F8F8F8] transition-colors duration-200"
                  >
                    <X className="text-[#A1A6B4]" size={20} />
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6">
                {!isEditing ? (
                  // View mode
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[#A1A6B4] text-sm">Full Name</p>
                        <div className="flex items-center p-4 bg-[#F8F8F8] rounded-lg">
                          <User className="text-[#A1A6B4] mr-3" size={20} />
                          <p className="text-[#000100] font-medium">{user.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[#A1A6B4] text-sm">Email Address</p>
                        <div className="flex items-center p-4 bg-[#F8F8F8] rounded-lg">
                          <Mail className="text-[#A1A6B4] mr-3" size={20} />
                          <p className="text-[#000100] font-medium">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {user.updated_at && (
                      <div className="text-sm text-[#A1A6B4] flex items-center mt-4">
                        <Calendar size={16} className="mr-2" />
                        <span>Last updated: {formatDate(user.updated_at)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit mode
                  <form onSubmit={updateUserInfo} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-[#A1A6B4] text-sm">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-[#A1A6B4] text-sm">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-[#A1A6B4] text-sm">
                        Password (leave blank to keep current)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter new password to change"
                          className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                        />
                        <button
                          type="button" title="Show Password"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A1A6B4]"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="button"
                        onClick={toggleEditMode}
                        className="px-6 py-3 rounded-lg border border-[#A1A6B4] text-[#A1A6B4] font-medium hover:bg-[#F8F8F8] transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center justify-center"
                      >
                        {updateLoading ? (
                          <>
                            <Loader2 size={18} className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        )}

        {/* Discussions Tab Content */}
        {activeTab === "discussions" && (
          <>
            {/* Discussions Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#000100]">My Discussions</h2>
              {!isCreatingDiscussion && (
                <button type="button"
                  onClick={toggleCreateDiscussion}
                  className="px-4 py-2 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  New Discussion
                </button>
              )}
            </div>

            {/* Discussion Message */}
            {discussionMessage.text && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  discussionMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {discussionMessage.text}
              </div>
            )}

            {/* Create Discussion Form */}
            {isCreatingDiscussion && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#000100] flex items-center">
                    <PenSquare size={20} className="mr-2" />
                    Create New Discussion
                  </h3>
                  <button
                    type="button"
                    title="Cancel creating discussion"
                    onClick={toggleCreateDiscussion}
                    className="p-2 rounded-full hover:bg-[#F8F8F8] transition-colors duration-200"
                  >
                    <X className="text-[#A1A6B4]" size={20} />
                  </button>
                </div>

                <form onSubmit={createDiscussion} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-[#A1A6B4] text-sm">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={discussionFormData.title}
                      onChange={handleDiscussionInputChange}
                      className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                      placeholder="Enter discussion title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="content" className="text-[#A1A6B4] text-sm">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={discussionFormData.content}
                      onChange={handleDiscussionInputChange}
                      className="w-full p-4 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC] min-h-[150px]"
                      placeholder="Write your discussion content here..."
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={createDiscussionLoading}
                      className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center justify-center"
                    >
                      {createDiscussionLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Discussion"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Discussions List */}
            {discussionsLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="animate-spin text-[#A1A6B4]" size={30} />
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-6">
                {discussions.map((discussion) => (
                  <Link
                    key={discussion.id}
                    href={`/discussions/${discussion.id}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-[#000100] mb-2 hover:text-[#94C5CC] transition-colors duration-200">
                        {discussion.title}
                      </h3>
                      <p className="text-[#A1A6B4] mb-4">{discussion.content}</p>
                      <div className="flex items-center text-sm text-[#A1A6B4]">
                        <Calendar size={16} className="mr-2" />
                        <span>{formatDate(discussion.created_at)}</span>
                      </div>
                      <div className="flex items-center text-sm text-[#A1A6B4] mt-2">
                        <MessageCircle size={16} className="mr-2" />
                        <span>{discussion.comment_count} comments</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button type="button" title="Previous"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border ${
                        currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-[#A1A6B4] text-[#A1A6B4] hover:bg-[#F8F8F8]"
                      } transition-colors duration-200`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-[#A1A6B4]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button type="button" title="Next"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border ${
                        currentPage === totalPages
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-[#A1A6B4] text-[#A1A6B4] hover:bg-[#F8F8F8]"
                      } transition-colors duration-200`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <MessageCircle size={40} className="mx-auto text-[#A1A6B4] mb-4" />
                <h3 className="text-xl font-semibold text-[#000100] mb-2">No discussions yet</h3>
                <p className="text-[#A1A6B4] mb-6">You haven&lsquo;t created any discussions yet.</p>
                <button type="button"
                  onClick={toggleCreateDiscussion}
                  className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 inline-flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Create Your First Discussion
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
