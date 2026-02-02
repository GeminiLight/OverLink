<div align="center">

# 🎓 OverLink

**Your Academic Assets, Always Current.**  
*Seamlessly synchronize your Overleaf projects with your personal website.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Beta-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [How It Works](#-how-it-works) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📖 Introduction

**OverLink** solves the hassle of manually updating your CV and academic papers on your personal website. It acts as a bridge between your **Overleaf** projects and your public portfolio, ensuring that every time you compile a new version of your resume or paper, the latest PDF is automatically deployed to your site.

Whether you prefer a **fully managed cloud experience** or **complete control with self-hosting**, OverLink has you covered.

## ✨ Features

- **🔄 Automatic Synchronization**: Changes in Overleaf are detected and synced automatically.
- **📄 High-Fidelity PDFs**: Uses Playwright to capture pixel-perfect PDFs directly from Overleaf.
- **☁️ Dual Modes**: Choose between our hosted SaaS platform or run it locally on your own infrastructure.
- **🛡️ Secure**: Securely handles your credentials and project IDs.
- **🚀 Zero Config (Cloud)**: Get started in seconds with our hosted platform.

## 🏗️ Architecture

This repository is a **Monorepo** containing the entire OverLink ecosystem:

### 1. ☁️ OverLink Cloud (`apps/cloud`)
The recommended way for most users. A centralized SaaS platform where you can manage your projects via a beautiful dashboard.
- **Stack**: Next.js, Playwright, Cloudflare R2.
- **Location**: [`apps/cloud`](apps/cloud)

### 2. 💻 OverLink Local (`apps/local`)
For those who want full control. Run the synchronization tool locally on your machine or inside your own CI/CD pipelines (e.g., GitHub Actions).
- **Stack**: Python, Playwright.
- **Location**: [`apps/local`](apps/local)

### 3. 📦 Core (`overlink/`)
The shared brain of OverLink. A Python library identifying the core logic for browser automation and state management, reused across both Cloud and Local versions.

---

## 🚀 Getting Started

Choose the version that fits your needs:

### Option A: OverLink Cloud (Recommended)
Skip the setup and start syncing immediately.
1.  Navigate to the **[Platform Setup Guide](PLATFORM_SETUP.md)** to deploy the cloud instance or wait for the public release.

### Option B: OverLink Local (Self-Hosted)
Run the tool on your own machine.

1.  **Navigate to the local app directory**:
    ```bash
    cd apps/local
    ```

2.  **Start the application**:
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
    *Note: Ensure you have Python and Playwright dependencies installed.*

---

## 🤝 Contributing

We welcome contributions! Whether it's reporting a bug, suggesting a feature, or writing code, your help is appreciated.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ by the OverLink Team
</div>
