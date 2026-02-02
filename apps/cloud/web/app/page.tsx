"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';

const translations: Record<Lang, any> = {
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
      overleafEmail: "Overleaf Email",
      overleafPassword: "Overleaf Password",
      submit: "Add Project",
      updateSubmit: "Update Project",
      submitting: "Updating..."
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
      desc: "Sync your Overleaf projects to persistent File URLs."
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
      addFail: "Failed to add project",
      updateSuccess: "Project updated!",
      updateFail: "Failed to update project",
      deleteSuccess: "Project deleted!",
      deleteFail: "Failed to delete project",
    },
    modal: {
      editTitle: "Edit Project",
      deleteTitle: "Delete Project",
      deleteConfirm: "Are you sure you want to delete this project? This action cannot be undone.",
      cancel: "Cancel",
      confirmDelete: "Delete",
      save: "Save Changes",
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
      overleafEmail: "Overleaf 邮箱",
      overleafPassword: "Overleaf 密码",
      submit: "添加项目",
      updateSubmit: "更新项目",
      submitting: "更新中..."
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
      desc: "将您的 Overleaf 项目自动同步到永久的文件链接。"
    },
    howItWorks: {
      title: "运作过程",
      step1: { title: "编写 LaTeX", desc: "在 Overleaf 中如常进行您的学术写作。" },
      step2: { title: "自动抓取", desc: "OverLink 机器人每天会自动同步您的最新版 PDF。" },
      step3: { title: "即刻呈现", desc: "你在任何地方引用的链接将始终显示最新版本的 PDF。" }
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
      addFail: "添加项目失败",
      updateSuccess: "项目已更新！",
      updateFail: "更新项目失败",
      deleteSuccess: "项目已删除！",
      deleteFail: "删除项目失败",
    },
    modal: {
      editTitle: "编辑项目",
      deleteTitle: "删除项目",
      deleteConfirm: "您确定要删除此项目吗？该操作无法撤销。",
      cancel: "取消",
      confirmDelete: "删除",
      save: "保存更改",
    }
  }
};



