## What

<!-- One sentence: what does this PR change on the live site? -->

## Why

<!-- Link the related issue (#123) or describe the motivation. -->

## Preview

<!-- The preview workflow will post a link here after CI runs. -->
<!-- Open it in both Desktop and Mobile, confirm everything looks right. -->

## Checklist

- [ ] Tested locally (`python3 -m http.server 8000`)
- [ ] All CI checks pass (lint, broken-links, gitleaks)
- [ ] No secrets / API keys committed
- [ ] If changing CSS in `assets/`, bumped cache-busting query (`?v=YYYYMMDD`)
- [ ] If changing `.htaccess`, manually tested the affected rewrite
- [ ] Mobile responsive (verified in DevTools or on a real device)
- [ ] Accessibility checked (alt text, focus styles, color contrast)
