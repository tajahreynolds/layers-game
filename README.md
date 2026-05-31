# Layers

A digital-first conversation card game for two, designed to deepen connection
**one layer at a time**. Inspired by the vulnerable structure of card games
like *We're Not Really Strangers*, but built for the web — no app, no signup,
no backend. Open the link, put the phone between you, and talk.

> Live-ready: it's plain HTML/CSS/JS. Drop it on Vercel, Netlify, or GitHub
> Pages and it just works.

---

## How to play

1. Open `index.html` (or the deployed link) on any phone or laptop.
2. Enter your names (optional) and read the three house rules.
3. Take turns drawing cards. The card tells you **whose turn it is to answer**.
4. **Pass** anything you're not ready for — consent is part of the game.
5. **♡ Keep** the moments that land. They're waiting for you on the closing
   screen.
6. Move through three layers at your own pace, then **End & reflect**.

### The three layers
| Layer | Theme | What it does |
|---|---|---|
| **Surface** | Perception | Habits, first impressions, the small everyday tells. |
| **Subsurface** | Connection | Emotional blueprints, inherited frameworks, quiet fears. |
| **Core** | Reflection | Process what came up tonight; look at the *us* you're building. |

You unlock the next layer after a few cards, so nobody sprints to the deep end
cold. **Wildcards** (Stare Down, Role Reversal, Gratitude Burst, …) surface
between questions to break the intensity and reset the mood.

---

## Design decisions (and where I diverged from the original brief)

The brief was treated as a starting point, not a spec. The guiding principle:
**connection depends on question *quality*, not infinite quantity.**

- **Curated deck first, generator second.** A naive Mad-Libs engine that stitches
  `[emotion] × [timeline]` at random produces tone-deaf or ungrammatical prompts
  ("How has my *stress level* shifted since *we started this game*?"). One clunky
  question breaks the intimacy. So the deck is hand-written, and the template
  generator (`TEMPLATES` in `questions.js`) is *constrained* — every base sentence
  reads naturally with every value in its arrays. It tops up each layer so the
  deck never feels finite, without the jank.
- **Real turn-taking + a Pass button.** The brief mentioned "taking turns" but
  didn't design the loop. Cards alternate who answers, and anything can be passed.
  Lower stakes → more openness.
- **Pacing & gating.** Layers unlock progressively with a short transition
  moment, instead of dumping all depth at once.
- **A keepsake payoff.** Kept cards reappear on a reflection screen — the
  emotional take-away of a session.
- **Draw-without-replacement.** Fixes the brief's `Math.random` that could repeat
  cards back-to-back.

### Deferred to v2 (intentionally out of MVP scope)
- **Community "Submit a Layer" engine** — needs a moderation queue, storage, and
  abuse handling. A real backend feature, not an MVP one.
- Accounts / cross-device sync, shareable saved sets, more wildcards & layers,
  audio/ambient mode.

---

## Project structure
```
index.html          Markup + screens (setup, game, reflection), overlays, meta/social tags
styles.css          Theming (dark/light), card/overlay styling, focus + reduced-motion
questions.js        All content: curated cards, wildcards, constrained templates
app.js              Game state, draw loop, level gating, wildcards, persistence
site.webmanifest    PWA manifest (Add to Home Screen)
favicon.svg         Scalable favicon (the "layers" mark)
assets/gen_assets.py  Regenerates the PNG icons + social image
*.png               Generated icons + og-image.png (social preview)
```

Content lives entirely in `questions.js` — add or edit prompts there without
touching the logic.

### Regenerating brand assets
The icons and social preview are generated from `assets/gen_assets.py`
(requires `pip install Pillow`). Re-run after changing the palette or wordmark:
```bash
python3 assets/gen_assets.py
```

> **Note:** the social/OG image URLs in `index.html` are absolute and point at
> `tajahreynolds.github.io/layers-game/`. If you move to a custom domain, update
> those `og:image` / `og:url` / `twitter:image` tags to match.

## Run locally
No build step. Just open the file:
```bash
open index.html        # macOS
# or serve it
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy
Static hosting of choice. For Vercel: `vercel deploy` from this directory, or
connect the repo and accept the defaults — there's nothing to configure.
