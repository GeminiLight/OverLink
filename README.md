# CV-Mirror Service

A "Set and Forget" service that automatically keeps your hosted CV synchronized with your Overleaf project.

## How it Works
1.  **You** provide a Read-Only link to your Overleaf project.
2.  **The Bot** runs daily (via GitHub Actions).
3.  **The Result**: Your CV is published to a stable, public URL.

## Accessing Your CV
Once the service is running, your CV will be available at:

```
https://<OWNER_USERNAME>.github.io/<REPO_NAME>/<USERNAME>.pdf
```

Example:
- **Repo Owner**: `geminilight`
- **Repo Name**: `cv-mirror`
- **Configured Username**: `alice`
- **Result URL**: `https://geminilight.github.io/cv-mirror/alice.pdf`

## Configuration
Edit `users.json` to add users:

```json
[
  {
    "username": "alice",
    "url": "https://www.overleaf.com/read/abcdefg123456"
  },
  {
    "username": "bob",
    "url": "https://www.overleaf.com/read/uvwxyz987654"
  }
]
```

## Setup for the Owner

### 1. Daily Sync via GitHub Actions
This repository is configured to run daily at 00:00 UTC.

**Requirements:**
- Go to **Settings > Secrets and variables > Actions**.
- Add the following Repository Secrets:
    - `OVERLEAF_EMAIL`: Email of the account used by the bot.
    - `OVERLEAF_PASSWORD`: Password for the bot account.

### 2. Enable GitHub Pages
- Go to **Settings > Pages**.
- Under **Build and deployment**, select **GitHub Actions** as the source.
- The next time the `Sync CV` workflow runs, it will deploy to this site.

### 3. Session Setup (Local Only)
To bypass Cloudflare/CAPTCHA, the bot uses a saved session (`auth.json`).
1.  Run locally once: `python sync_cv.py --setup`
2.  Log in and press Enter.
3.  Commit `auth.json` to the repository (private repo recommended) or upload it as a secret if advanced. *Note: For this v1, checking in `auth.json` to a private repo is the simplest path.*
