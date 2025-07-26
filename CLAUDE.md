# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vite + React TypeScript application that generates Claude Code logo using Unicode box-drawing characters. The app is configured for deployment on Cloudflare Workers with static assets.

Key features:
- Text input with support for multi-line text using `\n`
- Real-time ASCII art generation using predefined character patterns
- PNG export functionality using HTML5 Canvas
- Responsive design with Tailwind CSS and custom orange theme

## Development Commands

- `npm run dev` - Start development server with Cloudflare Vite plugin
- `npm run build` - Build for production
- `npm run preview` - Preview built application locally
- `npm run deploy` - Build and deploy to Cloudflare Workers

## Project Structure

```
src/
  components/
    ASCIIGenerator.tsx    # Main ASCII art generator component
  App.tsx                 # Root application component
  main.tsx               # React application entry point
  index.css              # Global styles with Tailwind
vite.config.ts           # Vite configuration with Cloudflare plugin
wrangler.jsonc           # Cloudflare Workers configuration
tailwind.config.js       # Tailwind CSS configuration
```

## Architecture

### Core Component (`ASCIIGenerator`)
- **Character Font System**: Complete mapping of A-Z letters and 0-9 numbers to 6-line ASCII patterns
- **Text Processing**: Multi-line input handling with `\n` delimiter
- **Canvas Rendering**: HTML5 Canvas API for PNG export with proper error handling
- **State Management**: React hooks for text input and generated ASCII art

### Deployment Configuration
- **Cloudflare Workers**: Uses `@cloudflare/vite-plugin` for seamless development and deployment
- **Static Assets**: Configured as SPA with `not_found_handling: "single-page-application"`
- **TypeScript**: Full TypeScript support with strict type checking

## Styling

- **Framework**: Tailwind CSS for utility-first styling
- **Theme**: Dark mode with orange accent color (`#D97757`)
- **Typography**: Monospace fonts for ASCII art display
- **Responsive**: Mobile-friendly design with proper spacing

## Character Set

Supports A-Z letters, 0-9 numbers, and spaces. All input is converted to uppercase for consistency. ASCII patterns use Unicode box-drawing characters (█, ╗, ╔, ║, ╝, ═, etc.) and are exactly 6 lines tall.