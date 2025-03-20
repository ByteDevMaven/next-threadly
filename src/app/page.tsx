import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  // Example featured discussions
  const featuredDiscussions = [
    {
      id: 1,
      title: "The Future of JavaScript",
      excerpt: "Discuss the upcoming trends and features in JavaScript.",
      category: "Development",
      image: "/placeholder-600x400.png",
      date: "Mar 10, 2025"
    },
    {
      id: 2,
      title: "Design Systems: Best Practices",
      excerpt: "Share your experiences and tips on building design systems.",
      category: "Design",
      image: "/placeholder-600x400.png",
      date: "Mar 12, 2025"
    },
    {
      id: 3,
      title: "AI in Web Development",
      excerpt: "Explore how AI is transforming the web development landscape.",
      category: "Insights",
      image: "/placeholder-600x400.png",
      date: "Mar 14, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#94C5CC] to-[#B4D2E7] py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#000100] mb-6">Welcome to Threadly</h1>
            <p className="text-xl md:text-2xl text-[#000100] mb-8 max-w-2xl">Join the conversation on the latest trends and insights in technology, design, and more.</p>
            <Link 
              href="/discussions" 
              className="bg-[#000100] text-[#F8F8F8] hover:bg-[#A1A6B4] transition-colors duration-200 font-bold py-3 px-6 rounded-lg"
            >
              Explore Discussions
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Discussions */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#000100] mb-8">Featured Discussions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDiscussions.map((discussion) => (
            <article key={discussion.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2">
              <div className="relative h-48">
                <Image 
                  src={discussion.image} 
                  alt={discussion.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#94C5CC] text-[#000100] text-sm font-semibold px-3 py-1 rounded-full">
                  {discussion.category}
                </div>
              </div>
              <div className="p-6">
                <span className="text-[#A1A6B4] text-sm">{discussion.date}</span>
                <h3 className="text-xl font-bold text-[#000100] mt-2 mb-3">{discussion.title}</h3>
                <p className="text-[#A1A6B4] mb-4">{discussion.excerpt}</p>
                <Link 
                  href={`/discussions/${discussion.id}`} 
                  className="text-[#94C5CC] hover:text-[#B4D2E7] font-semibold inline-flex items-center"
                >
                  Join Discussion
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#000100] text-[#F8F8F8] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Get the latest discussions and updates delivered straight to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-[#F8F8F8] px-4 py-3 rounded-lg focus:outline-none text-[#000100] flex-grow max-w-sm"
              />
              <button type="button" className="bg-[#94C5CC] hover:bg-[#B4D2E7] text-[#000100] font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}