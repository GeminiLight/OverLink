# 🎓 OverLink

**OverLink** is a service that automatically keeps your personal website's CV and academic papers synchronized with your Overleaf projects.

This repository is a **Monorepo** containing two versions of the tool:

## 1. Local Tool (`apps/local`)
The original, self-hosted version. You run it on your own machine or GitHub Actions fork. It commits PDFs directly to your repo (GitHub Pages).

-   **Location**: [`apps/local`](apps/local)
-   **Usage**: See [Project Wiki](PROJECT_WIKI.md) (or old README).

## 2. Cloud Platform (`apps/cloud`)
The centralized SaaS platform version. A Multi-tenant Web App where you can manage projects online without deploying your own infrastructure.

-   **Location**: [`apps/cloud`](apps/cloud)
-   **Web**: Next.js (Dashboard)
-   **Worker**: Python + Playwright (PDF Engine)

## 3. Core (`overlink/`)
Shared Python library (`overlink_bot`) used by both applications.

---

## 🚀 Getting Started (Local)

To run the local tool:

```bash
cd apps/local
chmod +x start.sh
./start.sh
```

## ☁️ Getting Started (Cloud)

To deploy the cloud platform, see [PLATFORM_SETUP.md](PLATFORM_SETUP.md).
