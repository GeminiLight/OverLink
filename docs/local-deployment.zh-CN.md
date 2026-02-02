# 💻 OverLink 本地部署指南

[🇺🇸 English](./local-deployment.md) | 🇨🇳 中文

本指南详细说明如何在您自己的基础设施（本地机器、VPS 或私有 CI/CD）上运行 OverLink。

## 先决条件

-   **Python 3.9+**
-   **Playwright**（用于浏览器自动化）
-   **Git**

## 设置步骤

### 1. 克隆仓库

```bash
git clone https://github.com/GeminiLight/overlink.git
cd overlink/apps/local
```

### 2. 安装依赖

建议使用虚拟环境。

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install -e ../../overlink  # 安装核心库
```

### 3. 安装 Playwright 浏览器

OverLink 需要浏览器来渲染 PDF。

```bash
playwright install chromium
```

### 4. 配置

在 `apps/local` 中创建一个 `.env` 文件并填入您的凭据：

```bash
cp .env.example .env
```

编辑 `.env` 添加：

```ini
# 您的 Overleaf 账号
OVERLEAF_EMAIL=your_email@example.com
OVERLEAF_PASSWORD=your_password

# 目标 Git 仓库（建议使用 SSH 以免密推送）
GIT_REPO_URL=git@github.com:username/username.github.io.git
TARGET_DIR=assets/pdfs
```

### 5. 运行 Worker

```bash
chmod +x start.sh
./start.sh
```

## 在 GitHub Actions 中运行

您也可以将其作为定时工作流运行在您自己的仓库中。请参考本仓库中的 `.github/workflows/sync.yml` 作为模板。
