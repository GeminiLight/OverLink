# 🛠️ Indie SaaS 技术栈选型与配置经验 (The Modern Stack)

这份文档总结了我在构建 OverLink 过程中的技术选型与配置细节。这套技术栈非常适合**独立开发者 (Indie Hacker)** 快速构建 MVP 并扩展为商业化产品。

**核心原则**：Serverless, 低成本, 高开发效率 (DX)。

---

## 1. 身份认证 (Authentication)
**选型**: [Supabase Auth](https://supabase.com/auth)
**理由**: 开箱即用，免费额度大 (50,000 MAU)，完美集成 PostgreSQL Row Level Security (RLS)。

### 配置细节
#### A. Google OAuth
1.  进入 [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2.  创建 **OAuth Client ID**.
3.  **Authorized Redirect URIs**: 填入 Supabase 提供的 Callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`).
4.  将生成的 `Client ID` 和 `Client Secret` 填回 Supabase Dashboard.

#### B. GitHub OAuth
1.  进入 [GitHub Developer Settings](https://github.com/settings/developers).
2.  创建 **New OAuth App**.
3.  **Authorization callback URL**: 填入 Supabase Callback URL.
4.  获取 `Client ID` 和 `Client Secret` 填回 Supabase.

#### C. 生产环境重定向 (Critical)
在 Supabase -> **Authentication** -> **URL Configuration**:
- **Site URL**: 你的生产环境域名 (如 `https://overlink.app`)。
- **Redirect URLs**: 必须添加 `https://overlink.app/**` (支持通配符)，否则用户登录后会跳回 `localhost`。

---

## 2. 数据库 (Database)
**选型**: [Supabase (PostgreSQL)](https://supabase.com/database)
**理由**: 不仅仅是数据库，更是 Realtime 引擎和 Auth 后端。Postgres 的生态极其丰富。

### 最佳实践
- **RLS (Row Level Security)**: **必须开启**。永远不要在前端直接查询没有 RLS 的表。
  ```sql
  create policy "User can see own data" on public.profiles
  for select using (auth.uid() = id);
  ```
- **Triggers for Logic**: 将复杂的业务逻辑（如会员等级计算）下沉到数据库 Trigger，保持后端/前端代码纯净。
  - *案例*: `apps/cloud/supabase/migrations/02_enhanced_membership.sql` (自动根据订阅计算 Tier)。

---

## 3. 文件存储 (Object Storage)
**选型**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
**理由**: **零出口流量费 (Zero Egress Fees)**。这对于 PDF/图片 分发类应用是杀手级优势 (AWS S3 的流量费极其昂贵)。

### 配置细节
1.  **创建 Bucket**: 在 Cloudflare Dashboard 创建 (如 `overlink-assets`)。
2.  **公开访问 (Public Access)**:
    - **自定义域名 (推荐)**: 绑定 `cdn.yourdomain.com` 到 R2 Bucket。
    - **R2.dev**: 开发测试可用，但链接较长且慢。
3.  **API Token**:
    - 创建一个 `Admin Read & Write` 权限的 Token。
    - 获取 `Access Key ID`, `Secret Access Key`, `Endpoint`。
    - **坑点**: S3 SDK (如 `boto3` 或 JS SDK) 需要 `Endpoint` 去掉路径中的 bucket name (即只保留 `https://<account-id>.r2.cloudflarestorage.com`)。

---

## 4. 域名与网络 (Domain & Network)
**选型**: [Cloudflare](https://www.cloudflare.com/) + [Vercel](https://vercel.com/)
**理由**: Cloudflare 解析速度快，免费 SSL，DDoS 防护；Vercel 部署 Next.js 体验极佳。

### 配置流
1.  **域名购买**: Namesilo / Porkbun (便宜，无套路)。
2.  **DNS 解析**: 托管到 Cloudflare。
3.  **主站 (App)**: 在 Vercel 添加域名，Vercel 会提供 CNAME 记录，在 Cloudflare 添加即可。
4.  **CDN (Assets)**: 在 Cloudflare R2 绑定二级域名 (如 `cdn.overlink.com`)。

---

## 5. 持续集成 (CI/CD)
**选型**: GitHub Actions
**理由**: 既然代码在 GitHub，用 Actions 最顺手。

### 常用 Secret 命名规范
为了方便跨项目迁移，建议统一 Secret 命名：
- `SUPABASE_URL` / `SUPABASE_KEY`
- `R2_ACCESS_KEY` / `R2_SECRET_KEY` / `R2_BUCKET` / `R2_ENDPOINT`
- `NEXT_PUBLIC_APP_URL`

---

## 6. 收费与商业化 (Payments)
**选型**: [Stripe](https://stripe.com/) (假如在海外) 或 [LemonSqueezy](https://www.lemonsqueezy.com/) (全球包括支付宝/微信)
**理由**: LemonSqueezy 作为 Merchant of Record (MoR) 处理税务问题，非常适合独立开发者。

### 集成思路
- 创建 `subscriptions` 表 (参考 `enhanced_membership.sql`)。
- webhook 接收支付成功回调 -> 写入 `subscriptions` 表 -> 数据库 Trigger 自动更新用户 `tier`。
