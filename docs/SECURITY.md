# Security

## Reporting a vulnerability

Email **security@throttle.toys** (forwards to Ed). Do not open a public GitHub issue.

## What lives where (sensitivity map)

| Item | Repo? | Why |
|---|---|---|
| HTML/CSS/JS pages | ✅ Public-by-nature | Already served to browsers |
| `.htaccess` | ✅ In repo | Tracked rewrites; rules are public anyway |
| API base URL (`api.throttle.toys`) | ✅ In JS | Public endpoint |
| `INGEST_SECRET` (scraper auth) | ❌ GitHub Secret only | Read in workflows from `${{ secrets.INGEST_SECRET }}` |
| FTP credentials | ❌ GitHub Secret only | `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` |
| DB credentials | ❌ Never in any repo | Read by API at runtime from cPanel env vars |
| Admin debug scripts (`_audit.php`, `_b.php`, etc.) | ❌ Server-only | Should be IP-allowlisted via `.htaccess` |
| Site backup zips (`throttle-site-redesign-*.zip`) | ❌ Move out of `/public_html/` | Source code should not be web-served |

## Hardening checklist

These should all be true at all times:

- [ ] `main` branch is protected (no direct push, PRs require review + green CI)
- [ ] `gitleaks` action runs on every PR and blocks secrets
- [ ] FTP password is rotated quarterly (cPanel → FTP Accounts)
- [ ] `INGEST_SECRET` is rotated whenever a contributor's access is revoked
- [ ] Admin debug endpoints (`/_*.php`) are blocked from public IPs via `.htaccess`
- [ ] `throttle-everything/` and source-backup zips are moved out of `/public_html/`
- [ ] `nodeapps/throttle-api/` has no symlinks into `/public_html/`

## .htaccess rules we rely on for security

```apache
# Block admin debug scripts to non-admin IPs
<FilesMatch "^_[a-z]+\d*\.php$">
    Require ip 1.2.3.4    # Ed's home IP — UPDATE if it changes
    Require ip 5.6.7.8    # office IP
</FilesMatch>

# Block source-backup zips
<FilesMatch "\.(zip|tar\.gz|sql|sh|bak)$">
    Require all denied
</FilesMatch>

# Force HTTPS (already in current .htaccess)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

The repo's `.htaccess` is the source of truth — edits here go live on next deploy.

## What to do if a secret leaks

1. **Within 5 minutes:** rotate the secret at its origin
   - FTP password → cPanel → FTP Accounts → Change Password
   - `INGEST_SECRET` → cPanel → Node.js → Environment Variables → regenerate, restart app
   - DB password → phpMyAdmin → User Accounts → Change Password
2. **Within 1 hour:** update GitHub Secrets to the new value
3. **Within 1 day:** force-push a cleaned git history (Ed will do this) using `git filter-repo`
4. **Audit:** check cPanel access logs + DB logs for the leaked-secret window

## Dependabot policy

Dependabot opens grouped PRs weekly. Auto-merge is **not** enabled — every dep bump goes through human review because dependency hijacks are a known supply-chain attack vector.

## Reporting suspected compromise

If you see ANY of these signs, ping Ed and assume compromise:

- Files in `/public_html/` you didn't commit
- Sudden traffic spikes from one IP
- `error_log` entries showing inbound POSTs to unfamiliar paths
- `_audit.php`-style files in subdirectories
- Outbound network traffic from the API to unknown hosts
- New cron jobs in cPanel

Do not delete the suspicious files — they're forensic evidence.
