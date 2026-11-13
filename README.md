# 311chat

SubX room #17: municipal non-emergency 311 router (public beta).

Static site. `siteId` is `311chat`. Custom domain in `CNAME` is `311chat.com`. Live: Beta banner, search indexing allowed (`robots.txt` + `sitemap.xml`).

Deploy `main` from `/` on Cloudflare Pages or GitHub Pages. Factory shell talks to Firebase project `subx-skins` (same public web config as the other skins).

## Outside this repo

- Firestore allowlist for `siteId` `311chat` (CTO).
- Cloudflare Pages custom domain `311chat.com` (CTO).
