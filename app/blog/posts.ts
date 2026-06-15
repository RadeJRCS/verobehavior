export type BlogPost = {
  slug: string
  title: string
  category: string
  categoryColor: string
  categoryBg: string
  date: string
  readTime: string
  excerpt: string
  content: { type: 'p' | 'h2' | 'quote' | 'principle'; text: string }[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'sixty-four-seconds-of-hesitation',
    title: 'Why 64 Seconds of Hesitation Is a Conversion Signal',
    category: 'Psychology',
    categoryColor: '#854F0B',
    categoryBg: '#FBF3E4',
    date: '02 Jun 2026',
    readTime: '5 min read',
    excerpt: 'A visitor stays on a page for over a minute, never scrolls, then leaves. Most analytics tools would call that engagement. Here is why it usually means the opposite.',
    content: [
      { type: 'p', text: 'Picture a product page. A visitor arrives, the page loads cleanly, and the visitor stays for 64 seconds. In almost any analytics dashboard, that number would be flagged as a good sign. Sixty four seconds is a long time. People who do not care leave in five.' },
      { type: 'p', text: 'Now add one detail: during those 64 seconds, the visitor never scrolled. Not once. Then they clicked back to the store and left the page entirely.' },
      { type: 'h2', text: 'Time on page is not the same as interest' },
      { type: 'p', text: 'Time on page is one of the oldest metrics in web analytics, and one of the easiest to misread. A long visit can mean someone is reading carefully. It can also mean someone is stuck, scanning the same fold of the page over and over, looking for a reason to keep going and not finding one.' },
      { type: 'p', text: 'The only way to tell these two situations apart is to look at what else happened during that time. Scroll depth, click targets, and the order of events turn a single number into a story.' },
      { type: 'h2', text: 'What information scent theory predicts' },
      { type: 'principle', text: 'Information Scent Theory (Pirolli and Card) describes how people decide whether to keep following a path on a website. Visitors pick up on small cues, a headline, an image, a price, a button label, and use those cues to predict whether continuing will be worth their time. When the scent is strong, people move forward with confidence. When it is weak or missing, people pause, even if they are not consciously aware of why.' },
      { type: 'p', text: 'A visitor who lands on a page, does not scroll, and leaves after a full minute is showing a classic weak scent pattern. The page did not give them a reason to go further, but it also did not give them a clear enough signal to leave immediately either. They sat with the ambiguity for a while before giving up.' },
      { type: 'h2', text: 'Why this matters for the page above the fold' },
      { type: 'p', text: 'If a visitor never scrolls, then everything that matters for that session happened in the first viewport. The headline, the hero image, the primary call to action, and anything immediately visible around them carry the entire weight of the decision.' },
      { type: 'p', text: 'When VeroBehavior flags a session like this, the recommendation usually focuses on that first screen: is the value proposition clear within a glance, is there a visible next step, and is there anything that gives the visitor a reason to scroll in the first place. A pattern interrupt, a piece of social proof, or a clearer headline near the fold are common starting points, not because they are universally correct, but because they directly address the weak scent that the session data points to.' },
      { type: 'h2', text: 'The takeaway' },
      { type: 'p', text: 'A single session like this is an anecdote. The same pattern repeating across dozens of sessions on the same page is a signal. Either way, the lesson is the same: time on page only becomes meaningful once you know what someone was doing with that time, and whether the page gave them anything to act on.' },
    ],
  },
  {
    slug: 'hicks-law-pricing-page',
    title: "Hick's Law: When More Pricing Options Mean Fewer Customers",
    category: 'Psychology',
    categoryColor: '#854F0B',
    categoryBg: '#FBF3E4',
    date: '05 Jun 2026',
    readTime: '6 min read',
    excerpt: 'A visitor jumps between Features and Pricing four times in five seconds, then scrolls the whole pricing page in sixteen. That is not comparison shopping. That is overload.',
    content: [
      { type: 'p', text: 'Pricing pages exist to make a decision easier. Lay out the plans, show what each one includes, and let the visitor pick the one that fits. In practice, pricing pages are one of the most common places where visitors get stuck.' },
      { type: 'h2', text: 'The pattern: fast, repeated, incomplete' },
      { type: 'p', text: 'Here is a session worth looking at closely. A visitor clicks from the homepage to Features, then to Pricing, back to Features, then back to Pricing again, all within about five seconds. Once on the pricing page, they scroll through the entire thing in sixteen seconds and then leave without clicking anything.' },
      { type: 'p', text: 'On the surface, this could be read as research. The visitor is comparing features against price, doing their homework. But the speed tells a different story. Sixteen seconds is not long enough to read three or four plan descriptions and weigh them against a feature list. It is long enough to scan headings and numbers and feel that none of it is settling into a decision.' },
      { type: 'h2', text: "What Hick's Law says about choice" },
      { type: 'principle', text: "Hick's Law states that the time it takes to make a decision increases with the number and complexity of the options available, and the relationship is not linear, it grows roughly with the logarithm of the number of choices. Two clear options can be compared almost instantly. Five options with overlapping features take disproportionately longer, and at some point the cost of comparing starts to outweigh the benefit of choosing correctly, so people stop trying." },
      { type: 'p', text: 'A pricing page with several plans, each with a long list of features that differ in subtle ways, is a near perfect setup for this. The visitor is not failing to understand the plans. They are accurately sensing that understanding them fully will take more effort than they are willing to spend right now, on this visit.' },
      { type: 'h2', text: 'Why this looks fine in standard analytics' },
      { type: 'p', text: 'A pageview on /pricing looks identical whether the visitor left delighted, confused, or somewhere in between. Even scroll depth on its own is ambiguous, a full scroll could mean thorough reading or a quick once-over. The detail that makes this session readable is the sequence: rapid back and forth before arriving, then a fast scroll, then nothing.' },
      { type: 'h2', text: 'What tends to help' },
      { type: 'p', text: 'The direct response to a decision fatigue pattern is to reduce the size of the decision, not the amount of information available overall. That can mean highlighting one plan as the default recommendation, reducing the number of features shown at a glance and linking to detail for the rest, or offering a short, guided way to find the right plan based on team size or use case rather than asking the visitor to map their needs onto a comparison table themselves.' },
      { type: 'p', text: 'None of these remove information. They remove the requirement to process all of it at once, which is usually the actual source of the hesitation.' },
    ],
  },
  {
    slug: 'explain-behavior-not-just-record-it',
    title: 'Why We Built VeroBehavior to Explain Behavior, Not Just Record It',
    category: 'Product',
    categoryColor: '#1A3A2A',
    categoryBg: '#E8F2EC',
    date: '08 Jun 2026',
    readTime: '7 min read',
    excerpt: 'Session recordings and heatmaps show you what happened. They have never been able to tell you why. That gap is the entire reason this product exists.',
    content: [
      { type: 'p', text: 'Every conversion optimization tool answers some version of the same question: what did people do on this page. Heatmaps show where they clicked. Session recordings show the path their cursor took. Funnels show where they dropped off. All of this is useful, and all of it stops at the same wall.' },
      { type: 'p', text: 'None of it explains why.' },
      { type: 'h2', text: 'The missing layer' },
      { type: 'p', text: 'For as long as conversion rate optimization has existed as a discipline, the "why" has been answered by people, usually someone with a background in psychology or UX research, watching session recordings, forming a hypothesis, and writing it up. That work is genuinely valuable. It is also slow, expensive, and does not scale much past a handful of sessions a week for most teams.' },
      { type: 'p', text: 'The result is that most websites have plenty of data about what visitors do, and almost no structured understanding of why they do it. The behavioral psychology research that explains hesitation, comparison, and decision fatigue has existed in academic literature for decades. Very little of it makes its way into day to day decisions about a website, simply because connecting the two has always required a person in the loop.' },
      { type: 'h2', text: 'What VeroBehavior does differently' },
      { type: 'p', text: "Every session that comes through the platform is read the way that analyst would read it, except automatically and for every session, not a sample. The output is not a heatmap or a score. It is a short written explanation: what state the visitor appeared to be in (browsing, hesitating, comparing, high intent, converted), what specific pattern in their behavior supports that read, and which psychological principle the pattern lines up with, named directly, whether that is Hick's Law, the Zeigarnik effect, loss aversion, or social proof." },
      { type: 'quote', text: 'A heatmap shows you where the cursor stopped. We try to write down why it stopped there.' },
      { type: 'h2', text: 'From explanation to action' },
      { type: 'p', text: 'An explanation on its own is interesting but not necessarily useful. The second half of the system turns each insight into a specific, testable recommendation, and where the recommendation can be expressed as a change to existing page content (different button copy, a more prominent call to action, a short line of supporting text), it can be turned directly into an A/B test from the same screen.' },
      { type: 'p', text: 'This closes a loop that is normally split across several tools and several people: observation, interpretation, hypothesis, and test, all starting from the same session data, with the same stated reasoning carried through each step.' },
      { type: 'h2', text: 'Why this gets better over time' },
      { type: 'p', text: 'Behavioral patterns are not unique to one website. Hesitation on a pricing page looks structurally similar whether the product is project management software or a furniture store. As the platform sees more sessions across more types of sites, recognizing these patterns and matching them to the right principle becomes more reliable, the same way any pattern recognition system improves with more examples.' },
      { type: 'p', text: 'That is the long term bet behind this product: that behavioral psychology, applied consistently and at the scale of every session rather than a sample of them, is a layer that conversion optimization has been missing, not because the theory was missing, but because nobody had connected it to the data at this scale before.' },
    ],
  },
  {
    slug: 'what-is-geo',
    title: 'What Is GEO and Why Your Website Needs to Be Machine Readable',
    category: 'Visibility',
    categoryColor: '#1A4A6E',
    categoryBg: '#E8F0F8',
    date: '11 Jun 2026',
    readTime: '5 min read',
    excerpt: 'A growing share of product research now happens inside AI assistants, not search results pages. Optimizing for that is a different job than SEO, and most sites have not started.',
    content: [
      { type: 'p', text: 'For two decades, getting found online has mostly meant getting found by a search engine. Rank for the right keywords, show up on the first page, and a share of the people searching for that term become visitors. That model still matters. It is no longer the whole picture.' },
      { type: 'p', text: 'A growing share of research, comparison, and recommendation now happens through AI assistants and AI powered search experiences. Someone asks a chat assistant to compare two products, or to suggest a tool for a specific task, and the assistant answers directly, sometimes without the person ever clicking through to a website at all.' },
      { type: 'h2', text: 'What GEO means' },
      { type: 'p', text: 'Generative Engine Optimization, GEO, is the practice of structuring a website so that AI systems can read it accurately, summarize it correctly, and reference it confidently when answering a question. It sits next to SEO rather than replacing it, but the goals are not identical.' },
      { type: 'p', text: 'SEO is largely about ranking: matching what people type into a search box, building authority, and earning a position on a results page. GEO is about accuracy and extraction: can a language model figure out what this product actually is, who it is for, what it costs, and how it compares to alternatives, just by reading the page.' },
      { type: 'h2', text: 'Why this is harder than it sounds' },
      { type: 'p', text: 'Most websites are written for people who already have context. A pricing page assumes the visitor knows what the product does. A features page assumes the visitor has already decided this category of product is relevant to them. People fill in these gaps automatically, drawing on everything else they saw on the way to that page.' },
      { type: 'p', text: 'A language model summarizing a single page does not have that surrounding context unless the page provides it, or unless the information is available in a structured form it can parse directly, such as schema markup that explicitly states what kind of entity a page describes, what it offers, and at what price.' },
      { type: 'h2', text: 'What this looks like in practice' },
      { type: 'p', text: 'Structured data, JSON-LD blocks describing products, organizations, and frequently asked questions, is the most direct lever. Clear, explicit statements of what a product does and who it is for, written in plain language rather than only in marketing phrasing, help as well. So does content that mirrors how people actually phrase questions to an assistant, since that phrasing is often more conversational than the keyword phrases SEO has traditionally targeted.' },
      { type: 'p', text: 'None of this is in tension with writing for people. A page that states clearly, early, and in plain language what it is and who it is for tends to be both easier for a visitor to understand quickly and easier for a model to summarize without guessing. GEO mostly rewards the same clarity that good UX writing has always rewarded. It just adds a second reader who is reading the page for someone else.' },
    ],
  },
  {
    slug: 'inside-an-ab-test-judge',
    title: 'Inside an A/B Test: How an AI Judge Explains a Winner',
    category: 'Product',
    categoryColor: '#1A3A2A',
    categoryBg: '#E8F2EC',
    date: '13 Jun 2026',
    readTime: '6 min read',
    excerpt: 'A/B testing tells you which version won. It almost never tells you why. Here is what it looks like when that explanation is generated automatically, alongside the result.',
    content: [
      { type: 'p', text: 'Run an A/B test on most platforms and, once it concludes, you get a result: variant B converted at a higher rate than variant A, with some indication of how confident you should be in that difference. What you do not get is a reason.' },
      { type: 'p', text: 'Most teams fill that gap themselves, informally. Someone on the team has a theory about why the new button copy worked, and that theory becomes the explanation, whether or not it was ever checked against anything.' },
      { type: 'h2', text: 'Pairing the result with the original hypothesis' },
      { type: 'p', text: 'Every test in VeroBehavior starts from a specific hypothesis, generated from a session insight, before the test runs. That hypothesis names a psychological principle and predicts which variant should win and roughly why. Once the test has collected enough sessions on both sides, the result is compared back against that original hypothesis, not evaluated in isolation.' },
      { type: 'p', text: 'Consider a hypothetical example. A test changes a call to action from "Create account" to a version that adds a specific number, something like a count of teams already using the product, alongside the original wording. If that variant wins, the explanation does not stop at "the new version converted better." It connects the result back to the mechanism the hypothesis named: specific numbers tend to read as more credible than general claims, and seeing that other people have already taken the same step lowers the perceived risk of taking it too.' },
      { type: 'principle', text: 'This connects to two related ideas from behavioral psychology: social proof, the tendency to look at what others are doing when a decision feels uncertain, and the effect of specificity, where concrete numbers are processed as more trustworthy than vague claims, even when the underlying difference in accuracy is small.' },
      { type: 'h2', text: 'Tests with more than one change' },
      { type: 'p', text: 'Not every test is a single swap. Some recommendations call for changing the wording of a button and making it visually more prominent at the same time, because the underlying issue is both a messaging problem and a visibility problem. When a test combines changes like this, the explanation addresses the combination, rather than crediting the result to whichever change happens to be listed first.' },
      { type: 'h2', text: 'Why explanations are evaluated even on early or partial data' },
      { type: 'p', text: 'Tests do not always run to completion. Sometimes a test is paused early, with fewer sessions than the original target. In those cases, the explanation step still runs, but it is explicit about working from a smaller sample, treating the result as a preliminary read rather than a settled answer. The goal is to be useful at whatever point someone wants to look, while being honest about how much weight that read should carry.' },
      { type: 'h2', text: 'Why this compounds' },
      { type: 'p', text: 'A single explained test result is a small thing. A growing collection of them, each one tying a specific change to a specific outcome and a specific principle, becomes something else: a record of what has actually worked, and why, that can inform the next recommendation before it is even tested. That is the direction this is built toward, not just faster tests, but tests that make each other smarter.' },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
