import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogPosts, getPostBySlug } from '@/lib/blog-posts'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-green py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <Link href="/blog" className="text-[12px] font-mono text-[#A8D4B8] hover:text-white transition-colors mb-6 inline-flex items-center gap-1">
              &larr; Back to blog
            </Link>
            <div className="flex items-center gap-3 mb-4 mt-4 flex-wrap">
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ color: post.categoryColor, background: post.categoryBg }}>
                {post.category}
              </span>
              <span className="text-[11px] text-[#A8D4B8] font-mono">{post.date}</span>
              <span className="text-[11px] text-[#A8D4B8]">&middot;</span>
              <span className="text-[11px] text-[#A8D4B8] font-mono">{post.readTime}</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-normal leading-tight">{post.title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="space-y-5">
            {post.content.map((block, i) => {
              if (block.type === 'h2') {
                return <h2 key={i} className="font-serif text-2xl text-ink mt-8 mb-1">{block.text}</h2>
              }
              if (block.type === 'quote') {
                return (
                  <div key={i} className="bg-green rounded-lg p-5 my-6">
                    <p className="text-[16px] text-white font-serif italic leading-relaxed">&ldquo;{block.text}&rdquo;</p>
                  </div>
                )
              }
              if (block.type === 'principle') {
                return (
                  <div key={i} className="rounded-lg p-4 my-6" style={{ borderLeft: '3px solid #854F0B', background: '#FBF3E4' }}>
                    <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: '#854F0B' }}>Principle</div>
                    <p className="text-[14px] text-ink leading-relaxed">{block.text}</p>
                  </div>
                )
              }
              return <p key={i} className="text-[15px] text-ink-2 leading-relaxed font-light">{block.text}</p>
            })}
          </div>

          {/* Read next */}
          {otherPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-surface-3">
              <div className="text-[11px] font-mono text-ink-3 uppercase tracking-widest mb-4">Read next</div>
              <div className="grid md:grid-cols-2 gap-4">
                {otherPosts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="block bg-white border border-surface-3 rounded-xl p-4 hover:border-green/30 hover:shadow-md transition-all">
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ color: p.categoryColor, background: p.categoryBg }}>
                      {p.category}
                    </span>
                    <h3 className="font-serif text-[16px] text-ink mt-2 leading-snug">{p.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
