# OverLink Project Documentation

**OverLink** is a service that automatically synchronizes Overleaf projects to persistent, public-facing PDF URLs. It bridges the gap between academic writing (LaTeX) and professional presentation (Personal Websites/Portfolios).

## 1. Product Functions

### Core Features
- **Automatic Synchronization**: Detects changes in Overleaf projects and automatically recompiles and deploys the latest PDF.
- **Persistent URLs**: Provides a stable, unchanging URL (e.g., `cdn.overlink.com/resume.pdf`) for sharing.
- **Secret Project Support**: Works with both public and private Overleaf projects (via secure link sharing credentials).
- **Dual Deployment Modes**:
  - **Cloud (SaaS)**: Fully managed service with a dashboard.
  - **Local (Self-Hosted)**: Run strictly on your own hardware for maximum privacy.

### Membership & Tiers
- **Free Tier**: 1 active project, daily sync frequency.
- **Pro Tier**: Unlimited projects, instant sync, priority queues.
- **Institutional Tier**: SSO integration, custom domains, dedicated support.

### User Dashboard
- **Project Management**: Add, edit, delete, and manually sync projects.
- **Live Preview**: Direct links to view the deployed PDF.
- **Analytics**: Basic view counts for shared documents.
- **Multilingual Support**: Full UI support for English and Chinese.

## 2. Architecture Design

The system follows a modern **Serverless / JAMstack** architecture, optimized for scalability and low maintenance.

### High-Level Components

```mermaid
graph TD
    User[User] -->|Web UI| WebApp[Next.js Web App]
    User -->|View PDF| CDN[Cloudflare R2 (CDN)]
    
    WebApp -->|Auth & Data| Supabase[Supabase (PostgreSQL)]
    
    Supabase -->|Trigger| GithubActions[GitHub Actions Worker]
    
    GithubActions -->|1. Fetch Source| Overleaf[Overleaf.com]
    GithubActions -->|2. Compile & Download| HeadlessBrowser[Headless Chrome]
    GithubActions -->|3. Upload PDF| CDN
    
    subgraph Data Layer
        Supabase
    end
    
    subgraph Compute Layer
        WebApp
        GithubActions
    end
    
    subgraph Storage Layer
        CDN
    end
```

### Component Details

#### 1. Web Application (`apps/cloud/web`)
- **Framework**: Next.js (React)
- **Deployment**: Vercel
- **Styling**: TailwindCSS + Glassmorphism UI
- **Role**: User interface for managing projects, billing, and profile settings.

#### 2. Backend & Database (`apps/cloud/supabase`, `apps/cloud/api`)
- **Platform**: Supabase
- **Database**: PostgreSQL
- **Key Features**:
  - **Auth**: Handles Magic Links, OAuth (GitHub/Google).
  - **RLS**: Row Level Security ensures users only access their own data.
  - **Triggers**: Automated logic for membership tier calculation (`subscriptions` -> `profiles`).
  - **Cron**: Scheduled tasks to trigger sync jobs.

#### 3. Worker / Bot (`overlink/overleaf_bot`)
- **Runtime**: Python / Playwright
- **Platform**: GitHub Actions (triggered via API)
- **Role**: The core engine. It launches a headless browser to log in to Overleaf (if needed), open the project, wait for compilation, and download the PDF.
- **Optimizations**: Uses caching and smart waiting to minimize resource usage.

#### 4. Storage & Delivery
- **Provider**: Cloudflare R2 (S3-compatible)
- **Role**: Stores the final PDF artifacts.
- **Access**: Public read access to allow direct embedding in user websites.

## 3. Database Schema

### `public.profiles`
Stores user identity and cached membership status.
- `id` (PK): User UUID
- `tier`: Cached current tier ('free', 'pro', 'institutional') - *Updated by trigger*

### `public.subscriptions`
Tracks billing history and active subscriptions.
- `user_id`: Reference to user
- `status`: 'active', 'cancelled', 'expired'
- `start_at` / `end_at`: Validity period
- *Trigger*: On update, automatically recalculates `profiles.tier`.

### `public.projects`
Stores the link between a user and an Overleaf project.
- `filename`: The public handle (e.g., `resume`)
- `project_id`: The Overleaf ID
- `last_sync_at`: Timestamp of last update
- `overleaf_credentials`: Encrypted storage for private project access.
