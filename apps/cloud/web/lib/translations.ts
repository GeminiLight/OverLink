export type Lang = 'en' | 'zh';

export const translations: Record<Lang, any> = {
    en: {
        title: "OverLink",
        tagline: "Your Academic Assets, Always Current.",
        dashboard: "Dashboard",
        addProject: "Add New Project",
        yourProjects: "Your Projects",
        loginGithub: "Continue with GitHub",
        loginGoogle: "Continue with Google",
        logout: "LOGOUT",
        form: {
            filename: "Filename",
            filenamePlaceholder: "e.g. resume",
            projectId: "Overleaf URL / ID",
            projectIdPlaceholder: "https://www.overleaf.com/read/...",
            overleafEmail: "Overleaf Email",
            overleafPassword: "Overleaf Password",
            submit: "Add Project",
            updateSubmit: "Update Project",
            submitting: "Updating...",
            steps: {
                title: "How to get Link:",
                s1: "Open Overleaf Project",
                s2: "Turn on 'Link Sharing'",
                s3: "Copy 'Read-only Link'",
                example: "e.g. overleaf.com/read/rgvvdtxvjfjt"
            }
        },
        actions: {
            view: "VIEW PDF",
            sync: "SYNC",
            edit: "EDIT",
            delete: "DELETE",
            syncing: "Starting...",
        },
        hero: {
            title: "OverLink",
            desc: "Sync your Overleaf projects to persistent PDF URLs."
        },
        howItWorks: {
            title: "How it Works",
            step1: { title: "Write LaTeX", desc: "Focus on your research and writing in Overleaf." },
            step2: { title: "Bot Syncs", desc: "OverLink bot pulls and builds your latest PDF nightly." },
            step3: { title: "Live Link", desc: "Your personal site always serves the current version." }
        },
        features: {
            sync: "Zero-Touch Sync",
            syncDesc: "Automated nightly builds. Zero manual effort to keep your site updated.",
            url: "Permanent URLs",
            urlDesc: "One permanent URL for your resume or paper. Never send a dead link again.",
            open: "Secure & Encryption",
            openDesc: "Military-grade encryption for your credentials. Your privacy is our priority."
        },
        faq: {
            title: "Frequently Asked Questions",
            q1: "How do I find my Project ID?",
            a1: "Open your Overleaf project, click 'Share', turn on 'Link Sharing', and copy the 'Read-only link'. Paste that URL here.",
            q2: "Can I sync private projects?",
            a2: "Yes! OverLink uses a secure browser bot to access and compile your private projects.",
            q3: "Does my PDF link change?",
            a3: "No. Your specialized PDF URL allows you to update content without breaking existing links."
        },
        empty: "No projects yet. Add one to get started.",
        alert: {
            authFail: "Authentication failed",
            syncStarted: "Sync started!",
            syncFail: "Sync failed to start",
            addFail: "Failed to add project",
            updateSuccess: "Project updated!",
            updateFail: "Failed to update project",
            deleteSuccess: "Project deleted!",
            deleteFail: "Failed to delete project",
            copySuccess: "Link copied to clipboard!",
        },
        modal: {
            editTitle: "Edit Project",
            deleteTitle: "Delete Project",
            deleteConfirm: "Are you sure you want to delete this project? This action cannot be undone.",
            cancel: "Cancel",
            confirmDelete: "Delete",
            save: "Save Changes",
        },
        // Missing keys
        misc: {
            projectsCount: "Projects",
            createNew: "Create New",
            pro: "Pro",
            views: "views",
            proTier: "PRO TIER",
            goPro: "GO PRO",
            cloudPlatform: "CLOUD PLATFORM"
        },
        pricing: {
            title: "Simple, Transparent Pricing",
            subtitle: "Invest in your academic career with professional tools.",
            monthly: "/ month",
            free: {
                title: "Free",
                desc: "Perfect for getting started.",
                price: "$0",
                features: ["1 Active Project", "Daily Sync", "Public PDF Link", "Basic Analytics"]
            },
            pro: {
                title: "Pro",
                desc: "For serious researchers.",
                price: "$0.99",
                features: ["Unlimited Projects", "Instant Sync", "Priority Support", "Advanced Analytics", "Custom Domain (Coming Soon)"],
                cta: "Upgrade Now"
            },
            institutional: {
                title: "Institutional",
                desc: "For labs and universities.",
                price: "Custom",
                cta: "Contact Sales"
            }
        }
    },
    zh: {
        title: "OverLink",
        tagline: "学术资产，始终在线。",
        dashboard: "控制台",
        addProject: "添加新项目",
        yourProjects: "您的项目",
        loginGithub: "使用 GitHub 登录",
        loginGoogle: "使用 Google 登录",
        logout: "退出登录",
        form: {
            filename: "文件名称",
            filenamePlaceholder: "例如：resume",
            projectId: "Overleaf 项目链接 / ID",
            projectIdPlaceholder: "https://www.overleaf.com/read/...",
            overleafEmail: "Overleaf 邮箱",
            overleafPassword: "Overleaf 密码",
            submit: "添加项目",
            updateSubmit: "更新项目",
            submitting: "更新中...",
            steps: {
                title: "如何获取链接：",
                s1: "打开 Overleaf 项目",
                s2: "开启 Share -> Link Sharing",
                s3: "复制 Read-only Link",
                example: "例如：overleaf.com/read/rgvvdtxvjfjt"
            }
        },
        actions: {
            view: "查看 PDF",
            sync: "同步",
            edit: "修改",
            delete: "删除",
            syncing: "启动中...",
        },
        hero: {
            title: "OverLink",
            desc: "将您的 Overleaf 项目自动同步到永久的 PDF 链接。"
        },
        howItWorks: {
            title: "运作过程",
            step1: { title: "编写 LaTeX", desc: "在 Overleaf 中如常进行您的学术写作。" },
            step2: { title: "自动抓取", desc: "OverLink 机器人每天会自动同步您的最新版 PDF。" },
            step3: { title: "即刻呈现", desc: "你在任何地方引用的链接将始终显示最新版本的 PDF。" }
        },
        features: {
            sync: "自动同步",
            syncDesc: "每晚自动构建。无需任何手动操作即可保持站点更新。",
            url: "永久链接",
            urlDesc: "为您的简历或论文提供一个永久链接。再也不会发送死链。",
            open: "安全加密",
            openDesc: "军用级凭据加密。您的隐私是我们的首要任务。"
        },
        faq: {
            title: "常见问题",
            q1: "如何获取我的项目 ID？",
            a1: "打开您的 Overleaf 项目，点击右上角“Share (分享)”，开启“Turn on link sharing (开启链接分享)”，复制“Read-only link (只读链接)”并填入此处。",
            q2: "支持私有项目同步吗？",
            a2: "支持！OverLink通过安全的浏览器机器人访问并编译您的私有项目。",
            q3: "PDF 链接会变吗？",
            a3: "不会。您的 PDF 链接是永久固定的，内容更新后无需重新分享链接。"
        },
        empty: "暂无项目。添加一个开始使用。",
        alert: {
            authFail: "认证失败",
            syncStarted: "同步已启动！",
            syncFail: "同步启动失败",
            addFail: "添加项目失败",
            updateSuccess: "项目已更新！",
            updateFail: "更新项目失败",
            deleteSuccess: "项目已删除！",
            deleteFail: "删除项目失败",
            copySuccess: "链接已复制！",
        },
        modal: {
            editTitle: "编辑项目",
            deleteTitle: "删除项目",
            deleteConfirm: "您确定要删除此项目吗？该操作无法撤销。",
            cancel: "取消",
            confirmDelete: "删除",
            save: "保存更改",
        },
        misc: {
            projectsCount: "个项目",
            createNew: "新建项目",
            pro: "专业版",
            views: "次查看",
            proTier: "专业版",
            goPro: "升级专业版",
            cloudPlatform: "云平台"
        },
        pricing: {
            title: "简单透明的价格",
            subtitle: "为您的学术生涯投资，使用更专业的工具。",
            monthly: "/ 月",
            free: {
                title: "免费版",
                desc: "适合初学者体验。",
                price: "¥0",
                features: ["1 个活跃项目", "每日自动同步", "公开 PDF链接", "基础数据统计"]
            },
            pro: {
                title: "专业版",
                desc: "为严谨的研究者打造。",
                price: "¥35",
                features: ["无限项目数量", "即时同步", "优先技术支持", "高级数据统计", "自定义域名 (即将推出)"],
                cta: "立即升级"
            },
            institutional: {
                title: "机构版",
                desc: "适用于实验室和高校。",
                price: "定制",
                cta: "联系销售"
            }
        }
    }
};
