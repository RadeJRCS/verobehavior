import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const sections = [
  { id: 'getting-started', nav: 'Getting started', eyebrow: 'Start here', color: '#1A3A2A', bg: '#E8F2EC' },
  { id: 'installing-the-snippet', nav: 'Installing the snippet', eyebrow: 'Setup', color: '#1A4A6E', bg: '#E8F0F8' },
  { id: 'tracking-conversions', nav: 'Tracking conversions', eyebrow: 'Setup', color: '#1A3A2A', bg: '#E8F2EC' },
  { id: 'reading-your-dashboard', nav: 'Reading your dashboard', eyebrow: 'Dashboard', color: '#4A4947', bg: '#F3F2EC' },
  { id: 'behavioral-states', nav: 'Behavioral states and insights', eyebrow: 'Concepts', color: '#854F0B', bg: '#FBF3E4' },
  { id: 'ab-testing', nav: 'A/B testing', eyebrow: 'Feature', color: '#534AB7', bg: '#EEEDFE' },
  { id: 'patterns-and-backlog', nav: 'Patterns and the backlog', eyebrow: 'Feature', color: '#1A4A6E', bg: '#E8F0F8' },
  { id: 'privacy-and-data', nav: 'Privacy and data handling', eyebrow: 'Privacy', color: '#4A4947', bg: '#F3F2EC' },
  { id: 'api-reference', nav: 'API reference', eyebrow: 'Reference', color: '#1A3A2A', bg: '#E8F2EC' },
  { id: 'changelog-and-faq', nav: 'Changelog and FAQ', eyebrow: 'Reference', color: '#8F8D89', bg: '#F3F2EC' },
]

