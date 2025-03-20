import Link from "next/link"
import { MessageSquare, TrendingUp, Users, ArrowRight } from "lucide-react"

interface Discussion {
  id: string
  user_id: string
  author: string
  title: string
  content: string
  comment_count: number
  created_at: string
  updated_at: string
}

async function getTopDiscussions() {
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec?sheetId=1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE&sheet=posts&limit=100",
      { next: { revalidate: 3600 } }, // Revalidate every hour
    )

    if (!response.ok) {
      throw new Error("Failed to fetch discussions")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error("API returned unsuccessful response")
    }

    // Sort by comment_count in descending order and take top 3
    const sortedDiscussions = [...data.message.data].sort((a, b) => b.comment_count - a.comment_count).slice(0, 3)

    return sortedDiscussions
  } catch (error) {
    console.error("Error fetching discussions:", error)
    return []
  }
}

// Format date to be more readable
function formatDate(dateString: string) {
  if (!dateString) return "Unknown date"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error("An unknown error occurred:", e);
    }
    return dateString
  }
}

// Truncate content to a specific length
function truncateContent(content: string, maxLength = 120) {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + "..."
}

export default async function Home() {
  const topDiscussions: Discussion[] = await getTopDiscussions()

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#94C5CC] to-[#B4D2E7] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-[#000100] mb-6">Join the Conversation</h1>
              <p className="text-lg md:text-xl text-[#000100] mb-8 max-w-2xl">
                Discover, discuss, and share ideas with our community of thinkers and creators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/discussions"
                  className="bg-[#000100] text-[#F8F8F8] hover:bg-[#A1A6B4] transition-colors duration-200 font-medium py-3 px-6 rounded-lg flex items-center justify-center"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Browse Discussions
                </Link>
                <Link
                  href="/discussions/create"
                  className="bg-white text-[#000100] hover:bg-[#F8F8F8] border border-[#000100] transition-colors duration-200 font-medium py-3 px-6 rounded-lg flex items-center justify-center"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start a Discussion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Discussions Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#000100]">Most Active Discussions</h2>
            <p className="text-[#A1A6B4] mt-2">Join these popular conversations in our community</p>
          </div>
          <Link
            href="/discussions"
            className="hidden md:flex items-center text-[#94C5CC] hover:text-[#000100] transition-colors duration-200 font-medium"
          >
            View all discussions
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {topDiscussions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topDiscussions.map((discussion) => (
              <article
                key={discussion.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#94C5CC] flex items-center justify-center text-white font-bold">
                        {discussion.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-[#000100]">{discussion.author}</p>
                        <p className="text-xs text-[#A1A6B4]">{formatDate(discussion.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-[#A1A6B4] bg-[#F8F8F8] px-3 py-1 rounded-full">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span className="text-sm">{discussion.comment_count}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#000100] mb-3 line-clamp-2">{discussion.title}</h3>

                  <p className="text-[#A1A6B4] mb-4 line-clamp-3">{truncateContent(discussion.content)}</p>

                  <Link
                    href={`/discussions/${discussion.id}`}
                    className="inline-flex items-center text-[#94C5CC] hover:text-[#000100] font-medium transition-colors duration-200"
                  >
                    Join discussion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-[#A1A6B4] mb-4" />
            <h3 className="text-xl font-bold text-[#000100] mb-2">No discussions found</h3>
            <p className="text-[#A1A6B4] mb-6">Be the first to start a conversation in our community!</p>
            <Link
              href="/discussions/create"
              className="inline-flex items-center justify-center bg-[#000100] text-[#F8F8F8] hover:bg-[#A1A6B4] transition-colors duration-200 font-medium py-2 px-4 rounded-lg"
            >
              Start a Discussion
            </Link>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/discussions"
            className="inline-flex items-center text-[#94C5CC] hover:text-[#000100] transition-colors duration-200 font-medium"
          >
            View all discussions
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#000100] mb-4">Why Join Our Community?</h2>
            <p className="text-[#A1A6B4] max-w-2xl mx-auto">
              Connect with like-minded individuals and expand your knowledge through meaningful discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#94C5CC] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#000100] mb-3">Connect with Others</h3>
              <p className="text-[#A1A6B4]">Build relationships with people who share your interests and passions.</p>
            </div>

            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#94C5CC] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#000100] mb-3">Engage in Discussions</h3>
              <p className="text-[#A1A6B4]">Share your thoughts and get feedback from a diverse community.</p>
            </div>

            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#94C5CC] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#000100] mb-3">Stay Up-to-Date</h3>
              <p className="text-[#A1A6B4]">Keep current with the latest trends and insights in your field.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#000100] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to join the conversation?</h2>
            <p className="text-[#A1A6B4] mb-8 max-w-xl mx-auto">
              Create an account today and start engaging with our community of thinkers and creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-transparent border border-white hover:bg-white hover:text-[#000100] transition-colors duration-200 font-medium py-3 px-6 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-[#94C5CC] text-[#000100] hover:bg-[#B4D2E7] transition-colors duration-200 font-medium py-3 px-6 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
