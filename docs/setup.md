# Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) NVIDIA NIM API key
- (Optional) CoinMarketCap API key

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Rohan5commit/regimforge.git
cd regimforge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your NIM API key to .env.local
# NIM_API_KEY=nvapi-your-key-here

# Run development server
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NIM_API_KEY | Yes | NVIDIA NIM API key for AI inference |
| NIM_BASE_URL | No | NIM API base URL (default: https://integrate.api.nvidia.com/v1) |
| NIM_MODEL | No | NIM model (default: nvidia/llama-3.3-70b-instruct) |
| CMC_API_KEY | No | CoinMarketCap API key (uses demo data if absent) |

## Production Build

```bash
npm run build
npm start
```

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# NIM_API_KEY, CMC_API_KEY
```

## Running Without AI

The skill works in deterministic-only mode without NIM:
- Select "Deterministic Only" toggle in the UI
- Or pass `useAI: false` in the API

In this mode, the regime is classified using computed signals only.
