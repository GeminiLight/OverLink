<div align="center">

# 🎓 OverLink

**Your Academic Assets, Always Current.**  
*Seamlessly synchronize your Overleaf projects with your personal website/portfolio.*

🇺🇸 English | [🇨🇳 中文](./README_zh-CN.md)

<p align="center">
  <a href="https://github.com/GeminiLight/overlink">
    <img src="https://img.shields.io/github/stars/GeminiLight/overlink?style=social" alt="Star on GitHub">
  </a>
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20OverLink%3A%20Sync%20Override%20PDFs%20to%20your%20website%20automatically!%20https%3A%2F%2Fgithub.com%2FGeminiLight%2Foverlink">
    <img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2FGeminiLight%2Foverlink" alt="Tweet">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Beta-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[Features](#-features) • [How It Works](#-how-it-works) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📖 Introduction

**OverLink** acts as the automated bridge between your research and your audience. It solves the tedious problem of manually exporting, renaming, and uploading your CV or papers every time you fix a typo or add a citation.

### Why OverLink?

<table>
<tr>
<th width="50%">🚫 The Manual Struggle</th>
<th width="50%">✅ The OverLink Flow</th>
</tr>
<tr>
<td>
<br>
❌ <b>Tedious</b>: <br><i>Download PDF -> Rename -> Upload via FTP/Git</i>
<br><br>
❌ <b>Outdated</b>: <br><i>"Last updated: 2023" (because you forgot)</i>
<br><br>
❌ <b>Fragile</b>: <br><i>Broken links if you change filenames</i>
<br>
</td>
<td>
<br>
🟢 <b>Automated</b>: <br><i>Detects changes & deploys instantly</i>
<br><br>
🟢 <b>Always Fresh</b>: <br><i>Your site always shows the latest compile</i>
<br><br>
🟢 <b>Reliable</b>: <br><i>Stable URLs, optimized delivery</i>
<br>
</td>
</tr>
</table>

## 🛠️ How It Works

<div align="center">

<code>👩‍💻 User Pushes</code> &nbsp; <b>→</b> &nbsp; <code>📄 Overleaf Compiles</code> &nbsp; <b>→</b> &nbsp; <code>🤖 OverLink Syncs</code> &nbsp; <b>→</b> &nbsp; <code>🌐 Website Updates</code>

<br>

| Step | Action |
| :--- | :--- |
| **1. Detect** | OverLink watches your Overleaf project for changes. |
| **2. Capture** | Uses a headless browser to generate a pixel-perfect PDF. |
| **3. Deploy** | Uploads the optimized asset to your Cloud Storage or Git Repo. |

</div>

## ✨ Features

<table>
  <tr>
    <td align="center">🔄 <b>Automatic Sync</b></td>
    <td align="center">📄 <b>High-Fidelity</b></td>
    <td align="center">🛡️ <b>Secure</b></td>
  </tr>
  <tr>
    <td>Never drag-and-drop a PDF again. Changes in Overleaf are detected and deployed instantly.</td>
    <td>Uses <b>Playwright</b> to ensure pixel-perfect rendering of your LaTeX documents.</td>
    <td>Your credentials and project IDs are handled with industry-standard encryption.</td>
  </tr>
    <tr>
    <td align="center">☁️ <b>Dual Modes</b></td>
    <td align="center">🚀 <b>Zero Config</b></td>
    <td align="center">📦 <b>Monorepo</b></td>
  </tr>
  <tr>
    <td>Choose between our <b>fully managed Cloud SaaS</b> or self-host strictly on your own hardware.</td>
    <td>Get started in seconds with our hosted platform without managing infrastructure.</td>
    <td>One codebase, infinite possibilities. Extensible Python core.</td>
  </tr>
</table>

## 🏗️ Architecture

This repository is a **Monorepo** containing the entire OverLink ecosystem:

| Component | Description | Technologies | Location |
| :--- | :--- | :--- | :--- |
| **☁️ Cloud** | **(Recommended)** SaaS platform with a beautiful dashboard. | Next.js, Playwright, R2 | [`apps/cloud`](apps/cloud) |
| **💻 Local** | Self-hosted CLI tool for your own machine or CI/CD. | Python, Playwright | [`apps/local`](apps/local) |
| **📦 Core** | Shared libraries and browser automation logic. | Python | [`overlink/`](overlink/) |

---

## 🚀 Getting Started

<details open>
<summary><b>Option A: OverLink Cloud (Recommended)</b></summary>
<br>

**The easiest way to get started.** No servers to manage.

1.  Navigate to the **[Platform Setup Guide](PLATFORM_SETUP.md)**.
2.  Deploy your instance or sign up for the hosted beta.
3.  Connect your Overleaf account and start syncing.

</details>

<details>
<summary><b>Option B: OverLink Local (Self-Hosted)</b></summary>
<br>

**For power users who want full control.**

1.  View the detailed guide:
    -   [📖 Local Deployment Guide](docs/local-deployment.md)

2.  **Quick Start**:
    ```bash
    cd apps/local
    chmod +x start.sh
    ./start.sh
    ```

</details>

---

## 📈 Star History

If you find OverLink detailed or useful, please consider giving it a star! It helps us grow.

[![Star History Chart](https://api.star-history.com/svg?repos=GeminiLight/overlink&type=Date)](https://star-history.com/#GeminiLight/overlink&Date)

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
  <p>Built with ❤️ by the OverLink Team</p>
</div>
