# uvmaero.org

Static site for UVM AERO (Alternative Energy Racing Organization), hosted with GitHub Pages.

## Structure

- `index.html` (home), `car.html`, `team.html`, `sponsors.html`, `contact.html` — site pages
- `static/` — images
- Styled with [Tailwind CSS](https://tailwindcss.com/) via CDN

## Media page photos

Photos on `/media` come from Google Drive, not git. See [docs/media.md](docs/media.md)
for how to add photos each season and how the sync is set up.

## Local preview

```
python3 -m http.server
```

Then open `http://localhost:8000`.

## Known issues

- `our_team.html` references `static/card1.jpg`–`card7.jpg` for team member photos; these files are not yet in the repo.
