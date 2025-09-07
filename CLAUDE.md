# cjber.dev Development Guide

## Post-Change Testing Checklist

After making any code changes, **ALWAYS** run these commands to ensure quality:

### 1. Type Checking
```bash
npx tsc --noEmit
```
Ensures all TypeScript types are correct.

### 2. Build Test
```bash
npm run build
```
Verifies the application builds successfully without errors.

### 3. Development Server Test
```bash
npm run dev
```
Check that the site runs locally and test functionality:
- Terminal commands work (help, whoami, about, links, clear, echo)
- Enter key properly submits commands
- Clear command clears history
- Cursor follows text input
- Colors display correctly

### 4. Manual Testing Checklist
- [ ] Last login timestamp displays correctly
- [ ] Terminal output has proper line breaks
- [ ] Commands respond when Enter is pressed
- [ ] Cursor is visible and moves with text
- [ ] No underline on input field
- [ ] Click anywhere focuses terminal
- [ ] Background is Catppuccin Mocha dark (#1E1D2D)
- [ ] Text uses consistent font size (14px)

## Project Structure

- **Colors**: Catppuccin Mocha theme constants in `app/page.tsx`
- **Font**: JetBrains Mono from Google Fonts
- **Styling**: Inline styles for consistency with Tailwind v4
- **Features**: Interactive terminal with working commands

## Known Commands

- `help` - Show available commands
- `whoami` - Display username
- `about` - Show about text
- `links` - Display contact links
- `clear` - Clear terminal history
- `echo [text]` - Echo input text

## Deployment

Push to GitHub and deploy via Cloudflare Pages:
```bash
git add -A
git commit -m "Update terminal interface"
git push origin main
```

## Notes

- Always use constants for colors and font sizes
- Test all interactive features after changes
- Ensure proper newline rendering in terminal output