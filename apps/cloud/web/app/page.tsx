"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const translations = {
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
      projectIdPlaceholder: "Link",
      email: "Overleaf Email (Optional)",
      emailPlaceholder: "Email",
      password: "Password (Optional)",
      passwordPlaceholder: "Password",
      submit: "Add Project",
      submitting: "Adding..."
    },
    actions: {
      view: "VIEW PDF",
      sync: "SYNC",
      syncing: "Starting...",
    },
    hero: {
      title: "OverLink Cloud",
      desc: "Sync your Overleaf projects to persistent, magic URLs. Zero friction."
    },
    howItWorks: {
      title: "How it Works",
      step1: { title: "Write LaTeX", desc: "Focus on your research and writing in Overleaf." },
      step2: { title: "Bot Syncs", desc: "OverLink bot pulls and builds your latest PDF nightly." },
      step3: { title: "Live Link", desc: "Your personal site always serves the current version." }
    },
    features: {
      sync: "Zero-Touch Sync",
      url: "Permanent URLs",
      open: "Secure & Encryption"
    },
    faq: {
      title: "Frequently Asked Questions",
      q1: "Is it really free?",
      a1: "Yes. Use our cloud infra or deploy your own worker.",
      q2: "How long until it's live?",
      a2: "Usually about 2 minutes after the sync is triggered.",
      q3: "Is my data safe?",
      a3: "Your Overleaf credentials are encrypted before storage."
    },
    empty: "No projects yet. Add one to get started.",
    alert: {
      success: "Sync started!",
      fail: "Sync failed to start",
      addFail: "Failed to add project"
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
      projectIdPlaceholder: "分享链接",
      email: "Overleaf 邮箱 (选填)",
      emailPlaceholder: "邮箱",
      password: "密码 (选填)",
      passwordPlaceholder: "密码",
      submit: "添加项目",
      submitting: "添加中..."
    },
    actions: {
      view: "查看 PDF",
      sync: "同步",
      syncing: "启动中...",
    },
    hero: {
      title: "OverLink 云端",
      desc: "将您的 Overleaf 项目同步到永久链接。零摩擦，全自动。"
    },
    howItWorks: {
      title: "运作过程",
      step1: { title: "编写 LaTeX", desc: "在 Overleaf 中如常进行您的学术写作。" },
      step2: { title: "机器人抓取", desc: "OverLink 机器人每晚会自动同步您的最新版 PDF。" },
      step3: { title: "即刻呈现", desc: "您的个人仓库将始终显示最新版本的 PDF。" }
    },
    features: {
      sync: "自动同步",
      url: "永久链接",
      open: "安全加密"
    },
    faq: {
      title: "常见问题",
      q1: "它是免费的吗？",
      a1: "是的。使用我们的云端设施，或部署您自己的 Worker。",
      q2: "同步需要多久？",
      a2: "初始化后，系统大约需要 2 分钟来更新您的资产。",
      q3: "数据安全吗？",
      a3: "您的 Overleaf 密码在存储前会经过高强度加密。"
    },
    empty: "暂无项目。添加一个开始使用。",
    alert: {
      success: "同步已启动！",
      fail: "同步启动失败",
      addFail: "添加项目失败"
    }
  }
};

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [filename, setFilename] = useState("");
  const [projectId, setProjectId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // I18n & Theme State
  const [lang, setLang] = useState<Lang>('en');
  // Lazy init theme to prevent FOUC
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  const t = translations[lang];

  useEffect(() => {
    // Adaptive Language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) setLang('zh');
  }, []);

  useEffect(() => {
    // Adaptive Theme
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProjects(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProjects(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async (userId: string) => {
    const { data } = await supabase.from("projects").select("*").eq("user_id", userId);
    if (data) setProjects(data);
  };

  const handleLogin = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProjects([]);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        filename, projectId, email, password
      })
    });

    if (res.ok) {
      setFilename(""); setProjectId(""); setEmail(""); setPassword("");
      fetchProjects(session.user.id);
    } else {
      alert(t.alert.addFail);
    }
    setLoading(false);
  };

  const handleSync = async (projId: string) => {
    if (!session) return;
    const res = await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify({ projectId: projId, userId: session.user.id })
    });
    if (res.ok) alert(t.alert.success);
    else alert(t.alert.fail);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden text-slate-900 dark:text-white pb-32 transition-colors duration-300 bg-white dark:bg-[#0a0a0a]">
      {/* Hero BG */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>

      {/* Navbar Controls (Absolute Top-Right for Cleanliness) */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2.5 rounded-full bg-white/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm">
          {theme === 'light' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        </button>
        <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
          {lang === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
        </button>
      </div>

      {!session ? (
        // Enriched Landing Page
        <div className="w-full flex flex-col items-center">
          {/* Hero Section */}
          <div className="flex min-h-[85vh] flex-col items-center justify-center p-8 z-10 animate-fade-in text-center max-w-4xl">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl mb-10 rotate-3 hover:rotate-6 transition-transform">
              <span className="text-white font-bold text-4xl">O</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-[Plus Jakarta Sans] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-white/40 leading-[1.05]">
              {t.hero.title}
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium mb-14 leading-relaxed">
              {t.hero.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
              <button
                onClick={() => handleLogin('github')}
                className="flex-1 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" className="fill-current">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                {t.loginGithub}
              </button>
              <button
                onClick={() => handleLogin('google')}
                className="flex-1 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold shadow-xl hover:bg-slate-50 dark:hover:bg-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                {t.loginGoogle}
              </button>
            </div>
          </div>

          {/* How it Works */}
          <section className="w-full max-w-6xl px-6 mb-40 z-10 animate-fade-in delay-200">
            <h3 className="text-center text-sm font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mb-20">{t.howItWorks.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((num) => (
                <div key={num} className="glass p-10 rounded-[3rem] flex flex-col items-start gap-6 hover-lift group relative overflow-hidden backdrop-blur-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[5rem] group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 rounded-[1.25rem] bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all text-2xl shadow-inner">
                    {num}
                  </div>
                  <h4 className="text-2xl font-bold dark:text-white tracking-tight">{(t.howItWorks as any)[`step${num}`].title}</h4>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{(t.howItWorks as any)[`step${num}`].desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bento Features */}
          <section className="w-full max-w-6xl px-6 mb-40 z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-10 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-[3rem] flex flex-col justify-between hover:bg-white dark:hover:bg-white/10 transition-all group">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-blue-600 transition-colors">{t.features.sync}</h4>
                  <p className="text-slate-500 dark:text-gray-400 font-medium text-lg leading-relaxed">Automated nightly builds. Zero manual effort to keep your site updated.</p>
                </div>
              </div>
              <div className="md:col-span-1 p-10 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-[3rem] flex flex-col justify-between hover:bg-white dark:hover:bg-white/10 transition-all group">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-purple-600 transition-colors">{t.features.url}</h4>
                  <p className="text-slate-500 dark:text-gray-400 font-medium text-lg leading-relaxed">One permanent URL for your resume or paper. Never send a dead link again.</p>
                </div>
              </div>
              <div className="md:col-span-1 p-10 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-[3rem] flex flex-col justify-between hover:bg-white dark:hover:bg-white/10 transition-all group">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-emerald-600 transition-colors">{t.features.open}</h4>
                  <p className="text-slate-500 dark:text-gray-400 font-medium text-lg leading-relaxed">Military-grade encryption for your credentials. Your privacy is our priority.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic FAQ Section */}
          <section className="w-full max-w-5xl px-6 mb-40 z-10">
            <h3 className="text-center text-sm font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mb-20">{t.faq.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <h4 className="font-bold text-2xl tracking-tight dark:text-white">{(t as any).faq[`q${i}`]}</h4>
                  <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{(t as any).faq[`a${i}`]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full py-20 text-center opacity-30">
            <p className="text-xs font-black uppercase tracking-[1em] text-slate-400">{t.title} CLOUD</p>
          </footer>
        </div>
      ) : (
        // Dashboard
        <div className="w-full max-w-6xl px-6 z-10 animate-fade-in">
          {/* Header */}
          <header className="flex justify-between items-center py-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{t.dashboard}</h1>
            </div>
            <div className="flex gap-4 items-center bg-white/50 dark:bg-white/5 backdrop-blur-md p-2 pl-4 rounded-full border border-white/20 dark:border-white/5 shadow-sm">
              <span className="text-sm font-medium text-slate-600 dark:text-white/80">{session.user.email}</span>
              {session.user.tier !== 'pro' && (
                <button
                  className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-full text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  GO PRO
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full text-xs font-bold transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Project Form */}
            <div className="lg:col-span-1">
              <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden">
                <h2 className="text-xl font-bold mb-6 dark:text-white">{t.addProject}</h2>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.filename}</label>
                    <input
                      placeholder={t.form.filenamePlaceholder}
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.projectId}</label>
                    <input
                      placeholder={t.form.projectIdPlaceholder}
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.email}</label>
                    <input
                      placeholder={t.form.emailPlaceholder}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.password}</label>
                    <input
                      type="password"
                      placeholder={t.form.passwordPlaceholder}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 dark:text-white"
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    {loading ? t.form.submitting : t.form.submit}
                  </button>
                </form>
              </div>
            </div>

            {/* Project List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4 px-2 dark:text-white">{t.yourProjects}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="glass p-6 rounded-2xl hover-lift group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[4rem] pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-800 dark:text-white">{project.filename}.pdf</h3>
                          {session.user.tier === 'pro' && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">Pro</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[150px]">{project.project_id}</p>
                        <div className="flex items-center gap-2 mt-2 text-slate-400 dark:text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <span className="text-xs font-semibold">{project.view_count || 0} views</span>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <a
                        href={`https://cdn.overlink.com/${project.filename}.pdf`}
                        target="_blank"
                        className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold text-center hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                        {t.actions.view}
                      </a >
                      <button
                        onClick={() => handleSync(project.id)}
                        className="px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                      >
                        {t.actions.sync}
                      </button>
                    </div >
                  </div >
                ))}
                {
                  projects.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                      <p>{t.empty}</p>
                    </div>
                  )
                }
              </div >
            </div >
          </div >
        </div >
      )}
    </div >
  );
}
