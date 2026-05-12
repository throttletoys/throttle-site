# Contributing to throttle-site

Welcome! This doc covers everything from "I just got access" to "I know how to ship safely."

## Tools you need

- **Git** — `brew install git` on Mac, `winget install --id Git.Git` on Windows
- **A code editor** — VS Code is the team default ([code.visualstudio.com](https://code.visualstudio.com)).
- **Python 3** — for the local dev server. Almost certainly already installed.
- *(Optional)* **Node.js 20** — only if you want `npm run dev` with auto-reload.

## Day-one setup (10 minutes)

```bash
git clone https://github.com/throttletoys/throttle-site
cd throttle-site
python3 -m http.server 8000
# Open http://localhost:8000
```

## The change flow

Every change goes through a **pull request (PR)**. Never push directly to `main`.

```bash
git checkout main && git pull
git checkout -b feature/add-faq-section
# edit, save, refresh browser
git commit -am "Add FAQ section to pricing page"
git push origin feature/add-faq-section
# Open PR at https://github.com/throttletoys/throttle-site/pulls
```

Branch types:
- `feature/` — new content or UI
- `fix/`    — bug fix
- `content/` — copy/text only
- `docs/`   — README/contributing/etc.
- `chore/`  — dep bumps, refactors

CI runs in ~90s: htmlhint + stylelint + gitleaks + broken-link-check. Green + 1 reviewer approval → squash-merge → live in ~90s.

## URL → file map

| URL | File |
|---|---|
| `/` | `index.html` |
| `/pricing` | `pricing.html` (Apache strips `.html`) |
| `/m/` | `m/index.html` (mobile auto-routed by `.htaccess`) |
| `/blog/<slug>` | `blog/<slug>.html` |

Editing a page? Find the file with the same name as the URL.

## Style guide

- **HTML** {space indent, lowercase tags, double-quoted attrs, semantic tags, no inline `style=`}
- **CSS** {CSS custom props for theme, mobile-first, kebab-case classes}
- **JS** {vanilla ES2022, `const`/`let` only, `===` not `==`, idempotent scripts}

See [docs/DESIGNER_GUIDE.md](docs/DESIGNER_GUIDE.md) for color palette, component patterns, and accessibility minimums.

## High-impact files (extra care)

| File | Breaks the site if you mess it up |
|---|---|
| `.htaccess` | Apache rewrite → site 500s |
| `index.html` | Homepage |
| `search.html` | Search page |
| `assets/*` | Anything shared |
| `404.html` | The page people see when things break |

For these, preview locally + request a second reviewer.

## Common pitfalls

- **Change not showing?** Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R).
- **Committed an API key?** Tell Ed immediately — rotate it + we force-push clean history.
- **Deploy green but site broken?** Check `/?cache=0`, check deploy logs, `git revert` if needed.

## Not in this repo

`nodeapps/` (API) and `throttle-everything/` (admin scripts) live server-side only. Ask Ed if you need to touch them.
