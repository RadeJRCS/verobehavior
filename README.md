# VeroBehavior — Full Next.js Project

## Tech Stack
- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** for styling
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) for real-time behavioral analysis
- **Vercel** for deployment

## Pages
| Route | Description |
|-------|-------------|
| `/` | Full marketing website |
| `/demo` | Interactive live demo with real Anthropic API |
| `/dashboard` | Client dashboard (insights, sessions, GEO monitor) |
| `/pricing` | Pricing page with ROI calculator |
| `/about` | Company story + Ethical AI Charter |

## API Routes
| Route | Description |
|-------|-------------|
| `POST /api/analyze` | Behavioral analysis via Claude API |
| `POST /api/geo` | GEO/AEO optimization analysis |
| `GET /api/snippet?key=...` | Serves the embeddable JS snippet |

---

## 🚀 Quick Deploy: GitHub → Vercel

### Step 1: Clone & prepare
```bash
# Unzip the project
unzip verobehavior.zip
cd verobehavior

# Install dependencies
npm install
```

### Step 2: Environment variables
```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3: Test locally
```bash
npm run dev
# Open http://localhost:3000
```

### Step 4: Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial VeroBehavior MVP"
git remote add origin https://github.com/YOUR_USERNAME/verobehavior.git
git push -u origin main
```

### Step 5: Deploy on Vercel
1. Go to **vercel.com** → New Project
2. Import your GitHub repo
3. Add environment variable:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. Click **Deploy** ✓

---

## 🔌 Embed on any website (the MVP snippet)

Once deployed, add to any site's `<head>`:

```html
<script
  src="https://YOUR_VERCEL_URL.vercel.app/api/snippet?key=YOUR_CLIENT_KEY"
  async
></script>
```

The snippet:
- Tracks clicks, scrolls, form interactions, time on page
- Sends behavioral events to `/api/analyze` (Claude API)
- Returns psychological insights to your VeroBehavior dashboard
- **Under 10KB** · Async · Zero CLS · GDPR compliant

---

## 🤖 How the Anthropic integration works

1. User visits demo page or a site with the snippet
2. Behavioral events are collected (clicks, hovers, scrolls, variants)
3. Every 3 seconds (or on key events), events POST to `/api/analyze`
4. Claude receives events + page context, responds with JSON:
   ```json
   {
     "state": "hesitating",
     "intentScore": 67,
     "conversionProbability": 34,
     "tags": ["price-friction", "hesitation"],
     "insight": {
       "type": "HESITATION",
       "text": "User shows repeated cursor movement near price...",
       "principle": "Loss aversion (Kahneman) + commitment bias"
     },
     "recommendation": "Add 'Pay over 3 months from $116/mo' near CTA",
     "estimatedLift": "+19% checkout starts"
   }
   ```
5. The panel updates in real time

---

## Project structure
```
verobehavior/
├── app/
│   ├── page.tsx          ← Marketing homepage
│   ├── demo/page.tsx     ← Interactive demo (Anthropic API live)
│   ├── dashboard/page.tsx← Client dashboard
│   ├── pricing/page.tsx  ← Pricing
│   ├── about/page.tsx    ← About + Ethics
│   ├── api/
│   │   ├── analyze/      ← Claude behavioral analysis
│   │   ├── geo/          ← GEO/AEO analysis
│   │   └── snippet/      ← Embeddable JS snippet
│   └── globals.css
├── components/
│   ├── Nav.tsx
│   └── Footer.tsx
├── lib/
│   └── anthropic.ts      ← Anthropic client + prompts
├── .env.example
└── README.md
```

---

## Extending the MVP

### Add a real database
Connect Supabase or PlanetScale to store sessions:
```bash
npm install @supabase/supabase-js
```

### Add authentication
Use NextAuth for client login:
```bash
npm install next-auth
```

### A/B testing engine
The Judge LLM route is ready — connect to your experiment storage layer.

---

Built with ❤️ using Next.js + Anthropic Claude API
