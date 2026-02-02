# 💻 OverLink Local Deployment Guide

[🇨🇳 中文](./local-deployment.zh-CN.md) | 🇺🇸 English

This guide details how to run OverLink strictly on your own infrastructure (local machine, VPS, or private CI/CD).

## Prerequisites

-   **Python 3.9+**
-   **Playwright** (for browser automation)
-   **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/GeminiLight/overlink.git
cd overlink/apps/local
```

### 2. Install Dependencies

It is recommended to use a virtual environment.

```bash
# Create venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -e ../../overlink  # Install the core library
```

### 3. Install Playwright Browsers

OverLink needs the browsers to render PDFs.

```bash
playwright install chromium
```

### 4. Configuration

Create a `.env` file in `apps/local` with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add:

```ini
# Your Overleaf Account
OVERLEAF_EMAIL=your_email@example.com
OVERLEAF_PASSWORD=your_password

# Target Git Repo (Use SSH for passwordless push)
GIT_REPO_URL=git@github.com:username/username.github.io.git
TARGET_DIR=assets/pdfs
```

### 5. Run the Worker

```bash
chmod +x start.sh
./start.sh
```

## Running in GitHub Actions

You can automate this process using GitHub Actions to sync your assets daily or on every push.

1.  **Copy the workflow**:
    Copy the `.github/workflows/sync.yml` file from this repository to your own repository's `.github/workflows/` directory.

2.  **Configure Secrets**:
    Go to your repository's **Settings > Secrets and variables > Actions** and add the following repository secrets:

    | Secret Name | Description |
    | :--- | :--- |
    | `OVERLEAF_EMAIL` | Your Overleaf login email. |
    | `OVERLEAF_PASSWORD` | Your Overleaf login password. |
    | `SSH_PRIVATE_KEY` | (Optional) Private key if pushing to a git repo via SSH. |

    *Note: Environment variables like `TARGET_DIR` or `GIT_REPO_URL` can be set in the workflow file itself if they aren't sensitive.*
