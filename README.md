# CV Mirror Service

A "Set and Forget" service that automatically keeps your hosted CV synchronized with your Overleaf project. Now with a modern Web UI for easy management.

## Features

-   **Dashboard UI**: Easily add, update, or remove CVs using a modern React frontend.
-   **Real-time Feedback**: Watch the mirroring process live with a terminal-style log.
-   **Instant Public URL**: Get a stable, shareable link to your PDF immediately after mirroring.
-   **Daily Auto-Sync**: GitHub Actions automatically updates all registered CVs every day at 00:00 UTC.

## Quick Start (Local Development)

### Prerequisites
-   Python 3.10+
-   Node.js & npm
-   Playwright Browsers (`playwright install chromium`)

### 1. Configure Environment
Create a `.env` file in the root directory:
```bash
OVERLEAF_EMAIL=your_email@example.com
OVERLEAF_PASSWORD=your_password
```

### 2. Start the Application
Use the helper script to run both backend and frontend:
```bash
chmod +x start.sh
./start.sh
```
-   **Frontend**: http://localhost:5600
-   **Backend**: http://localhost:8000

## Deploying & GitHub Actions Scope

This repository is designed to be hosted on GitHub. The mirroring logic runs in **GitHub Actions**, and the PDFs are hosted on **GitHub Pages**.

### 1. Enable GitHub Pages
1.  Go to **Settings > Pages**.
2.  Under **Build and deployment**, select **GitHub Actions** as the source.

### 2. Set Up Secrets
To allow the bot to log in to Overleaf during the daily sync, you must add your credentials as **Repository Secrets** (NOT Environment Secrets).

1.  Go to **Settings > Secrets and variables > Actions**.
2.  Add the following **New Repository Secrets**:
    -   `OVERLEAF_EMAIL`: Your Overleaf account email.
    -   `OVERLEAF_PASSWORD`: Your Overleaf account password.

*Note: Without these secrets, the `Sync CV` workflow will fail.*

## Usage

### Adding a CV
1.  Open the Web UI.
2.  Enter a **Nickname** (this determines the filename, e.g., `nickname.pdf`).
3.  Enter your **Overleaf Project ID** (the read-only link URL).
4.  Enter your **Email** (for verification/record keeping).
5.  Click **Mirror CV**.
6.  Once complete, copy your public link!

### Accessing Hosted PDFs
Your CVs will be available at:
```
https://<YourUsername>.github.io/<RepoName>/pdfs/<Nickname>.pdf
```
*Note: If you use a custom domain (e.g., tianfuwang.tech), the URL will be:*
```
http://tianfuwang.tech/cv-mirror/pdfs/<Nickname>.pdf
```

## Technical Overview
-   **Frontend**: React, Vite, TailwindCSS (located in `frontend/`)
-   **Backend**: FastAPI, Playwright (located in `server.py`, `cv_mirror/`)
-   **CI/CD**: GitHub Actions (`.github/workflows/sync.yml`) runs `main.py` daily to re-download all PDFs in `users.json`.
