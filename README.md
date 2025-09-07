# cjber.dev Portfolio

A modern, dark-themed portfolio website built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Features

- 🌙 Dark mode by default
- ⚡ Fast performance with Next.js 14 App Router
- 🎨 Beautiful UI with shadcn/ui components
- 🎭 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🔍 SEO optimized
- 🚀 Ready for Cloudflare Pages deployment

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Deployment to Cloudflare Pages

### Method 1: GitHub Integration (Recommended)

1. Push this repository to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Environment variables (if needed): Add any required env variables

### Method 2: Direct Upload

```bash
# Build the project
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=cjber-dev
```

### Custom Domain Setup

Since you already use Cloudflare for DNS:

1. Go to your Cloudflare Pages project settings
2. Navigate to "Custom domains"
3. Add `cjber.dev` as your custom domain
4. Cloudflare will automatically configure the DNS records
5. HTTPS is automatically provided

## Environment Variables

No environment variables are required for the basic setup. If you add features like contact forms or analytics, update accordingly.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Theme:** next-themes (dark mode)
- **Hosting:** Cloudflare Pages

## License

MIT