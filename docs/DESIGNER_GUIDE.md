# Designer guide

This is a quick reference for common UI patterns used across the site. When in doubt, **copy an existing page** rather than inventing a new structure.

## Color palette

Defined as CSS custom properties at the top of most pages, or globally in `assets/theme.css`:

```css
:root {
  /* Backgrounds */
  --bg:        #0a0a0d;     /* page bg */
  --bg-1:     #14141a;      /* card bg */
  --bg-2:     #1c1c25;      /* elevated card */

  /* Text */
  --txt:      #f5f5fa;
  --txt-2:    #b8b8c5;      /* secondary */
  --txt-3:    #7a7a88;      /* tertiary / placeholder */

  /* Accents */
  --accent:   #5af;          /* primary brand blue */
  --good:     #5dd39e;       /* success green */
  --warn:     #ffd166;       /* warning amber */
  --bad:      #ff5e8a;       /* error / destructive */

  /* Lines + spacing */
  --line:     #2a2a35;
  --radius:   8px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  16px;
  --space-4:  24px;
  --space-5:  48px;
}
```

**Rule:** if a color shows up in more than one place, give it a variable. No hex literals in component styles.

## Typography

```
Headings   System UI stack (no webfont)
Body       System UI stack
Tabular    'JetBrains Mono', ui-monospace (numbers in tables)
```

We deliberately don't load custom webfonts. Faster paint, no FOIT, no CLS.

## Spacing scale

Stick to multiples of 4px (`var(--space-1)` through `var(--space-5)`). If you find yourself writing `margin: 13px`, round to 12.

## Standard page skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page Title — Throttle</title>
  <meta name="description" content="…" />
  <link rel="icon" href="/favicon.svg" />
  <!-- Auto-redirect mobile to /m/ — keep this snippet — -->
  <script src="/assets/mobile-redirect.js"></script>
  <style>
    /* page-local CSS here */
  </style>
</head>
<body>
  <nav class="t-nav">…</nav>
  <main>
    <section class="t-hero">…</section>
    <section class="t-feature">…</section>
  </main>
  <footer class="t-footer">…</footer>
  <script>
    /* page-local JS here */
  </script>
</body>
</html>
```

## Common components (copy these)

### Nav bar
Look at `index.html` for the canonical `<nav class="t-nav">`. Don't reinvent it.

### "Card" tile
```html
<article class="t-card">
  <h3 class="t-card-title">…</h3>
  <p class="t-card-body">…</p>
  <a class="t-card-cta" href="…">Learn more →</a>
</article>
```

### Button styles
- `.t-btn` — default ghost button
- `.t-btn.t-btn-primary` — solid accent
- `.t-btn.t-btn-danger` — destructive

### Form input
```html
<label class="t-field">
  <span class="t-field-label">Email</span>
  <input type="email" name="email" required />
</label>
```

## What NOT to do

❌ **Don't add a new color** unless it earns its keep
❌ **Don't use absolute positioning** for layout — use flex/grid
❌ **Don't inline SVGs over 200 lines** — put them in `/img/` and `<img src="…">`
❌ **Don't add `!important`** — fix the specificity instead
❌ **Don't use `<table>` for layout** — only for actual tabular data

## Asset references

- All asset URLs are root-relative: `/assets/main.css`, NOT `assets/main.css`
- Cache-busting: append `?v=YYYYMMDD` to a URL when you ship a breaking CSS change
- Photos: WebP preferred, fall back to JPEG

## Accessibility minimums

Every PR is expected to ship with:

- ✅ Semantic HTML (`<nav>`, `<main>`, `<button>` not `<div onclick>`)
- ✅ Alt text on all content images
- ✅ Color contrast ≥ 4.5:1 for body text (use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/))
- ✅ Focusable interactive elements have a visible `:focus` style
- ✅ Forms have `<label>` associated with each input

Run [axe DevTools](https://www.deque.com/axe/devtools/) on your local before opening a PR. It catches 95% of the common stuff.
