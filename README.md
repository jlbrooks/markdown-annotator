# Markdown Annotator

A simple web application for annotating Markdown specifications with highlights and comments, designed to generate structured feedback for LLM coding agents.

## Features

- **Markdown Input**: Paste any Markdown document into a large textarea
- **Text Selection**: Select any text in the rendered Markdown to add feedback
- **Annotations**: Add comments to highlighted text snippets
- **Visual Feedback**: See all annotations in a sidebar with timestamps
- **Export**: Copy all feedback as formatted Markdown to clipboard
- **Clean UI**: Built with Tailwind CSS for a modern, responsive interface

## Tech Stack

- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- react-markdown (Markdown rendering)
- @tailwindcss/typography (Markdown styling)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build

```bash
npm run build
```

## Usage

1. **Paste Markdown**: In the input view, paste your Markdown specification into the textarea
2. **Share URL** (optional): Click "Share URL" to copy a shareable link with the Markdown pre-filled
3. **Start Annotating**: Click "Start Annotating" to switch to the annotation view
4. **Select Text**: Click and drag to select text in the rendered Markdown document
5. **Add Feedback**: A dialog will appear - type your feedback and click "Save Feedback"
6. **Review Annotations**: All annotations appear in the right sidebar with timestamps
7. **Copy Feedback**: Click "Copy Feedback" to copy all annotations to clipboard
8. **Edit Document**: Click "Back to Edit" to modify the original Markdown

### Prefilling Markdown via URL

You can prefill the Markdown content by using a URL query parameter:

- **Using the Share URL button**: Click "Share URL" in the input view to automatically generate a shareable link
- **Manual URL format**: `http://localhost:5173/?markdown=<base64-encoded-content>`
- **Alternative format**: `http://localhost:5173/?md=<url-encoded-content>`

The app will automatically detect and decode both base64 and URL-encoded content.

### Bash Function for Local Files

A bash helper function is included to quickly generate URLs from local Markdown files:

**One-time setup:**
```bash
# Add to your ~/.bashrc or ~/.zshrc
source /path/to/markdown-annotator/markdown-url.sh
```

**Usage:**
```bash
# Use default localhost
markdown-url myspec.md

# Specify custom host (for network access)
markdown-url myspec.md http://192.168.4.110:5173

# Or run directly without sourcing
./markdown-url.sh myspec.md
```

The function automatically copies the URL to your clipboard (if `xclip` or `pbcopy` is available).

## Output Format

The copied feedback is formatted as Markdown with blockquotes:

```markdown
## Feedback on Specification

> First highlighted text from the document

**Feedback:** The comment/feedback provided by the user

---

> Second highlighted text from the document

**Feedback:** Another piece of feedback
```

This format is designed to be easily pasted back into coding agents for review.

## Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Save feedback in comment dialog
- **Escape**: Cancel comment dialog

## Development Notes

- No persistence: Annotations are stored in memory only (refreshing will clear them)
- Simple architecture: All state managed in the main App component
- Lightweight: No external state management library needed
