<div align="center">

# 🎓 OverLink
### Your Academic Assets, Always Current.

[![Daily Sync](https://github.com/geminilight/overlink/actions/workflows/sync.yml/badge.svg)](https://github.com/geminilight/overlink/actions/workflows/sync.yml)
[![License](https://img.shields.io/github/license/geminilight/overlink)](https://github.com/geminilight/overlink/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**OverLink** is a "Set and Forget" service that automatically keeps your personal website's CV and academic papers synchronized with your Overleaf projects.

[Features](#-features) • [Quick Start](#-quick-start-for-users) • [Local Dev](#-local-development) • [Architecture](#-architecture)

</div>

---

### 🚫 The Problem
Updating your personal website with your latest CV is a friction-filled loop:
1.  Compile in Overleaf 🐌
2.  Download PDF ("cv_final_v2_really_final.pdf") 📥
3.  Rename and upload to your server/repo 📂
4.  Commit and push 🚀

### ✅ The Solution
**OverLink** automates this entirely. You edit your LaTeX in Overleaf, and every night, a bot mirrors the compiled PDF to your `public` folder and deploys it to GitHub Pages. You get a stable, permanent URL that always serves the latest version.

---

## ✨ Features

-   **🔄 Zero-Touch Sync**: Runs daily on GitHub Actions at 00:00 UTC. No server to manage.
-   **🔗 Permanent URLs**: Your link (`.../pdfs/cv.pdf`) never changes, so you can share it once and it stays valid forever.
-   **🖥️ Dashboard UI**: A modern React interface to easily manage which projects are mirrored.
-   **👀 Real-Time Feedback**: Watch the bot's progress live in the terminal or action logs.

---

## 🚀 Quick Start (For Users)

You can run OverLink entirely for free using **GitHub Actions** and **GitHub Pages**.

### 1. 🍴 Fork this Repository
Fork this repo to your own GitHub account.

### 2. ⚙️ Enable GitHub Pages
1.  Go to your repo **Settings > Pages**.
2.  Under **Build and deployment**, select **GitHub Actions** as the source.

### 3. 🔑 Add Secrets
The bot needs to log in to Overleaf to download your PDFs.
1.  Go to **Settings > Secrets and variables > Actions**.
2.  Add **New Repository Secret**:
    -   `OVERLEAF_EMAIL`: Your Overleaf email address.
    -   `OVERLEAF_PASSWORD`: Your Overleaf password.
3.  **Automation Token** (Required for updates):
    -   Create a **Personal Access Token (classic)** with `repo` scope.
    -   Add **New Repository Secret**: `GITHUB_ACCESS_TOKEN` (paste the token).
    -   *This allows the update bot to trigger the deployment bot.*
4.  **(Optional, if you have one) Saved Session**:
    To avoid login captchas, you can provide your saved session.
    -   **How to get it**: Run the application locally (see [Local Development](#%EF%B8%8F-local-development) below). Once the bot successfully logs in, it creates an `auth.json` file in your root folder.
    -   **How to add it**: Run this command to copy the file content as a secret string:
        ```bash
        base64 -i auth.json | pbcopy
        ```
    -   Add **New Repository Secret**: `AUTH_JSON_BASE64` (paste the content).

### 4. 📝 Configure Your Assets
You can configure which projects to mirror by editing `users.json` directly in the repo, or running the tool locally to use the UI.

**Example `users.json`:**
```json
[
    {
        "username": "resume",
        "email": "your_email@example.com",
        "url": "https://www.overleaf.com/project/664b..."
    }
]
```
*This will create a PDF at: `https://<your-username>.github.io/<repo-name>/pdfs/resume.pdf`*

### 5. ▶️ Run!
Go to the **Actions** tab, select **Sync CV from Overleaf**, and click **Run workflow**. It will also run automatically every day.

---

## 🛠️ Local Development

If you want to contribute or manage your config via the UI:

### Prerequisites
-   🐍 Python 3.10+
-   🟢 Node.js & npm
-   🎭 Playwright (`pip install playwright && playwright install chromium`)

### Setup & Run
1.  Create a `.env` file:
    ```bash
    OVERLEAF_EMAIL=your_email@example.com
    OVERLEAF_PASSWORD=your_password
    ```
2.  Run the helper script:
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
3.  Open the Dashboard at **http://localhost:5600**.

## 🏗️ Architecture

-   **Frontend**: React + Vite + TailwindCSS (in `frontend/`)
-   **Backend**: FastAPI (in `server.py`) manages the `users.json` state.
-   **Bot Engine**: Playwright (in `cv_mirror/`) runs headless to authenticate and download PDFs.
-   **Orchestration**: GitHub Actions (`sync.yml`) runs the Python script and deploys the `public/` folder to GitHub Pages.
