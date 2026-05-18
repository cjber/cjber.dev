// Monochrome project marks, all 24x24 viewBox, fill="currentColor" so the
// page controls colour via Tailwind text-*. Reduced from each project's
// real brand mark or repo logo where one exists.

type IconProps = { className?: string }

export function NebulaIcon({ className }: IconProps) {
  // Three concentric orbits and a centre dot, the shape of nebula.gg's
  // icon flattened to a single fill.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="3.2" cy="12" r="1.4" />
      <circle cx="20.8" cy="12" r="1.4" />
      <path
        d="M5.2 11.2c1-3.2 3.5-5.8 6.7-6.8M18.8 12.8c-1 3.2-3.5 5.8-6.7 6.8"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThirdwebIcon({ className }: IconProps) {
  // Three slanted bars; matches the thirdweb-icon.svg shape (parallelograms
  // stacked left-to-right), redrawn monochrome.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M2.3 4h4.8L11 19.5c.3.9-.4 1.9-1.4 1.9H7.4c-.6 0-1.1-.3-1.3-.9L2.3 5.4c-.2-.7.3-1.4 1-1.4z" />
      <path d="M9.6 4h4.8l3.6 14.7c.2.9-.5 1.7-1.4 1.7h-1.8c-.6 0-1.1-.4-1.3-.9L8.6 5.4c-.2-.7.3-1.4 1-1.4z" />
      <path d="M16.9 4h4.8c.7 0 1.2.7 1 1.4l-3.5 14c-.2.5-.7.9-1.3.9h-1.7c-1 0-1.7-1-1.4-2L16.9 4z" />
    </svg>
  )
}

export function HyprviewIcon({ className }: IconProps) {
  // 2x2 grid of rounded squares, top-left active (matches the repo logo).
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="1.5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" opacity="0.35" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" opacity="0.35" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" opacity="0.35" />
    </svg>
  )
}

export function OxideIcon({ className }: IconProps) {
  // Fanned colour-swatch cards (matches the repo logo).
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <g>
        <rect x="3"  y="6"  width="11" height="11" rx="1.5" transform="rotate(-12 8.5 11.5)" opacity="0.25" />
        <rect x="5"  y="6"  width="11" height="11" rx="1.5" transform="rotate(-4 10.5 11.5)" opacity="0.5" />
        <rect x="7"  y="6"  width="11" height="11" rx="1.5" transform="rotate(4 12.5 11.5)"  opacity="0.75" />
        <rect x="9"  y="6"  width="11" height="11" rx="1.5" transform="rotate(12 14.5 11.5)" />
      </g>
    </svg>
  )
}

export function DotfilesIcon({ className }: IconProps) {
  // Terminal prompt: $ + cursor.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7l4 5-4 5" />
      <path d="M12 17h8" />
    </svg>
  )
}

export function ResearchIcon({ className }: IconProps) {
  // Stack of papers / journal pages.
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M15 4v4h4" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h7" />
    </svg>
  )
}
