# UVM AERO Website Migration Plan

**Handoff document for an implementation agent.** This describes exactly what
exists today, what it's becoming, and the steps to get there. Read the whole
thing before starting — later sections assume context from earlier ones.

Status as of writing: server-side cleanup is done. This document covers the
actual migration (Flask + React rebuild, deployment to UVM's Silk hosting).

---

## Status as of 2026-09-28 — read this first if you're picking this up

Phases 1–4 (backend scaffold, frontend scaffold, page ports, local dev
wiring) are **done and verified working** — both in Vite dev mode (`npm run
dev` + `python app.py`, proxied) and as a production build served directly
by Flask (`npm run build` then `python app.py` alone). All six pages were
checked pixel-by-pixel against the original static site in a real browser;
tab switching, the mobile nav, and API-backed data (team roster, donation
stats/progress bar, budget) all work. The Contact form correctly POSTs to
`/api/contact` and shows a friendly error when SMTP isn't configured.

**One bug found and fixed during verification:** the initial Flask app used
`static_folder=FRONTEND_DIST, static_url_path=""`, which let Flask's
built-in static handler intercept requests like `/car` before they reached
the SPA-fallback route, causing a 404 on any direct navigation/refresh of a
client-side route. Fixed by setting `static_folder=None` and handling all
serving (API, static files, and the `index.html` SPA fallback) through the
app's own routes in `backend/app.py`. If you touch that file's routing,
re-verify direct navigation to a non-root route (e.g. `curl -i
http://127.0.0.1:5000/car` after `npm run build`) still returns the app
shell, not a 404.

**What's NOT done — pick up here:**

1. **Contact form SMTP credentials (blocking, in progress).** Decided:
   Gmail SMTP (`smtp.gmail.com:587`) using an App Password on
   `uvmaero@gmail.com`, sending to `uvmaero@gmail.com`. The user is waiting
   on admin approval to generate that App Password. `backend/app.py`
   already reads `SMTP_USER`/`SMTP_PASS`/`CONTACT_TO` from the process
   environment — **there is no `.env` loader wired up** (no
   `python-dotenv`), `backend/.env.example` is documentation only. Once
   credentials exist, either export them in the shell before running
   `app.py`, or ask the user whether to add `python-dotenv` for
   convenience (not added speculatively — wasn't asked for).
2. **Deployment to Silk (§5)** — nothing done here yet. Follow the deploy
   steps as written; the account/paths/`.silk.ini` details in §5 haven't
   changed.
3. **Donation scrape script (§6)** — not started. Still needs the
   GiveCampus stats-page URL confirmed and a robots.txt/ToS check before
   writing anything.
4. **Dev-site Silk folder naming** — unconfirmed empirically, per §5.
5. **Placeholder content** — car specs, budget figures, sponsor
   names/logos, mailing address are still placeholders in
   `backend/data/*.json`, exactly as before. Don't fill these in with
   invented data.
6. **Whether to delete `static/*.html`** — still undecided, still kept.

Nothing above blocks local development or testing the rest of the site —
only the Contact form's actual email delivery is gated on item 1.

---

## 1. Background

UVM AERO (Alternative Energy Racing Organization) is a student club at the
University of Vermont that builds electric formula-style racecars for the
Formula Hybrid+Electric competition. This repo (`uvm-aero-website`) is their
public site: who they are, the car, the team, sponsors, and how to donate.

The site is currently fully static (plain HTML/CSS, Tailwind via CDN, no
build step, no backend) and hosted on GitHub Pages. It's being rebuilt as a
**Flask (API) + React (frontend)** app and deployed to UVM's own hosting
(`aero.w3.uvm.edu`, with `dev.aero.w3.uvm.edu` as a staging site, and
`aero.uvm.edu` as a future possibility pending UVM web-team approval —
out of scope for this pass).

**Why no database:** nothing on this site handles real transactions or user
accounts. Donations are processed entirely off-site by UVM Foundation's
GiveCampus platform — this site only *displays* sponsor/donation info. Flat
JSON files are sufficient and were already the direction hinted at in the
current code (see `support.html`'s donation script comment). Do not introduce
SQLite/MySQL unless a genuine need for real records emerges (e.g. an admin
UI that needs concurrent writes) — check with the user first if that comes
up, don't just add it.

## 2. Current repo inventory

Tracked files (`git ls-files`):
```
README.md
car.html
contact.html
index.html
sponsors.html
support.html
team.html
static/GS4_4.jpg
static/aeroinsta-1.jpg
static/favicon.png
static/logo.jpeg
static/logo.png
static/team/*.jpg          (10 headshots)
archive/index.html
archive/media.html
archive/our_cars.html
archive/our_team.html
```

**`archive/`** is a previous generation of the site kept for reference.
**Do not migrate or delete it** — leave it exactly as is unless the user
explicitly asks otherwise.

Every live page shares the same `<head>` boilerplate (Tailwind CDN config,
icon link), the same fixed nav + mobile slide-out menu, and the same footer.
That shared chrome is the first thing to extract into React components.

### Design tokens (port these exactly — don't reinvent)
```js
colors: {
  background: '#050a06',
  foreground: '#f5f5f0',
  card: '#0c1e10',
  accent: '#2a7d4f',
  muted: '#7a9e7e',
  border: 'rgba(245, 245, 240, 0.12)',
}
fontFamily: {
  mono: ["'Andale Mono'", "'Courier New'", 'monospace'],   // body font
  display: ["'Helvetica Neue'", 'Helvetica', 'Arial', 'sans-serif'], // headings
}
```
Body uses `font-mono` throughout; big uppercase headings use `font-display`
with tight/negative letter-spacing (`-0.02em`) and `font-black`. Nav/label
text uses small sizes (0.6–0.75rem) with wide letter-spacing (0.12–0.2em) —
this is a deliberate, consistent typographic voice. Preserve it.

### Page-by-page inventory

**`index.html`** — Home.
- Hero: full-viewport section, background image `static/aeroinsta-1.jpg` at
  20% opacity with a gradient overlay, giant "AERO / RACING / FSAE-'26"
  headline (last word rendered as outlined/stroked text via
  `-webkit-text-stroke`, not a real font weight — replicate with CSS,
  not an image).
- "Student built. Student driven." mission blurb, two paragraphs.
- 2x2 "explore" grid linking to Car/Team/Sponsors/Contact.
- Static footer with social links (Instagram, Facebook, X, LinkedIn — same
  four links/URLs on every page, hardcode once in the Footer component).

**`car.html`** — The car.
- Split hero: image (`static/GS4_4.jpg`) left, spec panel right.
- Tabbed spec table: Specs / Aero / Electrical, each a list of label→value
  rows. **All values are currently placeholder em-dashes (`—`)** — there's
  an HTML comment marking this (`TODO: replace placeholder (—) spec values
  with real figures once available`). Keep them as placeholders in the
  data file; don't invent numbers.
- Tab switching is vanilla JS class-toggling — becomes a `useState` in React.

**`team.html`** — Roster.
- Grid of 10 team members, each: photo (`static/team/<slug>.jpg`), a
  category label (LEADERSHIP / ELECTRICAL / MECHANICAL / SYSTEMS / BUSINESS
  / MEDIA), name, role. This is real, current data — migrate as-is into
  `team.json`. Full roster (name → role → category → image):
  ```
  Tyler Meadows      — President               — LEADERSHIP  — tyler-meadows.jpg
  Colden Briggs      — Vice President           — LEADERSHIP  — colden-briggs.jpg
  Tobijas Rigdon     — Treasurer                — LEADERSHIP  — tobijas-rigdon.jpg
  George Hurd        — Electrical Lead          — ELECTRICAL  — george-hurd.jpg
  Marko Soren        — Junior Electrical Lead   — ELECTRICAL  — marko-soren.jpg
  Kam Drew           — Mechanical Lead          — MECHANICAL  — kam-drew.jpg
  Will Miemis        — Mechanical Lead          — MECHANICAL  — will-miemis.jpg
  Nikhil Barnick     — Systems Integration Lead — SYSTEMS     — nikhil-barnick.jpg
  Sofia DeAngelis    — Business Lead            — BUSINESS    — sofia-deangelis.jpg
  Meredith Batey     — Social Media             — MEDIA       — meredith-batey.jpg
  ```
- "Join the team" link to Contact.

**`sponsors.html`** — Partners.
- Infinite CSS-marquee of sponsor names (currently all placeholder text:
  "YOUR LOGO HERE" / "SPONSOR" / "PARTNER" / "SUPPORTER"). Marquee pauses
  on hover/focus and respects `prefers-reduced-motion`. Real sponsor
  logos/names go in `sponsors.json` once available — **do not invent
  sponsor names**.
- "Become a partner" CTA linking to Contact.

**`contact.html`** — Contact.
- Left column: social links + physical location ("Votey Hall, Room 118 —
  University of Vermont, Burlington VT").
- Right column: a form (name, email, org, message) that is currently
  **non-functional** — `<form onsubmit="return false;">`, goes nowhere.
  **This needs a real decision before implementation**: should submitting
  this form (a) POST to a Flask endpoint that emails the club (needs SMTP
  credentials — ask the user what address/service to use), (b) POST to an
  endpoint that just appends to a local JSON/log file for manual review, or
  (c) stay a no-op for now? **Ask the user; don't assume.**

**`support.html`** — Donate. The most complex page.
- Stat tiles (raised / goal / donors) and a progress bar, currently computed
  client-side from a hardcoded `donations` JS array against a hardcoded
  `GOAL = 5000`.
- Donor feed list (name, amount, method, date, memo) rendered from that same
  array.
- Real "give" CTA links out to GiveCampus:
  `https://www.givecampus.com/campaigns/57653/donations/new?a=10657647&designation=aero`
  — **actual payment happens off-site, this app never touches money.**
- Budget breakdown tabs (Build Season / Competition), also placeholder
  em-dashes — same treatment as the car specs page.
- Several inline HTML comments mark placeholders needing real values:
  mailing address for check donations, contact email (`aero@uvm.edu` is
  a placeholder, verify before shipping), sponsor tier link.
- The existing JS comment literally says: *"Swap this whole block for a
  `fetch('_data/donations.json')` call... if you want it driven by the
  same JSON file used elsewhere on the site."* This confirms the intended
  direction — implement exactly that, via `GET /api/donations` (Flask
  serving `donations.json`) instead of a hardcoded array.

## 3. Target architecture

```
uvm-aero-website/
├── backend/
│   ├── app.py                # Flask app: serves API + built frontend
│   ├── wsgi.py                # Silk's NGINX Unit entrypoint (imports app)
│   ├── requirements.txt
│   ├── data/
│   │   ├── team.json
│   │   ├── sponsors.json
│   │   ├── donations.json     # written by the scrape script, read by API
│   │   ├── car_specs.json
│   │   └── budget.json
│   └── scripts/
│       └── scrape_donations.py   # run daily via cron (see §6)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Nav.jsx           # incl. mobile slide-out menu
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx          # index.html
│   │   │   ├── Car.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── Sponsors.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── Support.jsx
│   │   ├── theme/                # tailwind tokens from §2, single source
│   │   └── main.jsx              # React Router setup
│   ├── public/                   # static assets copied from /static
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── archive/                       # untouched, do not migrate
├── static/                        # keep during migration for reference;
│                                   # remove once frontend/public/ has
│                                   # everything and old *.html are gone
└── MIGRATION_PLAN.md              # this file
```

Use **Vite** for the React app (fast, simple, no framework opinions beyond
what's needed — matches the "minimal" brief). React Router for the five
page routes. Recommend functional components + hooks throughout, nothing
fancier needed for a site this size — no Redux, no server components, no
Next.js. Fetch data client-side from the Flask API on mount, or, if SEO
for these pages matters to the user, ask before adding SSR — don't add it
speculatively.

In production, Flask serves the built `frontend/dist/` as static files
(via Silk's `document-root` setting, see §5) *and* the `/api/*` JSON
endpoints. In local dev, run Vite's dev server on its own port with a
proxy to Flask for `/api` (Vite's `server.proxy` config) so both hot-reload
independently.

### API endpoints (all read-only GET except contact, pending §2's open question)
```
GET  /api/team          -> team.json
GET  /api/sponsors      -> sponsors.json
GET  /api/donations     -> donations.json (raised/goal/donors/feed)
GET  /api/car-specs     -> car_specs.json
GET  /api/budget        -> budget.json
POST /api/contact       -> pending decision, see §2 contact.html notes
```
Keep these as flat static-file reads (`json.load` + return) — no ORM, no
caching layer, this is low-traffic content. Add CORS headers only if/when
frontend and backend are actually served from different origins in
production (they won't be — Flask serves both under one host — but the
local dev split needs `flask-cors` or a Vite proxy; prefer the proxy,
it avoids needing CORS config entirely).

## 4. Local development setup

```bash
# Backend
cd backend
python3 -m venv venv
./venv/bin/pip install flask flask-cors   # flask-cors only if not using vite proxy
./venv/bin/python app.py

# Frontend
cd frontend
npm install
npm run dev   # Vite dev server, proxies /api to Flask
```

## 5. Deployment target: UVM Silk hosting

Account: NetID `aero`, host `silk36.uvm.edu` (`silk.uvm.edu` is the public
alias — DNS already confirmed to resolve for both `aero.w3.uvm.edu` and
`dev.aero.w3.uvm.edu`, no DNS request needed for either).

Silk hosting facts (from https://silk.uvm.edu/hosting-questions/), verified
against this account:
- The account's **default site** (`aero.w3.uvm.edu`) is served from
  `~/www-root`. There's no domain-named folder for it — it's implicit.
- Additional custom domains get a folder named `<domain>-root` (confirmed:
  `~/uvmaero.org-root`, `~/documentation.uvmaero.org-root.legacy`).
- Additional "sitename" subdomains under the account
  (`<sitename>.aero.w3.uvm.edu`) are described as "generally available" —
  **exact folder-naming convention for these was not confirmed in the docs
  we had access to.** First thing to try: `~/dev.aero.w3.uvm.edu-root`
  (following the same pattern as custom domains). If it doesn't get picked
  up within ~10 minutes of creating it, look for a more specific "creating
  a site" page on silk.uvm.edu, and failing that, email SAA
  (Systems and Application Administration).
- Python apps run via **NGINX Unit**, configured through a `.silk.ini` file
  at the site root. Example (`~/www-root/.silk.ini`):
  ```ini
  [general]
  document-root = frontend/dist

  [python]
  version = 3.12

  [app]
  type = python
  root = backend
  uri = /api/*
  startup-script = wsgi.py
  venv-path = /users/a/e/aero/www-root/backend/venv
  ```
  (`root`/`document-root` paths are relative to the site root — adjust to
  match wherever the built frontend and backend actually land; confirm the
  exact `venv-path` absolute path matches this account's home, which per
  the `authorized_keys` file listing is `/users/a/e/aero/`.)
- `startup-script` (`wsgi.py`) must be executable: `chmod u+x wsgi.py`.
- Venvs on Silk **don't support `activate`** — always invoke
  `venv/bin/python` / `venv/bin/pip` directly, including inside any deploy
  script.
- After creating or changing `.silk.ini`, run `silk app <hostname> load`
  (e.g. `silk app aero.w3.uvm.edu load`) to apply it. Same command reloads
  after code changes — Unit doesn't hot-reload Python changes.
- Logs: `/usr/lib/unit-user-aero/unit.log`.
- Available Python versions via `.silk.ini`: `3.10`, `3.12` (default),
  `3.14`. Node via mise is currently pinned to `20` in `~/.mise.toml`
  (`[tools] node = "20"`) — fine for building the React app with Vite.

### Server-side directory plan
```
~/www-root                          -> NEW production site (aero.w3.uvm.edu)
~/www-root.legacy-wiki               -> old MediaWiki, preserved, not served
~/dev.aero.w3.uvm.edu-root (tbd)     -> staging deployment
~/documentation.uvmaero.org-root.legacy  -> old, untouched, out of scope
~/uvmaero.org-root                   -> empty, domain lost, out of scope
```

### Deploy steps (manual first pass; scripting/CI is a later optimization,
don't build it speculatively now)
1. `npm run build` locally in `frontend/` → produces `frontend/dist/`.
2. Copy the repo (or just `backend/` + `frontend/dist/`) to the server —
   `scp`/`rsync` over the SSH key already set up for this account (now
   living in `~/.ssh/aero` locally, **not** in the repo).
3. On the server, inside the site's `backend/`:
   `python3 -m venv venv && ./venv/bin/pip install -r requirements.txt`
4. Write/update `.silk.ini` as above.
5. `chmod u+x backend/wsgi.py`
6. `silk app aero.w3.uvm.edu load`
7. Verify: load `https://aero.w3.uvm.edu/` and hit a couple of `/api/*`
   endpoints directly.

Do the same against `dev.aero.w3.uvm.edu` first as a dry run before
touching the production hostname, once that site's doc-root naming is
confirmed.

## 6. Donation data — daily scrape (per user request)

The user wants a cron job, roughly once a day, that pulls current
raised/goal/donor info from the GiveCampus campaign page
(`https://www.givecampus.com/campaigns/57653/donations/new?a=10657647&designation=aero`
— note this is the *donation form* URL; the campaign's public *stats* page,
if one exists, is likely a different URL under the same campaign ID — find
and confirm the right page before writing the scraper) and writes
`backend/data/donations.json`.

**Before writing this script:**
- Check GiveCampus's `robots.txt` and Terms of Service for scraping
  restrictions. If scraping isn't permitted or the page is JS-rendered in a
  way that makes this fragile, tell the user rather than working around it
  — a manually-updated JSON file is a perfectly fine fallback and was
  already the user's stated backup plan ("fine with no db as long as we can
  get data from the uvm support/dono page" implies best-effort, not a hard
  requirement).
- GiveCampus may expose structured data (an embedded JSON blob, a widget
  API, or an RSS/JSON feed for the campaign) rather than requiring raw HTML
  scraping — check for that first, it'll be far more stable than parsing
  rendered HTML.
- Keep the scraper isolated (`backend/scripts/scrape_donations.py`), have
  it fail loudly but *not* wipe `donations.json` on a failed run (write to
  a temp file, only replace on success) so a transient scrape failure
  doesn't blank the site's donation numbers.
- Cron entry (on the Silk account, `crontab -e`; note `crontab -l`
  currently shows none configured):
  ```
  0 6 * * * /users/a/e/aero/www-root/backend/venv/bin/python /users/a/e/aero/www-root/backend/scripts/scrape_donations.py
  ```
  (adjust path once actual deployed location is confirmed; pick a time —
  6am was arbitrary, ask the user if they care).

## 7. Open decisions — confirm with the user before implementing these parts

1. **Contact form destination** (§2, `contact.html`) — email via SMTP, log
   to a file, or leave inert for now?
2. **Exact dev-site folder name** on Silk — confirm empirically (§5).
3. **Donation scrape source** — exact GiveCampus URL/endpoint to pull from,
   and whether scraping is even the right call vs. manual updates (§6).
4. **Placeholder content** — car specs, budget figures, sponsor names,
   mailing address, contact email (`aero@uvm.edu`) are all currently
   placeholders in the existing HTML. Don't invent real-looking data to
   fill these in; carry the placeholders forward into the JSON files and
   flag them for the user to fill in with real figures.
5. Whether `static/` and the original `*.html` files get deleted once the
   React app fully replaces them, or kept around for a transition period —
   ask before deleting anything tracked in git.

## 8. Things already done (don't redo)

- Local repo hygiene: stray unencrypted SSH keypair (`aero`/`aero.pub`) has
  been moved out of the repo to `~/.ssh/` — confirmed gone from
  `git status`.
- Server cleanup: `documentation.uvmaero.org-root` (unconfigured leftover
  MediaWiki checkout) renamed to `documentation.uvmaero.org-root.legacy`,
  no longer served.
- `www-root` (old live wiki, broken due to an unresolved WebDB grant issue
  for `aero_admin`) renamed to `www-root.legacy-wiki`; a fresh empty
  `www-root` is ready for the new site.
- DNS confirmed already pointing `aero.w3.uvm.edu` and `dev.aero.w3.uvm.edu`
  at `silk.uvm.edu` (132.198.100.191).
