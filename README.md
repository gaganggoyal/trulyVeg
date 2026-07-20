# 🌿 TrulyVeg — Truly Veg. Verified.

**🔴 Live:** [trulyveg.com](https://trulyveg.com)

**The world's independent guide to genuinely vegetarian products.**

TrulyVeg helps vegetarian families look beyond the green dot: spotting hidden animal-derived ingredients (carmine, gelatin, animal rennet, shellac), avoiding synthetic products that pass as food (industrial acetic-acid "vinegar", analogue paneer), and finding the natural, truly-veg swap for each — with guidance on where to buy, online and offline.

**Tagline:** *Look beyond the green dot.*

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — brand story, featured swaps, video reviews, store teaser |
| `products.html` | Directory of 25 verified truly-veg products in 5 filterable categories, with label tells, price ranges and buy suggestions |
| `compare.html` | The Swap Guide — 14 detailed side-by-side comparisons (synthetic vs fermented vinegar, gelatin vs agar-agar, animal vs vegetarian rennet, synthetic vs plant colours, vanaspati vs cold-pressed oil & ghee, analogue vs real paneer, synthetic vs natural vanilla, and more) |
| `hidden-nonveg.html` | The Hidden Non-Veg List — animal-derived E-code table, synthetic petroleum/azo-dye and illegal-adulterant-colour tables, FSSAI veg/vegan mark explainer, 5-step label-reading method, myth-busting FAQ |
| `label-scanner.html` | Label Scanner (Beta) — snap/upload an ingredient label; on-device OCR (Tesseract.js) reads it and flags hidden non-veg, synthetic and illegal-adulterant ingredients, each with a truly-veg swap. Nothing is uploaded — the photo never leaves the device |
| `why-veg.html` | Why Vegetarian — verses from the Vedas, Manusmriti, Bhagavad Gita and Upanishads, plus the scriptures of ancient Greece, Jainism, Buddhism, the Bible, Taoism and the Qur'an, all with citations; sattvic food philosophy; modern research; a 4-week starter plan |
| `store.html` | TrulyVeg Store — "Launching Soon" page with waitlist, opening collection, brand promises and roadmap |
| `about.html` | Origin story, mission, values, and the 3-gate verification methodology |

## Project structure

```
├── index.html
├── products.html
├── compare.html
├── hidden-nonveg.html
├── why-veg.html
├── label-scanner.html   # on-device OCR label scanner (Beta)
├── store.html
├── about.html
├── 404.html             # branded not-found page
├── site.webmanifest     # PWA manifest (installable app)
├── sw.js                # service worker (offline app shell + runtime cache)
├── robots.txt           # crawl directives → points to sitemap
├── sitemap.xml          # all indexable URLs
├── favicon.ico / .svg   # site favicons
├── css/
│   └── style.css        # full design system (palette, components, responsive, PWA)
├── js/
│   ├── main.js          # nav, filters, forms, video embeds, SW register + install button
│   ├── label-scanner.js # OCR + non-veg ingredient knowledge base
│   └── vendor/
│       └── tesseract.min.js   # bundled OCR engine (no API key, no quota)
├── icons/               # PWA icons (192, 512, maskable) + apple-touch + source SVGs
└── img/
    └── og-image.png     # 1200×630 social share card
```

Pure static HTML/CSS/JS — no build step, no framework, no npm dependencies. Tesseract.js
is vendored (a single file), so the OCR scanner works with no install and no API key.

## Progressive Web App

The site is installable and works offline:

- **`site.webmanifest`** — name, icons, `standalone` display, and app shortcuts
  (Scan a label / Hidden Non-Veg / Swap Guide).
- **`sw.js`** — precaches the app shell and serves pages network-first with an
  offline fallback; static assets use stale-while-revalidate. Bump the `CACHE`
  version string when you ship changes so clients pick them up.
- **Install button** — an "Install app" pill (bottom-right) appears when the
  browser reports the site is installable (Chromium/Android/desktop). iOS Safari
  shows an "Add to Home Screen" hint instead. Both are wired up in `js/main.js`.

## SEO / indexing

- Every indexable page has a canonical URL, `robots`, Open Graph + Twitter Card
  tags, `theme-color`, and favicon/apple-touch/manifest links.
- **JSON-LD**: `Organization` + `WebSite` on the homepage, `FAQPage` on
  `hidden-nonveg.html` (eligible for FAQ rich results).
- `robots.txt` + `sitemap.xml` list all URLs. **After deploying**, submit
  `https://trulyveg.com/sitemap.xml` in Google Search Console. Update the
  `<lastmod>` dates in `sitemap.xml` when pages change materially.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Deployment

The site is live at **[trulyveg.com](https://trulyveg.com)**, served as static
files by [Caddy](https://caddyserver.com/) on a VPS. Caddy handles HTTPS
automatically via Let's Encrypt (auto-renewing), plus the `www → apex` redirect,
gzip, the custom 404 page, and asset caching.

- **Files on server:** `/var/www/trulyveg` (mounted into the Caddy container as `/srv/trulyveg`)
- **DNS:** `trulyveg.com` and `www.trulyveg.com` A records point at the VPS.

**Redeploy** (upload the latest files) — from the project root:

```bash
rsync -az --delete --exclude='.git' ./ root@<vps>:/var/www/trulyveg/
```

No build step, no restart needed — Caddy serves the new files immediately.

## Still to do before full launch

- [ ] **Videos:** each video card has `data-video-id=""` — add a YouTube video ID and the card becomes an embedded player on click.
- [ ] **Waitlist forms:** currently save to `localStorage`. Replace the marked block in `js/main.js` with a `fetch()` to your email service (Mailchimp, ConvertKit, or your own API).
- [ ] **Placeholder content:** update the stats strip numbers, testimonial names and the contact email (`namaste@trulyveg.com`) with real ones.

## Editorial principles

1. **No paid listings** — brands cannot buy a recommendation.
2. **Three verification gates** — ingredients, process, and the "was this ever food?" nature test.
3. **No fear-mongering, no unverifiable claims** — cite sources; where unsure, say "Check Label".

## Disclaimer

TrulyVeg provides educational information, not medical advice. Ingredient sourcing varies by manufacturer and country and changes over time — always verify the label and veg mark on the exact pack you buy.

---

© 2026 TrulyVeg. Made with ahimsa in India, for the world.
