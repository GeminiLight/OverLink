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

### 6. (可选) 高级身份验证 (避免 CAPTCHA)

如果您在登录时遇到 CAPTCHA（验证码）问题，您可以手动捕获会话 Cookie：

1.  以设置模式运行机器人：
    ```bash
    cd apps/local
    python main.py sync --setup
    ```
2.  浏览器将会打开。请手动登录 Overleaf。
3.  登录成功后，返回终端并按 **Enter** 键。
4.  脚本将保存 `auth.json`。将其转换为 Base64：
    ```bash
    # MacOS / Linux
    base64 -i auth.json | pbcopy  # 复制到剪贴板
    
    # 或者直接打印：
    base64 -i auth.json
    ```
5.  使用此字符串作为下方 `AUTH_JSON_BASE64` 的密钥值。

## 在 GitHub Actions 中运行

您可以使用 GitHub Actions 自动化此过程，每日或在每次推送时同步您的资产。

1.  **复制工作流文件**：
    将本仓库中的 `.github/workflows/sync.yml` 文件复制到您自己仓库的 `.github/workflows/` 目录中。

2.  **配置密钥 (Secrets)**：
    前往您仓库的 **Settings > Secrets and variables > Actions** 并添加以下仓库密钥：

    | 密钥名称 (Secret Name) | 描述 | 是否必须 |
    | :--- | :--- | :--- |
    | `OVERLEAF_EMAIL` | 您的 Overleaf 登录邮箱。 | **是** |
    | `OVERLEAF_PASSWORD` | 您的 Overleaf 登录密码。 | **是** |
    | `AUTH_JSON_BASE64` | Base64 编码的 `auth.json` (见上文第 6 步)。用于绕过登录/验证码。 | **推荐** |
    | `SSH_PRIVATE_KEY` | (可选) 如果通过 SSH 推送到 git 仓库，则需要私钥。 | 否 |

    *注意：像 `TARGET_DIR` 或 `GIT_REPO_URL` 这样的非敏感环境变量可以直接在工作流文件中设置。*
