
<div align="center">
  <img src="resources/icon.svg" width="80" alt="OverLink Logo" />
</div>

<div align="center">

# OverLink

**同步您的 Overleaf 项目并生成永久性的 PDF 链接。**  
*将您的 Overleaf 项目无缝同步到您的个人网站/作品集。*

[🇺🇸 English](./README.md) | 🇨🇳 中文

<p align="center">
  <a href="https://github.com/GeminiLight/overlink">
    <img src="https://img.shields.io/github/stars/GeminiLight/overlink?style=social" alt="GitHub Star">
  </a>
  <a href="https://twitter.com/intent/tweet?text=OverLink%3A%20%E8%87%AA%E5%8A%A8%E5%90%8C%E6%AD%A5%20Overleaf%20PDF%20%E5%88%B0%E4%B8%AA%E4%BA%BA%E7%BD%91%E7%AB%99%EF%BC%81%20https%3A%2F%2Foverlink.aurax.live%2F">
    <img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Foverlink.aurax.live%2F" alt="Tweet">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Beta-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

[功能特性](#-功能特性) • [工作原理](#-工作原理) • [快速开始](#-快速开始) • [贡献指南](#-贡献指南)

</div>

---

## 📖 简介

**OverLink** 是连接您的学术研究与受众的自动化桥梁。它解决了每次修改错别字或添加引用后，都需要手动导出、重命名并上传 CV 或论文的繁琐问题。

OverLink 让您的个人网站始终直接从 **Overleaf** 获取并展示最新的编译版本。

### 为什么选择 OverLink？

<table>
<tr>
<th width="50%">🚫 手动操作的痛苦</th>
<th width="50%">✅ OverLink 的流程</th>
</tr>
<tr>
<td>
<br>
❌ <b>繁琐</b>: <br><i>下载 PDF -> 重命名 -> 由于 FTP/Git 上传</i>
<br><br>
❌ <b>过时</b>: <br><i>"最后更新：2023"（因为您忘了更新）</i>
<br><br>
❌ <b>脆弱</b>: <br><i>如果您更改文件名，链接就会失效</i>
<br>
</td>
<td>
<br>
🟢 <b>自动化</b>: <br><i>检测更改并立即部署</i>
<br><br>
🟢 <b>永远新鲜</b>: <br><i>您的网站始终显示最新编译版本</i>
<br><br>
🟢 <b>可靠</b>: <br><i>稳定的 URL，优化的交付</i>
<br>
</td>
</tr>
</table>

## ⚡ 使用场景：永远最新的简历

**一次链接，永久更新。**

不再需要因为修改了一个错别字而反复上传 `CV_最终版_v2_真的最终版.pdf`。只需在您的个人网站上使用稳定的 OverLink URL：

```html
<!-- 您的个人作品集网站 -->
<a href="https://blob.overlink.aurax.live/output.pdf" target="_blank">
  📄 下载我的简历
</a>
```

当您在 Overleaf 中重新编译时，您的网站会出现最新版本。

## ✨ 功能特性

<table>
  <tr>
    <td align="center">🔄 <b>自动同步</b></td>
    <td align="center">🛡️ <b>安全可靠</b></td>
    <td align="center">☁️ <b>双重模式</b></td>
  </tr>
  <tr>
    <td>告别拖拽上传。Overleaf 中的更改会被检测并自动部署。</td>
    <td>无需提供账号密码，仅需使用您的共享项目 ID。保障您的账户安全。</td>
    <td>选择我们<b>完全托管的云 SaaS</b>，或者在您自己的硬件上完全自托管。</td>
  </tr>
</table>

## 🛠️ 工作原理

<div align="center">

<code>👩‍💻 用户推送</code> &nbsp; <b>→</b> &nbsp; <code>📄 Overleaf 编译</code> &nbsp; <b>→</b> &nbsp; <code>🤖 OverLink 同步</code> &nbsp; <b>→</b> &nbsp; <code>🌐 网站更新</code>

<br>

| 步骤 | 动作 |
| :--- | :--- |
| **1. 检测** | OverLink 监控您的 Overleaf 项目是否有更改。 |
| **2. 捕获** | 使用无头浏览器生成像素完美的 PDF。 |
| **3. 部署** | 将优化后的资产上传到您的云存储或 Git 仓库。 |

</div>

## 🏗️ 架构

| 组件 | 描述 | 访问方式 |
| :--- | :--- | :--- |
| **☁️ OverLink Cloud** | **(托管版本)** 最简单的使用方式，无需管理服务器。 | [访问 overlink.aurax.live](https://overlink.aurax.live/) |
| **💻 OverLink Local** | **(自托管)** 适用于本地机器或 CI/CD 的工具。 | [本地部署指南](docs/local-deployment.zh-CN.md) |
| **📦 Core** | 共享库和浏览器自动化逻辑。 | [源码](overlink/) |

---

## 🚀 快速开始

<details open>
<summary><b>选项 A: OverLink Cloud (推荐)</b></summary>
<br>

**专业、零配置的体验。**

1.  访问 **[overlink.aurax.live](https://overlink.aurax.live/)**。
2.  连接您的 Overleaf 账户。
3.  立即开始自动同步您的学术资产。

</details>

<details>
<summary><b>选项 B: OverLink Local (自托管)</b></summary>
<br>

**适合希望完全掌控的高级用户。**

1.  查看详细的指南：
    -   [📖 本地部署指南 (中文)](docs/local-deployment.zh-CN.md)

2.  **快速运行**：
    ```bash
    cd apps/local
    chmod +x start.sh
    ./start.sh
    ```

</details>

---

## 📈 Star 历史

如果您觉得 OverLink 有用，请考虑给我们一颗星！这有助于我们成长。

[![Star History Chart](https://api.star-history.com/svg?repos=GeminiLight/overlink&type=Date)](https://star-history.com/#GeminiLight/overlink&Date)

## 🤝 贡献

我们欢迎贡献！无论是报告错误、建议功能还是编写代码，我们都非常感激。

1.  Fork 本仓库。
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  提交 Pull Request。

## 📄 许可证

在 MIT 许可证下分发。查看 `LICENSE` 了解更多信息。

---

<div align="center">
  <p>❤️ GeminiLight 开发</p>
</div>
