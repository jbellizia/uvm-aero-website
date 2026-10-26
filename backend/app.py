import hmac
import json
import os
import re
import smtplib
import threading
import time
from collections import defaultdict, deque
from email.message import EmailMessage
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder=None)
# Silk serves the app behind a reverse proxy, so remote_addr is the proxy's IP for
# every visitor. Take the client IP from the one X-Forwarded-For entry the proxy adds.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

# Set both only in the staging .env to put the whole site behind Basic Auth.
DEV_AUTH_USER = os.environ.get("DEV_AUTH_USER")
DEV_AUTH_PASS = os.environ.get("DEV_AUTH_PASS")


@app.before_request
def require_dev_auth():
    if not (DEV_AUTH_USER and DEV_AUTH_PASS):
        return None
    auth = request.authorization
    if (
        auth
        and hmac.compare_digest(auth.username or "", DEV_AUTH_USER)
        and hmac.compare_digest(auth.password or "", DEV_AUTH_PASS)
    ):
        return None
    return Response(
        "Authentication required", 401, {"WWW-Authenticate": 'Basic realm="AERO dev"'}
    )


@app.after_request
def noindex_dev(response):
    if DEV_AUTH_USER and DEV_AUTH_PASS:
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


def load_json(name):
    with open(DATA_DIR / name) as f:
        return json.load(f)


@app.get("/api/team")
def team():
    return jsonify(load_json("team.json"))


@app.get("/api/sponsors")
def sponsors():
    return jsonify(load_json("sponsors.json"))


@app.get("/api/donations")
def donations():
    return jsonify(load_json("donations.json"))


@app.get("/api/car-specs")
def car_specs():
    return jsonify(load_json("car_specs.json"))


@app.get("/api/budget")
def budget():
    return jsonify(load_json("budget.json"))


@app.get("/api/site")
def site():
    return jsonify(load_json("site.json"))


# Optimized photos synced from Drive by .github/workflows/sync-media.yml, laid out as
# <year>/thumb/<slug>.jpg and <year>/full/<slug>.jpg. Unset in local dev by default.
MEDIA_DIR = os.environ.get("MEDIA_DIR")
MEDIA_YEAR_RE = re.compile(r"^\d{4}(-\d{2})?$")
# Phone/camera default names (IMG_1234, DSC_0042, PXL_20240101_...) make poor captions.
CAMERA_NAME_RE = re.compile(r"^((img|dsc[nf]?|pxl|mvimg|gopr|dji)-?\d|[\d-]+$)")


def media_alt(slug, year, n):
    if CAMERA_NAME_RE.match(slug):
        return f"UVM AERO {year} photo {n}"
    return slug.replace("-", " ").capitalize()


@app.get("/api/media")
def media():
    root = Path(MEDIA_DIR) if MEDIA_DIR else None
    if not root or not root.is_dir():
        return jsonify([])

    # Tabs: year folders newest first, then any other folders A→Z.
    dirs = [p for p in root.iterdir() if p.is_dir()]
    year_dirs = sorted(
        (p for p in dirs if MEDIA_YEAR_RE.match(p.name)), key=lambda p: p.name, reverse=True
    )
    other_dirs = sorted(
        (p for p in dirs if not MEDIA_YEAR_RE.match(p.name)), key=lambda p: p.name.lower()
    )

    years = []
    for year_dir in year_dirs + other_dirs:
        thumb_dir, full_dir = year_dir / "thumb", year_dir / "full"
        if not thumb_dir.is_dir():
            continue
        year = year_dir.name
        # Non-year folder names can contain spaces etc., so escape them in URLs.
        url_year = quote(year)
        names = sorted(
            p.name for p in thumb_dir.glob("*.jpg") if (full_dir / p.name).is_file()
        )
        photos = [
            {
                "thumb": f"/media/{url_year}/thumb/{name}",
                "full": f"/media/{url_year}/full/{name}",
                "alt": media_alt(Path(name).stem, year, i),
            }
            for i, name in enumerate(names, start=1)
        ]
        if photos:
            years.append({"year": year, "photos": photos})
    return jsonify(years)


@app.get("/media/<path:path>")
def media_file(path):
    if not MEDIA_DIR:
        return Response("Not found", 404)
    # send_from_directory rejects paths that resolve outside MEDIA_DIR.
    return send_from_directory(MEDIA_DIR, path)


CONTACT_MAX_LENGTHS = {"name": 200, "email": 254, "org": 200, "message": 5000}
# Simple shape check; also rejects CR/LF, which would break the email headers.
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Best-effort, in-memory: resets on reload and is counted per worker process.
CONTACT_RATE_LIMIT = 5
CONTACT_RATE_WINDOW = 60 * 60  # seconds
_contact_hits = defaultdict(deque)
_contact_hits_lock = threading.Lock()


def contact_rate_limited(key):
    now = time.monotonic()
    with _contact_hits_lock:
        hits = _contact_hits[key]
        while hits and now - hits[0] > CONTACT_RATE_WINDOW:
            hits.popleft()
        if len(hits) >= CONTACT_RATE_LIMIT:
            return True
        hits.append(now)
        return False


@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    # Honeypot: the "website" field is hidden from people, so only bots fill it.
    # Pretend success so they don't retry.
    if data.get("website"):
        return jsonify({"ok": True})

    fields = {k: str(data.get(k) or "").strip() for k in CONTACT_MAX_LENGTHS}
    name, email, org, message = (fields[k] for k in ("name", "email", "org", "message"))

    if not name or not email or not message:
        return jsonify({"error": "name, email, and message are required"}), 400
    if any(len(fields[k]) > limit for k, limit in CONTACT_MAX_LENGTHS.items()):
        return jsonify({"error": "one or more fields are too long"}), 400
    if not EMAIL_RE.match(email) or "\r" in name or "\n" in name:
        return jsonify({"error": "invalid name or email"}), 400

    if contact_rate_limited(request.remote_addr):
        return jsonify({"error": "too many messages, try again later"}), 429

    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    to_addr = os.environ.get("CONTACT_TO", "uvmaero@gmail.com")

    if not smtp_user or not smtp_pass:
        app.logger.error("Contact form submitted but SMTP_USER/SMTP_PASS are not configured")
        return jsonify({"error": "email is not configured on the server"}), 500

    msg = EmailMessage()
    msg["Subject"] = f"AERO site contact form: {name}"
    msg["From"] = smtp_user
    msg["To"] = to_addr
    msg["Reply-To"] = email
    msg.set_content(
        f"Name: {name}\nEmail: {email}\nOrganization: {org or '(none)'}\n\n{message}"
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
    except (smtplib.SMTPException, OSError):
        app.logger.exception("Failed to send contact form email")
        return jsonify({"error": "failed to send message"}), 502

    return jsonify({"ok": True})


@app.get("/")
@app.get("/<path:path>")
def serve_frontend(path=""):
    full_path = FRONTEND_DIST / path
    if path and full_path.is_file():
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
