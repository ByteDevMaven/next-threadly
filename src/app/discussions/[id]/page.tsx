"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Calendar, MessageSquare, ArrowLeft, Loader2, Send } from "lucide-react"

interface Comment {
    id: number | string
    user_id: number | string
    content: string
    created_at: string
    author: string
}

interface Discussion {
    id: number | string
    author: string,
    title: string
    content: string
    created_at: string
    updated_at: string
    comments: Comment[]
}

export default function DiscussionDetails() {
    const params = useParams()
    const [discussion, setDiscussion] = useState<Discussion | null>(null)
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [commentLoading, setCommentLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    // Add a ref to track if the component is mounted
    const isMounted = useRef(true)

    useEffect(() => {
        // Set isMounted to true when component mounts
        isMounted.current = true

        // Create an AbortController for the fetch request
        const controller = new AbortController()
        const signal = controller.signal

        async function fetchDiscussion() {
            // Important: Set loading state before the async operation
            if (isMounted.current) {
                setLoading(true)
            }

            try {
                const response = await fetch(`/api/discussions/${params.id}`, {
                    signal, // Pass the signal to fetch
                })

                // If the request was aborted or component unmounted, don't proceed
                if (signal.aborted || !isMounted.current) return

                const data = await response.json()

                if (data.success && isMounted.current) {
                    setDiscussion({
                        ...data.discussion,
                        comments: data.comments || [], // Ensure comments is an array
                    })

                    if (isMounted.current) {
                        setLoading(false)
                    }
                } else if (isMounted.current) {
                    setNotFound(true)
                    setLoading(false)
                }
            } catch (error: unknown) {
                // Only log errors if they're not from aborting and component is mounted
                if (error instanceof Error && error.name !== "AbortError" && isMounted.current) {
                    console.error("Error fetching discussion:", error)
                    setNotFound(true)
                    setLoading(false)
                }
            }
        }

        fetchDiscussion()

        // Cleanup function to abort fetch and mark component as unmounted
        return () => {
            isMounted.current = false
            controller.abort()
        }
    }, [params.id])

    const addComment = async () => {
        if (!newComment.trim() || !discussion) return

        setCommentLoading(true)

        try {
            const userId = sessionStorage.getItem("user_id")

            const response = await fetch("/api/comments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    post_id: discussion.id,
                    content: newComment,
                    comments_count: discussion.comments?.length || 0,
                }),
            })

            const data = await response.json()

            if (data.success && isMounted.current) {
                setDiscussion({
                    ...discussion,
                    comments: [...(discussion.comments || []), data.comment], // Safely append new comment
                })
                setNewComment("")
            } else if (isMounted.current) {
                console.error("Error adding comment:", data.error)
            }
        } catch (error) {
            if (isMounted.current) {
                console.error("Error:", error)
            }
        } finally {
            if (isMounted.current) {
                setCommentLoading(false)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#94C5CC]" />
                <p className="mt-4 text-[#A1A6B4] font-medium">Loading discussion...</p>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen py-12 text-center">
                <h1 className="text-4xl font-bold">Discussion Not Found</h1>
                <p className="text-[#A1A6B4] mb-8">The discussion you&lsquo;re looking for doesn&lsquo;t exist.</p>
                <Link href="/discussions" className="px-6 py-3 bg-[#000100] text-white rounded-lg">
                    Back to Discussions
                </Link>
            </div>
        )
    }

    if (!discussion) {
        return null // Safety check
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link href="/discussions" className="text-[#A1A6B4] hover:text-[#000100] flex items-center">
                        <ArrowLeft size={18} className="mr-2" /> Back to Discussions
                    </Link>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold mb-2">{discussion.title}</h1>
                    <h2 className="font-bold mb-2">Author: {discussion.author}</h2>
                    <p className="text-sm mb-4">{discussion.content}</p>
                    <div className="flex items-center text-sm text-[#A1A6B4] mb-4">
                        <Calendar size={16} className="mr-2" />
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                    </div>

                    <h2 className="text-2xl font-bold flex items-center mb-4">
                        <MessageSquare size={20} className="mr-2" /> Comments
                    </h2>

                    <div className="mb-4">
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94C5CC] focus:border-transparent"
                                disabled={commentLoading}
                            />
                            <button
                                onClick={addComment}
                                disabled={commentLoading || !newComment.trim()}
                                className="ml-2 px-4 py-3 bg-[#000100] text-white rounded-lg hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {commentLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} className="mr-2" />
                                        Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {discussion.comments && discussion.comments.length > 0 ? (
                        discussion.comments.map((comment) => (
                            <div key={comment.id} className="p-4 bg-[#F1F1F1] rounded-lg mb-2">
                                <div className="flex items-center mb-2">
                                    <span className="font-bold mr-2">
                                        {String(comment.user_id) === String(sessionStorage.getItem("user_id")) ? "You" : comment.author}
                                    </span>
                                    <span className="text-sm text-[#A1A6B4]">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p>{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[#A1A6B4]">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}
