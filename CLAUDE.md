# cjber.dev Development Guide

## Design System

### Visual Identity
- **Theme**: DarkMatter from [tweakcn](https://tweakcn.com/editor/theme?theme=darkmatter)
- **Fonts**: 
  - Sans: Geist Mono (monospace)
  - Mono: JetBrains Mono
- **Color Scheme**: Uses OKLCH color space with automatic dark/light mode support
  - Defined in shadcn/ui theme system via CSS variables
  - Primary colors: Orange/amber tones in dark mode
  - Consistent use of CSS variables for all colors (no hardcoded values)
- **Style**: Minimal, clean aesthetic with subtle shadows and transitions
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