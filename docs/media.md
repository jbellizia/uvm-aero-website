# Media page photos

The `/media` page shows the club's photo archive, one tab per year. Photos are kept
in Google Drive, not in git. A GitHub Actions workflow (**Sync media**) copies them to
Silk as web-sized JPEGs every week, or whenever someone runs it.

```
Drive "AERO Media/<year>/" → Sync media workflow → Silk /users/a/e/aero/media/ → Flask → /media page
```

## Adding photos for a new season

You need edit access to the **AERO Media** folder in the club Google Drive
(uvmaero@gmail.com). To run the sync by hand you also need write access to the GitHub
repo. Without it, just wait for the weekly run.

1. **Open the year folder.** In **AERO Media**, open the folder for the year, e.g.
   `2026`. If it doesn't exist yet, create it. Name it with the year only (`2026`) or
   a season (`2025-26`). Folders with any other name are ignored.
2. **Upload photos into that folder.** Put them directly in the year folder, not in
   sub-folders. Accepted formats are JPEG, PNG, HEIC (iPhone), and WebP. Upload the full
   original size; the sync shrinks them.
3. **Name files descriptively.** The file name becomes the caption, so
   `fsae-michigan-endurance.jpg` shows as "Fsae michigan endurance". Camera names like
   `IMG_1234.jpg` get a generic caption ("UVM AERO 2026 photo 3"). Photos appear in
   file-name order, so a prefix like `01-`, `02-` controls the order.
4. **Publish.** Either wait for the weekly run (Mondays, early morning), or go to the
   repo on GitHub → **Actions** → **Sync media** → **Run workflow** → **Run workflow**.
   It takes a few minutes.
5. **Check the site.** Open `/media` on the live site and pick the year's tab.
   You may need to refresh.

**Removing a photo:** delete it (or move it out of **AERO Media**) in Drive, then run the
sync again. The site is an exact mirror of the Drive folder: whatever is gone from Drive
is gone from the site on the next sync. Be careful when reorganizing folders.

**If the tab or photo doesn't show up,** open the latest **Sync media** run on GitHub.
Ignored folders, unsupported files, and unreadable images are listed as warnings at
the top of the run.

Photo location data (GPS) and other camera metadata are removed during the sync, and
photos are rotated the right way up.

## Setup and handoff

One-time setup. Re-check it when the club Google account, the GitHub repo, or the Silk
account changes hands.

### Google Drive service account

The workflow reads Drive as a Google Cloud service account, so no person's login is
involved.

1. In the [Google Cloud console](https://console.cloud.google.com/), signed in as
   uvmaero@gmail.com, create a project (e.g. `uvm-aero-site`) and enable the
   **Google Drive API** for it.
2. Under **IAM & Admin → Service accounts**, create a service account (no roles
   needed), then **Keys → Add key → JSON**. Keep the downloaded file private.
3. In Drive, share the **AERO Media** folder with the service account's email
   (`…@….iam.gserviceaccount.com`) as **Viewer**.

### GitHub secret and variable

| Name | Kind | Where | Value |
| --- | --- | --- | --- |
| `GDRIVE_SERVICE_ACCOUNT_JSON` | Secret | `production` environment | Full contents of the service account JSON key |
| `GDRIVE_MEDIA_FOLDER_ID` | Variable | Repository | The ID at the end of the **AERO Media** folder URL (`drive.google.com/drive/folders/<ID>`) |
| `DEPLOY_SSH_KEY` | Secret | `production` environment | Already exists; the deploy workflow uses it too |

The workflow runs in the `production` environment to reuse its SSH deploy key.

### Silk

- Photos live in `/users/a/e/aero/media/`, outside both web roots, so deploys never
  touch them. Staging and production share this one folder. The workflow creates it
  if it's missing.
- Set `MEDIA_DIR=/users/a/e/aero/media` in **both** `backend/.env` files
  (`~/www-root/backend/.env` and `~/dev.aero.w3.uvm.edu-root/backend/.env`), then reload
  each app (`silk app '<hostname>/*' load`).
- Check that `https://aero.w3.uvm.edu/api/media` lists the years after the first sync.
  If it returns `[]` while the folder has photos, the app can't read the folder. In that
  case, check `MEDIA_DIR` and the folder's permissions.

### Scheduled runs pause after 60 days without activity

GitHub disables scheduled workflows in public repos after 60 days with no repo
activity, which is likely over the summer. Manual **Run workflow** still works. To turn
the weekly run back on, go to **Actions → Sync media** and click **Enable workflow**.

### How the sync works

`.github/workflows/sync-media.yml`:

1. `rclone` syncs the Drive folder into the runner.
2. `scripts/optimize_media.py` writes `<year>/thumb/` (≤600px) and `<year>/full/`
   (≤2000px) JPEGs. Names are slugs of the originals (`My Photo.HEIC` →
   `my-photo.jpg`), with `-2`, `-3`… added on collisions.
3. `rsync --delete` mirrors the result to Silk.

Originals and encoded photos are cached between runs, so only new or changed photos
are downloaded and re-encoded. If the cache is evicted, the next run rebuilds
everything.

Flask serves the listing at `GET /api/media`. It builds captions from the file names.
The files themselves are served at `/media/<year>/<size>/<name>.jpg`.

### Local development

With `MEDIA_DIR` unset, `/api/media` returns `[]` and the page shows its empty state.
To see real photos, run the optimizer on any folder of `<year>/` sub-folders and point
`MEDIA_DIR` at the output:

```
pip install -r scripts/requirements-media.txt
python scripts/optimize_media.py ~/Pictures/aero-sample .media/out
echo "MEDIA_DIR=$PWD/.media/out" >> backend/.env
```
