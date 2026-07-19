# 🌿 VegVikalp — Truly Veg. Verified.

**The world's independent guide to genuinely vegetarian products.**

*Vikalp* (विकल्प) means "alternative" — and there is always a pure one. VegVikalp helps vegetarian families look beyond the green dot: spotting hidden animal-derived ingredients (carmine, gelatin, animal rennet, shellac), avoiding synthetic products that pass as food (industrial acetic-acid "vinegar", analogue paneer), and finding the natural, truly-veg swap for each — with guidance on where to buy, online and offline.

**Tagline:** *Look beyond the green dot.*

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — brand story, featured swaps, video reviews, store teaser |
| `products.html` | Directory of 20 verified truly-veg products in 5 filterable categories, with label tells, price ranges and buy suggestions |
| `compare.html` | The Swap Guide — 8 detailed side-by-side comparisons (synthetic vs fermented vinegar, gelatin vs agar-agar, animal vs vegetarian rennet, fish oil vs algal omega-3, and more) |
| `hidden-nonveg.html` | The Hidden Non-Veg List — E-code reference table, FSSAI veg/vegan mark explainer, 5-step label-reading method, myth-busting FAQ |
| `why-veg.html` | Why Vegetarian — verses from the Vedas, Manusmriti, Bhagavad Gita and Upanishads with citations; sattvic food philosophy; modern research; a 4-week starter plan |
| `store.html` | VegVikalp Store — "Launching Soon" page with waitlist, opening collection, brand promises and roadmap |
| `about.html` | Origin story, mission, values, and the 3-gate verification methodology |

## Project structure

```
├── index.html
├── products.html
├── compare.html
├── hidden-nonveg.html
├── why-veg.html
├── store.html
├── about.html
├── css/
│   └── style.css      # full design system (palette, components, responsive)
└── js/
    └── main.js        # nav, category filters, waitlist forms, video embeds
```

Pure static HTML/CSS/JS — no build step, no framework, no dependencies.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Going live — checklist

- [ ] **Videos:** each video card has `data-video-id=""` — add a YouTube video ID and the card becomes an embedded player on click.
- [ ] **Waitlist forms:** currently save to `localStorage`. Replace the marked block in `js/main.js` with a `fetch()` to your email service (Mailchimp, ConvertKit, or your own API).
- [ ] **Placeholder content:** update the stats strip numbers, testimonial names and the contact email (`namaste@vegvikalp.com`) with real ones.
- [ ] **Deploy:** works as-is on GitHub Pages, Netlify or Vercel (static hosting, zero config).
- [ ] **Domain:** point `vegvikalp.com` / `vegvikalp.in` at the host.

## Editorial principles

1. **No paid listings** — brands cannot buy a recommendation.
2. **Three verification gates** — ingredients, process, and the "was this ever food?" nature test.
3. **No fear-mongering, no unverifiable claims** — cite sources; where unsure, say "Check Label".

## Disclaimer

VegVikalp provides educational information, not medical advice. Ingredient sourcing varies by manufacturer and country and changes over time — always verify the label and veg mark on the exact pack you buy.

---

© 2026 VegVikalp. Made with ahimsa in India, for the world.