export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form State (Add)
  const [filename, setFilename] = useState("");
  const [projectId, setProjectId] = useState("");

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  // Edit Form State
  const [editFilename, setEditFilename] = useState("");
  const [editProjectId, setEditProjectId] = useState("");

  // I18n & Theme State
  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('light');

  // Hydrate theme from DOM (applied by blocking script)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const t = translations[lang];

  useEffect(() => {
    // Adaptive Language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) setLang('zh');
  }, []);

  useEffect(() => {
    // Adaptive Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProjects(session.user.id);
    });

    // Check for OAuth errors in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDesc = params.get('error_description');
    if (error) {
      setNotification({
        message: errorDesc || "Authentication failed",
        type: 'error'
      });
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check hash for legacy error structure
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('error')) {
        setNotification({
          message: hashParams.get('error_description') || "Authentication failed",
          type: 'error'
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

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
        filename,
        projectId
      })
    });

    if (res.ok) {
      const result = await res.json();
      setFilename(""); setProjectId("");
      await fetchProjects(session.user.id);

      // Auto-trigger sync for new projects
      if (result.data?.id) {
        handleSync(result.data.id);
      }
      setNotification({ message: "Project added successfully!", type: 'success' });
    } else {
      setNotification({ message: t.alert.addFail, type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !projectToEdit) return;
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: projectToEdit.id,
        userId: session.user.id,
        filename: editFilename,
        projectId: editProjectId
      })
    });

    if (res.ok) {
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      await fetchProjects(session.user.id);
      setNotification({ message: t.alert.updateSuccess, type: 'success' });
    } else {
      setNotification({ message: t.alert.updateFail, type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!session || !projectToDelete) return;
    setLoading(true);

    const res = await fetch(`/api/projects?id=${projectToDelete.id}&userId=${session.user.id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      await fetchProjects(session.user.id);
      setNotification({ message: t.alert.deleteSuccess, type: 'success' });
    } else {
      setNotification({ message: t.alert.deleteFail, type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteButtonClick = (project: any) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleEditButtonClick = (project: any) => {
    setProjectToEdit(project);
    setEditFilename(project.filename);
    setEditProjectId(project.project_id);
    setIsEditModalOpen(true);
  };

  // handleSync, etc. already defined above

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden text-foreground bg-background pb-32 transition-colors duration-500">
      {/* Dynamic Background Mesh/Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[160px] pointer-events-none transition-colors duration-700 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-700"></div>

      {/* Navbar Controls (Absolute Top-Right for Cleanliness) */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-3 rounded-2xl bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-all text-slate-800 dark:text-gray-200 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl group active:scale-95">
          {theme === 'light' ? <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        </button>
        <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-5 py-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/40 dark:hover:bg-white/10 transition-all text-foreground active:scale-95">
          {lang === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
        </button>
      </div>

      {!session ? (
        // Enriched Landing Page
        <div className="w-full flex flex-col items-center">
          {/* Hero Section */}
          <div className="flex min-h-[90vh] flex-col items-center justify-center p-8 z-10 animate-fade-in text-center max-w-5xl">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl mb-12 rotate-3 hover:rotate-6 transition-transform shadow-blue-500/20 animate-float">
              <span className="text-white font-bold text-5xl">O</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black font-[Plus Jakarta Sans] tracking-tighter mb-10 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 via-slate-800 to-slate-600 dark:from-white dark:via-white/90 dark:to-white/40 leading-[0.95] drop-shadow-sm">
              {t.hero.title}
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium mb-14 leading-relaxed">
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
                className="flex-1 py-5 bg-white dark:bg-white text-slate-900 dark:text-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl font-bold shadow-xl hover:bg-slate-50 dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="1 1 22 22" width="24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                {t.loginGoogle}
              </button>
            </div>
          </div>

          {/* How it Works */}
          <section className="w-full max-w-6xl px-6 mb-48 z-10 animate-fade-in delay-200">
            <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 mb-20 opacity-80">{t.howItWorks.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="glass p-12 rounded-[3.5rem] flex flex-col items-start gap-8 hover-lift group relative overflow-hidden backdrop-blur-3xl border-white/40 dark:border-white/5 shadow-2xl animate-fade-in" style={{ animationDelay: `${num * 0.15}s` }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-[6rem] group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-blue-400 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all text-3xl shadow-lg border border-slate-900/5 dark:border-white/5">
                    {num}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-foreground tracking-tight">{(t.howItWorks as any)[`step${num}`].title}</h4>
                    <p className="text-lg opacity-50 font-medium leading-relaxed">{(t.howItWorks as any)[`step${num}`].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bento Features */}
          <section className="w-full max-w-6xl px-6 mb-48 z-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-300">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-blue-600 transition-colors uppercase">{t.features.sync}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">Automated nightly builds. Zero manual effort to keep your site updated.</p>
                </div>
              </div>
              <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-400">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-purple-600 transition-colors uppercase">{t.features.url}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">One permanent URL for your resume or paper. Never send a dead link again.</p>
                </div>
              </div>
              <div className="md:col-span-1 p-12 bg-white/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center hover:bg-white dark:hover:bg-white/[0.05] transition-all group backdrop-blur-xl animate-fade-in delay-500">
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tighter group-hover:text-emerald-600 transition-colors uppercase">{t.features.open}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">Military-grade encryption for your credentials. Your privacy is our priority.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic FAQ Section */}
          <section className="w-full max-w-5xl px-6 mb-48 z-10">
            <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 mb-20 opacity-80">{t.faq.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-20">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-5 border-l-2 border-blue-600/20 dark:border-white/5 pl-8 py-2">
                  <h4 className="font-bold text-2xl tracking-tight text-foreground opacity-90">{(t as any).faq[`q${i}`]}</h4>
                  <p className="text-lg opacity-40 font-medium leading-relaxed">{(t as any).faq[`a${i}`]}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full py-24 text-center">
            <p className="text-[10px] font-black uppercase tracking-[1.5em] opacity-20">{t.title} CLOUD PLATFORM</p>
          </footer>
        </div>
      ) : (
        // Dashboard
        <div className="w-full max-w-7xl px-8 z-10 animate-fade-in pt-12">
          {/* Header */}
          <header className="flex justify-between items-center mb-16 px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10">
                <span className="text-white font-bold text-2xl">O</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-foreground">{t.dashboard}</h1>
                <p className="text-xs uppercase tracking-widest opacity-30 font-bold">{session.user.email}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl p-2 pr-6 rounded-full border border-white/50 dark:border-white/5 shadow-2xl">
              {session.user.tier !== 'pro' ? (
                <button
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:scale-105 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20"
                >
                  GO PRO
                </button>
              ) : (
                <span className="px-6 py-2.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">PRO TIER</span>
              )}
              <button
                onClick={handleLogout}
                className="text-xs font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity pl-4"
              >
                {t.logout}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Add Project Form */}
            <div className="lg:col-span-1">
              <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden backdrop-blur-3xl border-white/50 dark:border-white/5 shadow-3xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black tracking-tighter text-foreground">{t.addProject}</h2>
                </div>
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.filename}</label>
                    <input
                      placeholder={t.form.filenamePlaceholder}
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.projectId}</label>
                    <input
                      placeholder={t.form.projectIdPlaceholder}
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                      required
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                  >
                    {loading ? t.form.submitting : t.form.submit}
                  </button>
                </form>
              </div>
            </div>

            {/* Project List */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-2xl font-black tracking-tighter mb-8 px-2 text-foreground opacity-90">{t.yourProjects}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map(project => (
                  <div key={project.id} className="glass p-8 rounded-[2.5rem] hover-lift group relative overflow-hidden backdrop-blur-3xl border-white/50 dark:border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-[4rem] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-2xl text-foreground tracking-tight">{project.filename}.pdf</h3>
                          {session.user.tier === 'pro' && (
                            <span className="px-3 py-1 bg-amber-400 dark:bg-amber-400/10 text-amber-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-400/20">Pro</span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-30 font-bold uppercase tracking-widest truncate max-w-[200px]">{project.project_id}</p>
                        <div className="flex items-center gap-2 mt-4 opacity-40 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full w-fit">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">{project.view_count || 0} views</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${syncingIds.has(project.id)
                        ? 'bg-blue-500 animate-pulse-blue'
                        : 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-pulse'
                        }`}></div>
                    </div>

                    <div className="flex gap-3 mt-8 flex-wrap">
                      <a
                        href={`${process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.overlink.com'}/${project.filename}.pdf`}
                        target="_blank"
                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/5"
                      >
                        {t.actions.view}
                      </a >
                      <button
                        onClick={() => handleSync(project.id)}
                        disabled={syncingIds.has(project.id)}
                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${syncingIds.has(project.id)
                          ? 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-600/20'
                          }`}
                      >
                        {syncingIds.has(project.id) ? t.actions.syncing : t.actions.sync}
                      </button>
                      <button
                        onClick={() => handleEditButtonClick(project)}
                        className="px-4 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {t.actions.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteButtonClick(project)}
                        className="px-4 py-4 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        {t.actions.delete}
                      </button>
                    </div >
                  </div >
                ))}
                {
                  projects.length === 0 && (
                    <div className="col-span-full py-32 text-center opacity-20 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </div>
                      <p className="text-sm font-black uppercase tracking-[0.5em]">{t.empty}</p>
                    </div>
                  )
                }
              </div >
            </div >
          </div >
        </div >
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-modal w-full max-w-lg p-12 rounded-[3.5rem] animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[4rem] pointer-events-none"></div>
            <h2 className="text-3xl font-black tracking-tighter text-foreground mb-8">{t.modal.editTitle}</h2>
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.filename}</label>
                <input
                  value={editFilename}
                  onChange={e => setEditFilename(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">{t.form.projectId}</label>
                <input
                  value={editProjectId}
                  onChange={e => setEditProjectId(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 p-5 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-foreground transition-all font-medium text-lg leading-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  {t.modal.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {loading ? t.form.submitting : t.modal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-fade-in bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-modal w-full max-w-sm p-12 rounded-[3.5rem] animate-scale-in text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-bl-[4rem] pointer-events-none"></div>
            <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-foreground mb-4">{t.modal.deleteTitle}</h2>
            <p className="text-sm opacity-50 font-medium mb-10 leading-relaxed">{t.modal.deleteConfirm}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                {t.modal.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? "..." : t.modal.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className={`px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-3xl border ${notification.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400/20'
            : 'bg-red-500/90 text-white border-red-400/20'
            } flex items-center gap-4 font-bold text-sm tracking-wide`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
