<div align="center">

# 🎓 OverLink

**Turn your Overleaf projects into persistent PDF URLs.**  
*Seamlessly synchronize your Overleaf projects with your personal website/portfolio.*

🇺🇸 English | [🇨🇳 中文](./README_zh-CN.md)

<p align="center">
  <a href="https://github.com/GeminiLight/overlink">
    <img src="https://img.shields.io/github/stars/GeminiLight/overlink?style=social" alt="Star on GitHub">
  </a>
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20OverLink%3A%20Sync%20Overleaf%20PDFs%20to%20your%20website%20automatically!%20https%3A%2F%2Foverlink.aurax.live%2F">
    <img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Foverlink.aurax.live%2F" alt="Tweet">
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

## ⚡ Use Case: Always-Current CV

**Link it once, update it forever.**

Instead of uploading `CV_Final_v2_REALLY_FINAL.pdf` every time you fix a typo, just use your stable OverLink URL on your personal website:

```html
<!-- Your portfolio website -->
<a href="https://blob.overlink.aurax.live/output.pdf" target="_blank">
  📄 Download My CV
</a>
```

When you recompile in Overleaf, your website updates automatically.

## ✨ Features

<table>
  <tr>
    <td align="center">🔄 <b>Automatic Sync</b></td>
    <td align="center">🛡️ <b>Secure</b></td>
    <td align="center">☁️ <b>Dual Modes</b></td>
  </tr>
  <tr>
    <td>Never drag-and-drop a PDF again. Changes in Overleaf are detected and deployed instantly.</td>
    <td>No required credentials—just use your shared project IDs. Your account stays safe.</td>
    <td>Choose between our <b>fully managed Cloud SaaS</b> or self-host strictly on your own hardware.</td>
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

## 🏗️ Architecture

| Component | Description | Access |
| :--- | :--- | :--- |
| **☁️ OverLink Cloud** | **(Managed)** The easiest way to get started. No infrastructure to manage. | [Visit overlink.aurax.live](https://overlink.aurax.live/) |
| **💻 OverLink Local** | **(Self-Hosted)** CLI tool/Worker for your own machine or CI/CD. | [Local Setup Guide](docs/local-deployment.md) |
| **📦 Core** | Shared libraries and browser automation logic. | [Source Code](overlink/) |

---

## 🚀 Getting Started

<details open>
<summary><b>Option A: OverLink Cloud (Recommended)</b></summary>
<br>

**The professional, zero-config experience.**

1.  Visit **[overlink.aurax.live](https://overlink.aurax.live/)**.
2.  Connect your Overleaf account.
3.  Start syncing your academic assets instantly.

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
  <p>Built with ❤️ by GeminiLight</p>
</div>
