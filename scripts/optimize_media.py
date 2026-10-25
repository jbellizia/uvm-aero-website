"""Turn the Drive photo archive into the web-ready tree the backend serves.

    python scripts/optimize_media.py SRC OUT [--cache DIR]

SRC holds one folder per year (`2024` or `2024-25`) of original photos. OUT must be
empty or missing; it receives `<year>/thumb/<slug>.jpg` and `<year>/full/<slug>.jpg`.
Images are auto-rotated from EXIF, written as JPEG, and saved without any EXIF
(including GPS). With --cache, encoded outputs are reused for originals whose bytes
haven't changed since the last run.
"""

import argparse
import hashlib
import re
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

YEAR_RE = re.compile(r"^\d{4}(-\d{2})?$")
INPUT_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}
SIZES = {"thumb": 600, "full": 2000}
JPEG_QUALITY = 82
# Bump to invalidate cached outputs after changing sizes or encoding settings.
CACHE_VERSION = "1"


def warn(message):
    # GitHub Actions renders this as a warning annotation; locally it's a plain line.
    print(f"::warning::{message}", file=sys.stderr)


def slugify(name):
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "photo"


def file_hash(path):
    h = hashlib.sha256(CACHE_VERSION.encode())
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def encode(src, dests):
    """Write each size of `src` to dests[size]. Raises on unreadable images."""
    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        icc_profile = img.info.get("icc_profile")
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
            background = Image.new("RGB", img.size, "white")
            background.paste(img, mask=img.getchannel("A"))
            img = background
        else:
            img = img.convert("RGB")

        for size, dest in dests.items():
            resized = img.copy()
            resized.thumbnail((SIZES[size], SIZES[size]), Image.Resampling.LANCZOS)
            # No exif= argument, so Pillow writes no EXIF. The ICC profile only
            # describes color, so keep it to avoid washed-out iPhone (Display P3) photos.
            resized.save(
                dest,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
                icc_profile=icc_profile,
            )


def year_dirs(src):
    for entry in sorted(src.iterdir()):
        if entry.name.startswith("."):
            continue
        if entry.is_dir() and YEAR_RE.match(entry.name):
            yield entry
        else:
            warn(f"Ignoring '{entry.name}': only year folders like 2024 or 2024-25 are published")


def originals(year_dir):
    for entry in sorted(year_dir.iterdir(), key=lambda p: p.name.lower()):
        if entry.name.startswith("."):
            continue
        if entry.is_file() and entry.suffix.lower() in INPUT_EXTS:
            yield entry
        else:
            warn(f"Ignoring '{year_dir.name}/{entry.name}': not a JPEG, PNG, HEIC, or WebP photo")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("src", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("--cache", type=Path)
    args = parser.parse_args()

    if args.out.exists() and any(args.out.iterdir()):
        parser.error(f"{args.out} is not empty")
    # Created even when there are no photos, so the mirror step syncs an empty tree.
    args.out.mkdir(parents=True, exist_ok=True)
    if args.cache:
        args.cache.mkdir(parents=True, exist_ok=True)

    used_cache_files = set()
    counts = {"encoded": 0, "cached": 0, "failed": 0}

    for year_dir in year_dirs(args.src):
        year_out = {size: args.out / year_dir.name / size for size in SIZES}
        for d in year_out.values():
            d.mkdir(parents=True, exist_ok=True)

        slugs = set()
        for src in originals(year_dir):
            base = slugify(src.stem)
            slug, n = base, 2
            while slug in slugs:
                slug, n = f"{base}-{n}", n + 1

            dests = {size: year_out[size] / f"{slug}.jpg" for size in SIZES}
            cached = None
            if args.cache:
                digest = file_hash(src)
                cached = {size: args.cache / f"{digest}-{size}.jpg" for size in SIZES}
                used_cache_files.update(p.name for p in cached.values())

            try:
                if cached and all(p.is_file() for p in cached.values()):
                    counts["cached"] += 1
                else:
                    encode(src, cached or dests)
                    counts["encoded"] += 1
                if cached:
                    for size in SIZES:
                        shutil.copyfile(cached[size], dests[size])
            except Exception as e:  # noqa: BLE001 - one bad file shouldn't stop the sync
                warn(f"Skipping '{year_dir.name}/{src.name}': {e}")
                counts["failed"] += 1
                for p in [*dests.values(), *(cached or {}).values()]:
                    p.unlink(missing_ok=True)
                continue
            slugs.add(slug)

        if not slugs:
            shutil.rmtree(args.out / year_dir.name)

    if args.cache:
        for p in args.cache.iterdir():
            if p.name not in used_cache_files:
                p.unlink()

    print(
        f"{counts['encoded']} encoded, {counts['cached']} from cache, {counts['failed']} skipped"
    )


if __name__ == "__main__":
    main()
