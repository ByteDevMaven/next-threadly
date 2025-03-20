"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Calendar, Loader2, MessageCircle, PlusCircle } from "lucide-react"

interface Discussion {
    id: number
    title: string
    content: string
    comment_count: number
    created_at: string
    updated_at: string
}

export default function Discussions() {
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [discussions, setDiscussions] = useState<Discussion[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [isFetching, setIsFetching] = useState(true) // Start with true to show initial loader
    const [endOfDiscussions, setEndOfDiscussions] = useState(false)

    // Add a ref to track if the component is mounted
    const isMounted = useRef(true)

    useEffect(() => {
        // Set isMounted to true when component mounts
        isMounted.current = true

        // Create an AbortController for the fetch request
        const controller = new AbortController()
        const signal = controller.signal

        async function fetchDiscussions() {
            // Important: Set loading states before the async operation
            if (isMounted.current) {
                setIsFetching(true)
                // Only set loading to true for pagination requests, not initial load
                if (page > 1) {
                    setLoading(true)
                }
            }

            try {
                const response = await fetch(`/api/discussions?page=${page}&limit=5`, {
                    signal, // Pass the signal to fetch
                })

                // If the request was aborted or component unmounted, don't proceed
                if (signal.aborted || !isMounted.current) return

                const data = await response.json()

                if (data.success && isMounted.current) {
                    setDiscussions((prev) => {
                        const existingIds = new Set(prev.map((discussion) => discussion.id))

                        const newDiscussions = data.data.filter((discussion: Discussion) => !existingIds.has(discussion.id))

                        const updatedDiscussions = [...prev, ...newDiscussions]

                        if (isMounted.current) {
                            setTotalPages(data.totalPages)

                            if (page >= data.totalPages) {
                                setEndOfDiscussions(true)
                            }
                        }

                        if (isMounted.current) {
                            setIsFetching(false)
                            setLoading(false)
                        }

                        return updatedDiscussions
                    })
                } else if (isMounted.current) {
                    console.error("Error fetching discussions:", data.error)
                }
            } catch (error: unknown) {
                // Only log errors if they're not from aborting and component is mounted
                if (error instanceof Error && error.name !== "AbortError" && isMounted.current) {
                    console.error("Error fetching discussions:", error)
                }
            }
        }

        fetchDiscussions()

        // Cleanup function to abort fetch and mark component as unmounted
        return () => {
            isMounted.current = false
            controller.abort()
        }
    }, [page])

    const filteredDiscussions = discussions.filter(
        (d) =>
            d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-[#F8F8F8] py-12">
            <div className="container mx-auto px-4">
                {/* Header with title and create button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-[#000100]">Discussions</h1>
                        <p className="text-[#A1A6B4] mt-2">Join the conversation and share your thoughts</p>
                    </div>
                    <Link
                        href="/discussions/create"
                        className="mt-4 md:mt-0 px-5 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center justify-center md:justify-start w-full md:w-auto"
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Start Conversation
                    </Link>
                </div>

                <div className="mb-8 max-w-md">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-10 rounded-lg border border-[#A1A6B4] focus:outline-none focus:ring-2 focus:ring-[#94C5CC]"
                        />
                        <Search className="absolute left-3 top-3 text-[#A1A6B4]" size={20} />
                    </div>
                </div>

                {/* Show loader when initially fetching or when there are no discussions yet */}
                {isFetching && discussions.length === 0 ? (
                    <div className="text-center py-12">
                        <Loader2 className="animate-spin text-[#A1A6B4] mx-auto" size={30} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {filteredDiscussions.length > 0 ? (
                            filteredDiscussions.map((discussion) => (
                                <Link
                                    key={discussion.id}
                                    href={`/discussions/${discussion.id}`}
                                    className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
                                >
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold text-[#000100] mb-2 hover:text-[#94C5CC] transition-colors duration-200">
                                            {discussion.title}
                                        </h2>
                                        <p className="text-[#A1A6B4] mb-4">{discussion.content}</p>
                                        <div className="flex items-center text-sm text-[#A1A6B4]">
                                            <Calendar size={16} className="mr-2" />
                                            <span>
                                                {new Date(discussion.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-[#A1A6B4] mt-2">
                                            <MessageCircle size={16} className="mr-2" />
                                            <span>{discussion.comment_count} comments</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold text-[#000100]">No discussions found</h3>
                                <p className="text-[#A1A6B4] mt-2">Try adjusting your search criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Show loading indicator for pagination */}
                {isFetching && discussions.length > 0 && (
                    <div className="text-center py-4 mt-4">
                        <Loader2 className="animate-spin text-[#A1A6B4] mx-auto" size={20} />
                    </div>
                )}

                {!endOfDiscussions && totalPages > 0 && !isFetching && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => {
                                if (isMounted.current) {
                                    setPage((prev) => prev + 1)
                                }
                            }}
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-[#000100] text-[#F8F8F8] font-medium hover:bg-[#A1A6B4] transition-colors duration-200 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Load More Discussions"
                            )}
                        </button>
                    </div>
                )}

                {/* End of discussions message */}
                {filteredDiscussions.length > 0 && endOfDiscussions && (
                    <div className="mt-12 text-center text-[#A1A6B4]">
                        <p>You&lsquo;ve reached the end of the discussions</p>
                    </div>
                )}
            </div>
        </div>
    )
}
