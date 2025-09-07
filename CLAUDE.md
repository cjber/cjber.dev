# cjber.dev Development Guide

## Design System

### Visual Identity
- **Font**: JetBrains Mono (monospace) - Used consistently across all interfaces
- **Color Scheme**: Catppuccin Mocha theme
  - Background: `#1e1e2e` (base)
  - Foreground: `#cdd6f4` (text)
  - Primary: `#89b4fa` (blue)
  - Secondary: `#f38ba8` (red)
  - Muted: `#585b70` (surface2)
  - Border: `#313244` (surface0)
- **Style**: Minimal, terminal-inspired aesthetic with subtle hover effects
- **Layout**: Centered content with responsive grid layouts

### Development Standards

#### Quality Checks
After making changes, always run:
```bash
npx tsc --noEmit  # Type checking
npm run build     # Build verification
```

#### Code Conventions
- Use Tailwind CSS with the established color variables
- Maintain consistent component patterns (see existing components)
- Keep interactions subtle and functional
- Preserve the monospace, technical aesthetic

### Architecture
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS v3
- **Type Safety**: TypeScript strict mode
- **Deployment**: Cloudflare Pages

### Key Principles
1. **Minimalism**: Clean, uncluttered interfaces
2. **Consistency**: Unified design language across all pages
3. **Performance**: Fast loading, optimized assets
4. **Accessibility**: Semantic HTML, proper contrast ratios
5. **Developer-Friendly**: Terminal aesthetic that appeals to technical users