function SectionHeader({ eyebrow, color, bg, title }: { eyebrow: string; color: string; bg: string; title: string }) {
  return (
    <div className="mb-4">
      <span className="text-[9px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest" style={{ color, background: bg }}>{eyebrow}</span>
      <h2 className="font-serif text-3xl text-ink mt-3">{title}</h2>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Nav />
      <div className="pt-16">

        {/* Header */}
        <div className="bg-green py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-[11px] font-mono text-[#A8D4B8] mb-3 tracking-widest uppercase">Documentation</div>
            <h1 className="font-serif text-4xl md:text-5xl text-white font-normal mb-4 max-w-2xl">
              Everything you need to install, read, and act on VeroBehavior.
            </h1>
            <p className="text-[15px] text-[#A8D4B8] font-light max-w-xl">
              Setup, dashboard concepts, A/B testing, the API the snippet talks to, and answers to common questions.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">

          {/* Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <nav className="sticky top-24 space-y-0.5">
              <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">On this page</div>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-[13px] text-ink-2 hover:text-green py-1.5 border-l-2 border-transparent hover:border-green pl-3 -ml-px transition-colors">
                  {s.nav}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-2xl space-y-16 min-w-0">

            {/* Getting started */}
            <section id="getting-started">
              <SectionHeader eyebrow="Start here" color="#1A3A2A" bg="#E8F2EC" title="Getting started" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                VeroBehavior reads behavioral signals from your website and explains, in plain language, why visitors act the way they do, then turns that explanation into a recommendation you can test.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-6">
                Setup has three parts:
              </p>
              <div className="space-y-3">
                {[
                  { n: '1', t: 'Add the snippet', d: 'One script tag in the head of your site. Takes a few minutes.' },
                  { n: '2', t: 'Watch sessions arrive', d: 'Open your dashboard and visit your own site. Within moments, a session appears with a behavioral read and a recommendation.' },
                  { n: '3', t: 'Act on what you see', d: 'Save a recommendation to your backlog, or launch it as an A/B test directly from the session.' },
                ].map((step) => (
                  <div key={step.n} className="flex gap-4 bg-white border border-surface-3 rounded-xl p-4">
                    <div className="font-serif text-2xl text-green flex-shrink-0 w-8">{step.n}</div>
                    <div>
                      <div className="text-[14px] font-semibold text-ink mb-1">{step.t}</div>
                      <div className="text-[13px] text-ink-2 font-light leading-relaxed">{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-ink-3 mt-4 font-light">
                Each site you track is identified by a client key. If you do not have one yet, get in touch and one will be set up for your site.
              </p>
            </section>

            {/* Installing the snippet */}
            <section id="installing-the-snippet">
              <SectionHeader eyebrow="Setup" color="#1A4A6E" bg="#E8F0F8" title="Installing the snippet" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Add this single script tag inside the <code className="text-[13px] bg-surface-2 px-1.5 py-0.5 rounded font-mono">&lt;head&gt;</code> of your site, ideally as one of the first scripts to load.
              </p>
              <div className="bg-[#0E0E14] rounded-xl p-4 mb-4">
                <code className="text-[12px] font-mono text-[#A8D4B8] break-all">{'<script src="https://verobehavior.vercel.app/api/snippet?key=YOUR_CLIENT_KEY" async></script>'}</code>
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Replace <code className="text-[13px] bg-surface-2 px-1.5 py-0.5 rounded font-mono">YOUR_CLIENT_KEY</code> with the key assigned to your site. Sessions from this site will appear in your dashboard under that key.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                To confirm it is working, open your browser console on the page. You should see:
              </p>
              <div className="bg-[#0E0E14] rounded-xl p-4 mb-4">
                <code className="text-[12px] font-mono text-[#A8D4B8]">[VeroBehavior] Behavioral intelligence active &#10003; | key: YOUR_CLIENT_KEY</code>
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light">
                The snippet is under 10KB, loads asynchronously, and does not block rendering. It collects anonymous behavioral signals only: clicks, scroll depth, time on page, page title, URL, and referral source. It does not read form contents, does not set persistent cross site cookies, and does not use fingerprinting.
              </p>
            </section>

            {/* Tracking conversions */}
            <section id="tracking-conversions">
              <SectionHeader eyebrow="Setup" color="#1A3A2A" bg="#E8F2EC" title="Tracking conversions" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                By default, the snippet infers likely conversions from the text and context of what visitors click, things like &ldquo;Add to cart&rdquo;, &ldquo;Start free trial&rdquo;, or &ldquo;Create account&rdquo; are recognized automatically.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                For precise tracking, or for conversions that do not follow common wording, add a single attribute to the element:
              </p>
              <div className="bg-[#0E0E14] rounded-xl p-4 mb-4">
                <code className="text-[12px] font-mono text-[#A8D4B8]">{'<button data-vb-event="conversion">Start free trial</button>'}</code>
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light">
                This is the only code change needed beyond the snippet itself. Everything else, classifying the session, writing the insight, and generating a recommendation, happens automatically.
              </p>
            </section>

            {/* Reading your dashboard */}
            <section id="reading-your-dashboard">
              <SectionHeader eyebrow="Dashboard" color="#4A4947" bg="#F3F2EC" title="Reading your dashboard" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                The Sessions tab lists recent sessions across your sites, or filtered to one site using the dropdown at the top. Each row shows, at a glance:
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { l: 'Client and time', d: 'which site the session belongs to, and when it happened' },
                  { l: 'Behavioral state', d: 'the overall read on the visitor, covered in the next section' },
                  { l: 'Intent score', d: 'a 0 to 99 scale reflecting how likely the visitor was to take a meaningful action' },
                  { l: 'Tags', d: 'short labels describing specific patterns observed in that session' },
                ].map((row) => (
                  <div key={row.l} className="flex gap-3 text-[14px]">
                    <div className="font-semibold text-ink w-36 flex-shrink-0">{row.l}</div>
                    <div className="text-ink-2 font-light">{row.d}</div>
                  </div>
                ))}
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light">
                Click any row to expand it. The expanded view shows the full written insight, the psychological principle it is based on, and the AI recommendation, along with buttons to save the recommendation to your backlog or launch it as an A/B test.
              </p>
            </section>

            {/* Behavioral states */}
            <section id="behavioral-states">
              <SectionHeader eyebrow="Concepts" color="#854F0B" bg="#FBF3E4" title="Behavioral states and insights" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Every session is classified into one of six states, based on the sequence of events during the visit, not just totals.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { s: 'browsing', d: 'Exploring without a clear direction yet' },
                  { s: 'engaged', d: 'Reading or interacting steadily' },
                  { s: 'hesitating', d: 'Pausing near a decision point' },
                  { s: 'comparing', d: 'Moving between options or pages' },
                  { s: 'high_intent', d: 'Showing strong signals toward converting' },
                  { s: 'converted', d: 'Completed the intended action' },
                ].map((st) => (
                  <div key={st.s} className="bg-white border border-surface-3 rounded-lg p-3">
                    <div className="text-[12px] font-mono font-semibold text-ink mb-1">{st.s}</div>
                    <div className="text-[12px] text-ink-2 font-light">{st.d}</div>
                  </div>
                ))}
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Alongside the state, each session gets an insight type describing the specific pattern found:
              </p>
              <div className="space-y-2">
                {[
                  { t: 'FRICTION', d: 'Something in the flow is making the next step harder than it needs to be' },
                  { t: 'DECISION_FATIGUE', d: 'Too many similar choices are slowing the visitor down' },
                  { t: 'HIGH_INTENT', d: 'Strong signals that the visitor is close to acting' },
                  { t: 'SOCIAL_PROOF_SEEKING', d: 'The visitor appears to be looking for reassurance from others\u2019 behavior' },
                  { t: 'BOUNCE_RISK', d: 'The session shows signs of an imminent exit' },
                  { t: 'COMPARISON_BEHAVIOR', d: 'The visitor is weighing options against each other' },
                  { t: 'CONVERSION_EVENT', d: 'A tracked conversion occurred during the session' },
                ].map((row) => (
                  <div key={row.t} className="flex gap-3 text-[14px]">
                    <div className="font-mono text-[12px] font-semibold text-ink w-44 flex-shrink-0">{row.t}</div>
                    <div className="text-ink-2 font-light">{row.d}</div>
                  </div>
                ))}
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mt-4">
                Every insight also names the psychological principle behind the read, drawing on established research such as Cialdini&rsquo;s principles of influence, Hick&rsquo;s Law, the Zeigarnik effect, loss aversion, and information scent theory.
              </p>
            </section>

            {/* A/B testing */}
            <section id="ab-testing">
              <SectionHeader eyebrow="Feature" color="#534AB7" bg="#EEEDFE" title="A/B testing" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                From any session, the Launch A/B Test button opens a configuration generated directly from that session&rsquo;s insight. When the recommendation can be expressed as a change to existing page content, the test is ready to launch as is, you can review it and approve, or edit any part of it first.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                A test is made up of one to three changes, each one of:
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { t: 'Change text', d: 'Replace the wording of an existing button or link' },
                  { t: 'Add element', d: 'Insert a short line of text near an existing element, such as a trust signal or a count' },
                  { t: 'Change style', d: 'Adjust the visual prominence of an element: color, size, weight, padding, or rounding' },
                ].map((row) => (
                  <div key={row.t} className="flex gap-3 text-[14px]">
                    <div className="font-semibold text-ink w-32 flex-shrink-0">{row.t}</div>
                    <div className="text-ink-2 font-light">{row.d}</div>
                  </div>
                ))}
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Once launched, visitors are split 50/50 between the original and the variant. Each visitor is assigned consistently, so they see the same version on later visits, without using cookies.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light">
                After enough sessions have been collected on both sides, the result is reviewed against the original hypothesis and a short explanation is written: which variant performed better, and which psychological principle that result lines up with. A test can be paused, resumed, evaluated early on partial data, or removed at any time from the Tests tab.
              </p>
            </section>

            {/* Patterns and backlog */}
            <section id="patterns-and-backlog">
              <SectionHeader eyebrow="Feature" color="#1A4A6E" bg="#E8F0F8" title="Patterns and the backlog" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                A single session is a data point. The same pattern showing up across many sessions is a signal worth acting on directly. The Patterns tab groups sessions that share the same behavioral state and insight type, and shows what share of total sessions each group represents.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                Opening a pattern and generating its summary produces one consolidated read for the whole group: what is happening, why, and one recommendation that addresses it at scale, with a priority based on how much of your traffic it affects. From there, launch one test or save one backlog item for the entire pattern, instead of repeating the same fix session by session.
              </p>
              <p className="text-[15px] text-ink-2 leading-relaxed font-light">
                The backlog itself is a simple task list: each item moves from pending to in progress to done. It is the right place for recommendations that involve layout or structural changes beyond what an A/B test can apply automatically, things to implement directly on the site rather than test through the snippet.
              </p>
            </section>

            {/* Privacy and data */}
            <section id="privacy-and-data">
              <SectionHeader eyebrow="Privacy" color="#4A4947" bg="#F3F2EC" title="Privacy and data handling" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                The snippet is built around a simple principle: collect what is needed to understand behavior, and nothing that identifies a person.
              </p>
              <div className="space-y-2">
                {[
                  'No personally identifiable information is collected: no names, email addresses, form contents, or payment details.',
                  'No persistent cross site cookies and no fingerprinting.',
                  'Data collected is limited to anonymous behavioral signals: clicks, scroll depth, time on page, page title, URL path, and referral source.',
                  'Session data is stored within the EU.',
                  'VeroBehavior acts as a data processor on your behalf for the data collected through your site.',
                ].map((row, i) => (
                  <div key={i} className="flex gap-3 text-[14px] items-start">
                    <span className="text-green mt-0.5 flex-shrink-0">&#10003;</span>
                    <span className="text-ink-2 font-light">{row}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* API reference */}
            <section id="api-reference">
              <SectionHeader eyebrow="Reference" color="#1A3A2A" bg="#E8F2EC" title="API reference" />
              <p className="text-[15px] text-ink-2 leading-relaxed font-light mb-4">
                These endpoints are called automatically by the snippet. You do not need to call them directly for standard use, but they are documented here for transparency.
              </p>
              <div className="space-y-4">
                {[
                  { m: 'GET', p: '/api/snippet?key=YOUR_CLIENT_KEY', d: 'Returns the tracking script for your site.' },
                  { m: 'POST', p: '/api/analyze', d: 'Receives anonymized session events and returns the behavioral analysis used to populate your dashboard.' },
                  { m: 'GET', p: '/api/tests?key=YOUR_CLIENT_KEY&status=active', d: 'Returns active A/B tests for your site, used by the snippet to assign variants.' },
                  { m: 'POST', p: '/api/test-results', d: 'Records which variant a visitor saw and whether they converted.' },
                ].map((row) => (
                  <div key={row.p} className="bg-white border border-surface-3 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-green-light text-green">{row.m}</span>
                      <code className="text-[12px] font-mono text-ink">{row.p}</code>
                    </div>
                    <div className="text-[13px] text-ink-2 font-light">{row.d}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Changelog and FAQ */}
            <section id="changelog-and-faq">
              <SectionHeader eyebrow="Reference" color="#8F8D89" bg="#F3F2EC" title="Changelog and FAQ" />
              <div className="text-[12px] font-mono text-ink-3 uppercase tracking-widest mb-3">Recent updates</div>
              <div className="space-y-3 mb-8">
                {[
                  { date: '13 Jun 2026', t: 'A/B tests can now combine up to three changes (text, added elements, and style) in a single test, and the Patterns tab groups recurring sessions into one actionable summary.' },
                  { date: '11 Jun 2026', t: 'Tests can be paused, resumed, evaluated early on partial data, or removed from the Tests tab.' },
                  { date: '09 Jun 2026', t: 'Added the A/B test engine and the backlog, so any recommendation can become a test or a tracked task in one click.' },
                  { date: '07 Jun 2026', t: 'Initial release: snippet, dashboard, and the AI insight engine.' },
                ].map((row) => (
                  <div key={row.date} className="flex gap-4">
                    <div className="text-[12px] font-mono text-ink-3 w-24 flex-shrink-0 pt-0.5">{row.date}</div>
                    <div className="text-[14px] text-ink-2 font-light leading-relaxed">{row.t}</div>
                  </div>
                ))}
              </div>

              <div className="text-[12px] font-mono text-ink-3 uppercase tracking-widest mb-3">Frequently asked questions</div>
              <div className="space-y-4">
                {[
                  { q: 'Does the snippet slow down my site?', a: 'It is under 10KB, loads asynchronously, and does not block rendering. Most sites see no measurable change in load time.' },
                  { q: 'Will this conflict with Google Analytics or other tools?', a: 'No. The snippet runs independently, does not share cookies or storage with other tools, and does not modify how other scripts behave.' },
                  { q: 'My site does not have a typical "buy now" button, is this still useful?', a: 'Yes. The platform infers the type of site (e-commerce, SaaS, documentation, and so on) from page content and behavior, and adapts what it looks for accordingly.' },
                  { q: 'How is a behavioral state decided?', a: 'From the full sequence of events in a session, click order and timing, scroll depth, time spent, and page context, read together rather than as isolated totals.' },
                  { q: 'Can I remove the changes an A/B test makes?', a: 'Yes. Pausing or removing a test stops the snippet from applying its changes to new visitors.' },
                ].map((row) => (
                  <div key={row.q}>
                    <div className="text-[14px] font-semibold text-ink mb-1">{row.q}</div>
                    <div className="text-[13px] text-ink-2 font-light leading-relaxed">{row.a}</div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
