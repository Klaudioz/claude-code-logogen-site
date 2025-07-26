# ASCII Art Generator

A React-based Claude Code logo generator that creates beautiful text art using Unicode box-drawing characters. Built with Vite, TypeScript, and Tailwind CSS, and deployable to Cloudflare Workers.

## Features

- Generate Claude Code logo from any text input
- Support for multi-line text using `\n`
- Download generated art as PNG images
- Responsive design with dark theme
- Fast performance with Vite and Cloudflare Workers

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Cloudflare Workers

This project is configured to deploy to Cloudflare Workers using the Cloudflare Vite plugin.

### Prerequisites

1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
2. Authenticate with Cloudflare: `wrangler login`

### Deploy

```bash
# Build and deploy
npm run deploy

# Or deploy manually
npm run build
wrangler deploy
```

The app will be available at `https://claude-code-logogen.<your-subdomain>.workers.dev`

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Cloudflare Workers** - Deployment platform
- **HTML5 Canvas** - PNG export functionality

## How It Works

The app uses a predefined font system with Unicode box-drawing characters to create 3D-style ASCII art. Each character is mapped to a 6-line pattern, and the generator combines these patterns to create the final artwork.

Characters supported: A-Z, 0-9, and spaces (all converted to uppercase).