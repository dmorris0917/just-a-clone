# ⚡ Gist Clone

**Get the gist of anything in seconds.** Paste a URL or text, get structured, layered summaries with counter-arguments and steelman views.

An open-source clone of [Gist](https://gist.is) — the "anti-slop filter for the internet."

---

## 🚀 Quick Start

### One-Command Setup

```bash
# Clone and run
git clone https://github.com/dmorris0917/gist-clone.git
cd gist-clone
./setup.sh
```

The setup script will:
1. Install dependencies
2. Prompt for your OpenAI API key
3. Start the dev server

Then open **http://localhost:3000**

---

## 📖 How to Use

1. **Paste a URL or text** — Drop in any article, YouTube video, PDF link, or raw text
2. **Click "Get the Gist"** — AI extracts and analyzes the content
3. **Navigate layers** — Use ←/→ arrows (or keyboard) to go deeper:
   - **Core**: One sentence essence
   - **Key Points**: 2-3 sentence summary
   - **In Detail**: Paragraph with nuance
   - **Full Summary**: Comprehensive breakdown
4. **Explore tabs** — Switch between Summary, Structure, Counter-Argument, and Steelman views
5. **Copy or share** — Grab the text for notes, Slack, etc.

**Keyboard shortcuts:**
- `←` / `→` — Navigate layers
- `1-4` — Jump to specific layer

---

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run the dev server
npm run dev
```

---

## 🔑 Get an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add it to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   ```

**Cost**: ~$0.02-0.06 per gist (uses GPT-4o)

---

## ✨ Features

### 📥 Content Extraction
| Source | How it works |
|--------|--------------|
| **Articles** | Readability extracts clean text |
| **YouTube** | Fetches video transcripts |
| **PDFs** | Extracts text from documents |
| **Raw text** | Paste anything directly |

### 🧠 Structured Frameworks

The app auto-detects whether content is a **Story** or **Argument**:

**Story Framework** (Dramatic Structure)
- Situation → Complication → Question → Resolution

**Argument Framework** (Logical Structure)
- Thesis → Evidence → Counter-Argument → Synthesis

### 📚 Layered Depth

| Layer | What you get |
|-------|--------------|
| **Core** | One sentence — the irreducible essence |
| **Key Points** | 2-3 sentences |
| **In Detail** | Short paragraph with nuance |
| **Full Summary** | Comprehensive 2-3 paragraphs |

### 🎯 Critical Thinking

- **Counter-Argument**: The strongest case *against* the author's position
- **Steelman**: An even *stronger* version of the author's argument

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, Framer Motion
- **AI**: OpenAI GPT-4o
- **Extraction**: Readability, youtube-transcript, unpdf

---

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dmorris0917/gist-clone&env=OPENAI_API_KEY)

Or manually:

```bash
npm install -g vercel
vercel
# Add OPENAI_API_KEY when prompted
```

---

## 🧪 API Usage

### POST `/api/gist`

```bash
# From URL
curl -X POST http://localhost:3000/api/gist \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# From text
curl -X POST http://localhost:3000/api/gist \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here..."}'
```

**Response:**
```json
{
  "title": "Article Title",
  "type": "article",
  "framework": "argument",
  "layers": [
    { "level": 0, "name": "Core", "content": "..." },
    { "level": 1, "name": "Key Points", "content": "..." },
    { "level": 2, "name": "In Detail", "content": "..." },
    { "level": 3, "name": "Full Summary", "content": "..." }
  ],
  "structure": {
    "thesis": "...",
    "evidence": "...",
    "counterArgument": "...",
    "synthesis": "..."
  },
  "counterArgument": "...",
  "steelman": "..."
}
```

---

## 📁 Project Structure

```
gist-clone/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   ├── api/gist/route.ts # API endpoint
│   │   └── layout.tsx
│   └── lib/
│       ├── extractors.ts     # Content extraction
│       ├── summarizer.ts     # AI summarization
│       └── types.ts          # TypeScript types
├── .env.example
├── setup.sh                  # One-command setup
└── README.md
```

---

## 🤝 Contributing

PRs welcome! The main areas for improvement:
- Better PDF extraction
- More content sources (Google Docs, Twitter threads)
- Caching layer
- Share links

---

## 📄 License

MIT — do whatever you want with it.

---

Built with ☕ by [Dylan Morris](https://github.com/dmorris0917)
