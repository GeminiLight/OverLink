# OverLink Platform Setup Guide (SaaS Edition)

Congratulation! The code for your SaaS platform is ready in the `apps/cloud/` directory. Now you need to link it to the cloud services.

## 1. Supabase (Database)

1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  Go to **SQL Editor** -> **New query**.
3.  Copy and paste the content of `apps/cloud/supabase/schema.sql` and run it.
4.  Go to **Settings** -> **API**.
5.  Under **Publishable and secret API keys**:
    *   Copy **Publishable key** (`sb_publishable_...`) -> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Safe for browser)
    *   Copy **Secret key** (`sb_secret_...`) -> `SUPABASE_SECRET_KEY` (**KEEP SECRET!**)

## 1.1 Supabase Auth Configuration (CRITICAL for Production)

For the login to redirect back to your website (and not `localhost`), you **must** configure the redirect URLs in Supabase:

1.  Go to **Authentication** -> **URL Configuration**.
2.  **Site URL**: Change this to your Vercel production URL (e.g., `https://overlink-eta.vercel.app`).
3.  **Redirect URLs**: Add `https://overlink-eta.vercel.app/**` (with the wildcards) to the list.
4.  Click **Save**.

> [!IMPORTANT]
> If you don't do this, Supabase will always redirect you back to `http://localhost:3000` after a successful login.

## 1.1 Authentication (Google Login)
1.  Go to **Authentication** -> **Providers**.
2.  Enable **Google**.
3.  Enter your **Client ID** and **Client Secret** (obtained from [Google Cloud Console](https://console.cloud.google.com/)).
4.  Add your Supabase callback URL to Google Cloud Console (`https://<project-ref>.supabase.co/auth/v1/callback`).

## 1.2 Authentication (GitHub Login)
1.  Go to **Authentication** -> **Providers**.
2.  Enable **GitHub**.
3.  Enter your **Client ID** and **Client Secret** (obtained from [GitHub Developer Settings](https://github.com/settings/developers)).
4.  Add your Supabase callback URL to GitHub App (`https://<project-ref>.supabase.co/auth/v1/callback`).

> **Note on Schema**: If you have already run the schema, you may need to apply the latest migration or re-run the updated `schema.sql` (which now uses `filename` instead of `nickname`).

## 2. GitHub Actions (Worker)

1.  Push your code to GitHub (e.g., `overlink-cloud`).
2.  Go to **Settings** -> **Secrets and variables** -> **Actions**.
3.  Add the following Repository Secrets:
    -   `R2_ACCESS_KEY`: From Cloudflare R2.
    -   `R2_SECRET_KEY`: From Cloudflare R2.
    -   `R2_BUCKET`: Your bucket name.
    -   `R2_ENDPOINT`: Your R2 S3 Endpoint.

## 3. Vercel (Web App)

1.  Go to [Vercel](https://vercel.com) -> **Add New Project**.
2.  Import your GitHub Repository.
3.  **Important**: Set **Root Directory** to `apps/cloud/web` (Edit button).
4.  **CRITICAL**: Add Environment Variables (Build will fail without these):
    -   `NEXT_PUBLIC_SUPABASE_URL`: (From Supabase)
    -   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: (From Supabase)
    -   `SUPABASE_SECRET_KEY`: (From Supabase - **Keep Secret!**)
    -   `ENCRYPTION_KEY`: Generate a random 32-char string.
    -   `GITHUB_TOKEN`: A Personal Access Token (Classic) with `repo` scope.
    -   `GITHUB_OWNER`: Your GitHub username.
    -   `GITHUB_REPO`: Your repo name.
-   `NEXT_PUBLIC_CDN_BASE_URL`: Base URL for your PDFs (e.g., `https://cdn.example.com`).

## 4. Cloudflare R2 (PDF Storage)

1.  Go to [Cloudflare R2](https://dash.cloudflare.com/) and create a bucket (e.g., `overlink`).
2.  Enable **Public Access**:
    -   **Option A (Custom Domain)**: Go to your bucket settings -> "Public Access" -> "Connect Domain".
    -   **Option B (R2.dev Subdomain)**: If you don't have a domain, go to settings -> "Public Access" -> "Allow Access" (under R2.dev Subdomain). This will give you a long URL like `https://pub-xxx.r2.dev`.
3.  **Set Your CDN Base URL**: The URL you get from Step 2 (e.g., `https://pub-xxx.r2.dev` or `https://cdn.yourdomain.com`) is what you should put in `NEXT_PUBLIC_CDN_BASE_URL` on Vercel.
4.  Go to **R2 API Tokens** -> Create Token -> **Admin Read & Write**.
5.  Copy: `Access Key ID`, `Secret Access Key`, and `Endpoint` (S3 API).

> [!NOTE]
> **How it Works**: 
> 1. The **Worker** generates the PDF and uploads it to R2 using the API keys (`R2_ACCESS_KEY`, etc.).
> 2. The **Web App** reads the project name and appends `.pdf` to your `NEXT_PUBLIC_CDN_BASE_URL` to create an public view link.

## 5. Environment Variables Reference

### A. Vercel (Web App)
Set these in **Vercel Project Settings -> Environment Variables**:

| Variable | Value Source | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings | Connect to DB |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Settings | Public Client |
| `SUPABASE_SECRET_KEY` | Supabase Settings | Admin/Server Access |
| `ENCRYPTION_KEY` | Generate Random (32 chars) | Encrypt Overleaf Creds |
| `GITHUB_TOKEN` | GitHub Settings -> Developer Settings -> PAT (Classic) | Trigger Actions |
| `GITHUB_OWNER` | Your GitHub Username | Trigger Actions |
| `GITHUB_REPO` | `OverLink` (or your repo name) | Trigger Actions |
| `NEXT_PUBLIC_CDN_BASE_URL` | Cloudflare Custom Domain (e.g., `https://cdn.example.com`) | View PDFs |

### B. GitHub Secrets (Worker)
Set these in **GitHub Repo -> Settings -> Secrets and variables -> Actions**:

| Secret Name | Value Source | Purpose |
| :--- | :--- | :--- |
| `R2_ACCESS_KEY` | Cloudflare R2 | Upload PDFs |
| `R2_SECRET_KEY` | Cloudflare R2 | Upload PDFs |
| `R2_BUCKET` | Cloudflare R2 Bucket Name | Target Bucket |
| `R2_ENDPOINT` | Cloudflare R2 Endpoint | S3 Connection |

## 6. Run Locally (Optional)

To test the web app locally:

1.  `cd apps/cloud/web`
2.  `npm install`
3.  Create `.env.local` using `.env.local.example` as a template and fill in the values.
4.  `npm run dev`
