# Specmark

A web application for annotating Markdown specifications with highlights and comments, designed to generate structured feedback for LLM coding agents.

## Features

- **Markdown Input**: Paste any Markdown document into a large textarea
- **Text Selection**: Select any text in the rendered Markdown to add feedback
- **Floating Annotations**: Compact floating UI for adding comments without leaving context
- **Visual Highlights**: Yellow highlights for existing annotations, blue for active selection
- **Share Codes**: Generate short 6-character codes for easy mobile sharing
- **Export**: Copy all feedback as formatted Markdown to clipboard
- **Persistent Annotations**: Annotations saved to localStorage, keyed by content or share code

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS + @tailwindcss/typography
- react-markdown

### Backend (Share Code API)
- Cloudflare Workers
- Hono (TypeScript)
- Cloudflare KV (storage)

## Project Structure

```
specmark/
├── src/                    # Frontend React app
├── worker/                 # Cloudflare Worker API
│   ├── src/
│   │   ├── index.ts        # Hono app entry point
│   │   ├── routes/share.ts # API routes
│   │   └── lib/codes.ts    # Code generation
│   ├── wrangler.toml       # Worker config
│   └── package.json
├── cli/
│   └── annotate-md         # CLI tool for creating shares
├── specs/                  # Feature specifications
└── .github/workflows/      # GitHub Actions
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Install frontend dependencies
npm install

# Install worker dependencies
cd worker && npm install
```

### Local Development

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start worker API
cd worker && npm run dev
```

- Frontend: http://localhost:5173
- Worker API: http://localhost:8787

## Usage

### Web Interface

1. **Paste Markdown**: Enter your Markdown content in the textarea
2. **Get Share Code**: Click "Get Share Code" to generate a short code for sharing
3. **Start Annotating**: Click "Start Annotating" to enter annotation mode
4. **Select Text**: Highlight text to add feedback via the floating comment box
5. **Copy Feedback**: Click "Copy All" to export annotations as Markdown

### Loading Shared Content

- **Via URL**: `https://your-domain.com?c=X7KM3P`
- **Via Code Entry**: Enter the 6-character code in the header input field

### CLI Tool

Create share links directly from your terminal:

```bash
# Add to PATH or use directly
./cli/annotate-md path/to/document.md

# Output:
# Share created!
# URL:  https://your-domain.com?c=X7KM3P
# Code: X7KM3P
# Expires: 2025-01-10
```

Set the API URL for production:
```bash
export ANNOTATE_API_URL=https://your-worker.your-subdomain.workers.dev
./cli/annotate-md document.md
```

### Legacy URL Sharing

The original base64 URL encoding is still supported:
- `?markdown=<base64-encoded-content>`
- `?md=<url-encoded-content>`

## Production Deployment

### 1. Create Cloudflare Account & KV Namespace

```bash
# Login to Cloudflare
cd worker
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create SHARES
# Note the ID returned, e.g., "abc123..."
```

### 2. Update Worker Configuration

Edit `worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SHARES"
id = "your-kv-namespace-id-here"

[vars]
FRONTEND_URL = "https://your-frontend-domain.com"

[env.production]
vars = { FRONTEND_URL = "https://your-frontend-domain.com" }
```

### 3. Deploy Worker

**Manual deployment:**
```bash
cd worker
npx wrangler deploy
```

**Via GitHub Actions:**

1. Create a Cloudflare API token at https://dash.cloudflare.com/profile/api-tokens
   - Use the "Edit Cloudflare Workers" template
2. Add the token as a GitHub secret named `CLOUDFLARE_API_TOKEN`
3. Push to main branch - the worker will auto-deploy

### 4. Configure Frontend

Create a `.env.production` file or set the environment variable in your hosting platform:

```bash
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
```

### 5. Deploy Frontend

Build and deploy to your preferred static hosting (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build
# Deploy the `dist/` folder
```

### 6. Update CLI Tool

For users of the CLI tool, set the production API URL:

```bash
export ANNOTATE_API_URL=https://your-worker.your-subdomain.workers.dev
```

Or edit the default in `cli/annotate-md`.

## API Reference

### Create Share

```
POST /api/share
Content-Type: text/markdown

<markdown content>
```

**Response (201):**
```json
{
  "code": "X7KM3P",
  "url": "https://example.com?c=X7KM3P",
  "expiresAt": "2025-01-10T00:00:00.000Z"
}
```

### Retrieve Share

```
GET /api/share/:code
```

**Response (200):**
```json
{
  "markdown": "# Document content...",
  "createdAt": "2025-01-03T00:00:00.000Z",
  "expiresAt": "2025-01-10T00:00:00.000Z"
}
```

## Output Format

Exported feedback is formatted as Markdown:

```markdown
## Feedback

> Selected text from the document

Your feedback comment here

---

> Another selected passage

Another comment
```

## Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Save feedback in comment dialog
- **Escape**: Cancel comment dialog

## Configuration

### Share Code Format

- 6 characters from `[2-9A-HJKMNP-Z]` (excludes confusable characters)
- Case-insensitive
- ~887 million possible combinations

### Expiration

Shares expire after 7 days automatically via Cloudflare KV TTL.

### Size Limits

- Maximum markdown size: 500KB
