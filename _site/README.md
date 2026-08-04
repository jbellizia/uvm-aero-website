# uvmaero.org

Static site for UVM AERO (Alternative Energy Racing Organization), hosted with GitHub Pages.

## Structure

- `index.html`, `media.html`, `our_cars.html`, `our_team.html` — site pages
- `static/` — images
- Styled with [Tailwind CSS](https://tailwindcss.com/) via CDN

## Local preview

```
python3 -m http.server
```

Then open `http://localhost:8000`.

## Known issues

- `our_team.html` references `static/card1.jpg`–`card7.jpg` for team member photos; these files are not yet in the repo.
