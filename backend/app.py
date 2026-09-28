import json
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

app = Flask(__name__, static_folder=None)


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


@app.post("/api/contact")
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    org = (data.get("org") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "name, email, and message are required"}), 400

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
    except smtplib.SMTPException:
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
