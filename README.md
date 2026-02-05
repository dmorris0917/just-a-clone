# Gist Clone

A tool that takes URLs (articles, PDFs, YouTube) or raw text and generates structured, layered summaries.

![Gist Clone](https://via.placeholder.com/800x400?text=Gist+Clone)

## Features

### Content Extraction
- **Articles**: Extracts clean text using Readability
- **YouTube**: Fetches video transcripts
- **PDFs**: Extracts text content
- **Raw text**: Direct paste input

### Structured Summaries

The app automatically detects whether content is better analyzed as a **Story** or an **Argument**, then applies the appropriate framework:

#### Story Framework (Dramatic Structure)
- **Situation**: The initial context, the "before" picture
- **Complication**: What disrupts the status quo
- **Question**: The central question raised
- **Resolution**: How it resolves (or doesn't)

#### Argument Framework (Logical Structure)  
- **Thesis**: The main claim being made
- **Evidence**: Key supporting points
- **Counter-Argument**: The best case against
- **Synthesis**: The nuanced final position

### Layered Depth
- **Layer 0 (Core)**: One-sentence essence
- **Layer 1 (Key Points)**: 2-3 sentence summary
- **Layer 2 (In Detail)**: Short paragraph with nuances
- **Layer 3 (Full Summary)**: Comprehensive 2-3 paragraph summary

### Critical Thinking
- **Counter-Argument**: The strongest possible case against the author's position
- **Steelman**: An even stronger version of the author's argument

## Tech Stack

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o for summarization
- **Content Extraction**:
  - `@mozilla/readability` + `jsdom` for articles
  - `youtube-transcript` for YouTube videos
  - `pdf-parse` for PDF documents

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dmorris0917/gist-clone.git
   cd gist-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a URL** (article, YouTube video, or PDF) or paste raw text
2. Click "Get the Gist"
3. Navigate through the layered summaries using the tabs:
   - **Summary**: Progressive depth layers (use arrow keys ← →)
   - **Story/Argument**: Structured framework breakdown
   - **Counter**: Strongest case against the position
   - **Steelman**: Enhanced version of the argument

## API

### POST /api/gist

Generate a structured summary.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```
or
```json
{
  "text": "Your raw text here..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "sourceType": "article",
  "sourceUrl": "https://example.com/article",
  "title": "Article Title",
  "framework": "argument",
  "core": "One-sentence summary...",
  "layers": [
    { "depth": 0, "title": "Core", "content": "..." },
    { "depth": 1, "title": "Key Points", "content": "..." },
    { "depth": 2, "title": "In Detail", "content": "..." },
    { "depth": 3, "title": "Full Summary", "content": "..." }
  ],
  "structure": {
    "thesis": "...",
    "evidence": ["...", "...", "..."],
    "counterArgument": "...",
    "synthesis": "..."
  },
  "counterArgument": "Strongest case against...",
  "steelman": "Even stronger version...",
  "wordCount": 1234,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

### Docker

```bash
docker build -t gist-clone .
docker run -e OPENAI_API_KEY=sk-xxx -p 3000:3000 gist-clone
```

## Cost Considerations

Each gist generation makes 5-7 OpenAI API calls:
- 1x GPT-4o-mini for framework detection (~$0.0001)
- 4-6x GPT-4o for summaries and analysis (~$0.02-0.05)

Estimated cost per gist: **$0.02 - $0.06**

## Contributing

Pull requests welcome! Please open an issue first to discuss major changes.

## License

MIT
