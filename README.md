# throttle-site

The front-end of [throttle.toys](https://throttle.toys) — a free, dealer-direct marketplace for powersports, boats, and aircraft. Plain HTML/CSS/JS, no build step, no framework. Designed so anyone with basic web skills can ship a change in 5 minutes.

```
              ┌─────────────────────┐
              │  github.com/        │
              │  throttletoys/      │  ← THIS REPO. Source of truth.
              │  throttle-site      │
              └──────────┬──────────┘
                         │  push to main
                         ▼
              ┌─────────────────────┐
              │  GitHub Actions     │  ← Lints + deploys
              │  .github/workflows/ │
              │    deploy.yml       │
              └──────────┬──────────┘
                         │  FTPS over TLS
                         ▼
              ┌─────────────────────┐
              │  cPanel             │
              │  /home/<cpanel-user>/    │
              │    public_html/     │  ← Live files served by Apache
              └──────────┬──────────┘
                         │  HTTPS
                         ▼
                  https://throttle.toys
```

## Quick links

- **Live site:** [throttle.toys](https://throttle.toys)
- **API repo:** lives separately on cPanel (`/home/<cpanel-user>/nodeapps/throttle-api/`) — not in GitHub yet
- **Scraper repo:** [throttletoys/throttle-scrapers](https://github.com/throttletoys/throttle-scrapers)
- **Designer onboarding:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Architecture details:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Security policy:** [docs/SECURITY.md](docs/SECURITY.md)

## Stack

| Layer | Tech | Why |
|---|---|---|
| Markup | Plain HTML5 | Zero build step. Anyone can edit. |
| Styles | Vanilla CSS + a tiny utility layer | No Tailwind/Sass setup needed locally. |
| Scripts | Vanilla ES2022, no framework | Designers don't need to learn React. |
| Maps | Leaflet + CartoDB tiles | Free tier, no API key needed. |
| Charts | Chart.js | Loaded from CDN per page. |
| Routing | Apache `.htaccess` rewrites | `/pricing` → `/pricing.html` clean URLs. |
| Hosting | cPanel + LiteSpeed (Namecheap shared) | Cheap, fast, no Docker. |

## Getting started in 60 seconds

```bash
git clone https://github.com/throttletoys/throttle-site
cd throttle-site
python3 -m http.server 8000
# Open http://localhost:8000
```

The API at `https://api.throttle.toys` is always live, so your local site hits the real backend. No API mock needed.

## Secrets (GitHub Actions)

| Secret | Purpose | How to rotate |
|---|---|---|
| `FTP_SERVER` | cPanel FTPS hostname (set in cPanel → General → Server Info) | cPanel → FTP Accounts |
| `FTP_USERNAME` | `deploy@throttle.toys` (least-privilege sub-account chrooted to `/public_html/`) | Same |
| `FTP_PASSWORD` | FTP password | cPanel → FTP Accounts → Change Password |

Set under repo Settings → Secrets and variables → Actions.

## Branch protection

`main` is the **production branch**. Direct pushes are blocked. Every change goes through a PR with passing CI + 1 reviewer approval.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full designer workflow,
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deploy mechanics, and
[docs/SECURITY.md](docs/SECURITY.md) for the secret-handling policy.
