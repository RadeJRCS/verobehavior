import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog-posts'

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-green py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] font-mono text-[#A8D4B8] mb-3 tracking-widest uppercase">VeroBehavior Blog</div>
            <h1 className="font-serif text-4xl md:text-5xl text-white font-normal mb-4 max-w-2xl">
              Notes on behavioral psychology, conversion, and what makes people act.
            </h1>
            <p className="text-[15px] text-[#A8D4B8] font-light max-w-xl">
              Writing on why visitors hesitate, compare, and convert, the principles behind those patterns, and how the platform turns them into something testable.
            </p>
          </div>
        </div>

        {/* Posts */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-6">
            {blogPosts.slice().reverse().map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-white border border-surface-3 rounded-xl p-6 hover:border-green/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ color: post.categoryColor, background: post.categoryBg }}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-ink-3 font-mono">{post.date}</span>
                  <span className="text-[11px] text-ink-3">&middot;</span>
                  <span className="text-[11px] text-ink-3 font-mono">{post.readTime}</span>
                </div>
                <h2 className="font-serif text-2xl text-ink mb-2 group-hover:text-green transition-colors">{post.title}</h2>
                <p className="text-[14px] text-ink-2 font-light leading-relaxed mb-3">{post.excerpt}</p>
                <div className="text-[12px] font-mono text-green flex items-center gap-1">
                  Read article <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
