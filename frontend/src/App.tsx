import { useState, useEffect } from 'react';
import './App.css';

const envToken = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;

const translations = {
  en: {
    title: "OverLink",
    tagline: "Your Academic Assets, Always Current.",
    problem: {
      title: "The Update Friction",
      items: [
        "Manual Overleaf compilation",
        "Downloading 'v2_final' PDFs",
        "Manual repo uploads",
        "Broken links on your site"
      ]
    },
    solution: {
      title: "The OverLink Way",
      desc: "Edit your LaTeX in Overleaf. We handle the rest. Every night, our bot mirrors your projects to your site using GitHub Actions."
    },
    subtitle: {
      create: "Sync an Overleaf project to your persistent URL.",
      delete: "Remove a project from the mirror system."
    },
    mode: {
      create: "Sync Project",
      delete: "Remove Project"
    },
    form: {
      nickname: "Web Name (URL Path)",
      nicknamePlaceholder: "e.g. resume",
      email: "Verification Email",
      emailPlaceholderCreate: "Used for project mapping",
      emailPlaceholderDelete: "Email used when syncing",
      projectId: "Overleaf Project ID",
      projectIdPlaceholder: "24-character ID or URL",
      submitCreate: "Initialize Sync",
      submitDelete: "Stop Syncing"
    },
    success: {
      titleCreate: "Sync Initialized",
      titleDelete: "Project Removed",
      descCreate: "Your assets are now being mirrored. Link activated:",
      descDelete: "The project has been detached from the mirror.",
      copy: "Copy Link",
      copied: "Copied!",
      download: "View Asset"
    },
    logs: {
      title: "Sync Engine Logs",
      successMsg: "Operations Complete.",
      deleteSuccess: "Successfully removed."
    },
    footer: "OverLink • Built for Academics",
    features: {
      sync: {
        title: "Zero-Touch Sync",
        desc: "Updated automatically every night at 00:00 UTC."
      },
      url: {
        title: "Permanent URLs",
        desc: "Link stays valid forever. Shared once, works for life."
      },
      open: {
        title: "Open & Secure",
        desc: "Transparent automation. Your credentials, your repo."
      }
    },
    help: {
      title: "Finding your Project ID",
      desc: "Go to your Overleaf project. The ID is the 24-character string after /project/ in the URL."
    }
  },
  zh: {
    title: "OverLink",
    tagline: "学术资产，始终在线。",
    problem: {
      title: "更新繁琐？",
      items: [
        "频繁在 Overleaf 编译",
        "手动下载各种版本 PDF",
        "反复上传至仓库",
        "个人主页链接失效"
      ]
    },
    solution: {
      title: "OverLink 方案",
      desc: "在 Overleaf 中编辑您的 LaTeX，剩下的交给 OverLink。我们的机器人每晚会自动将您的项目镜像到您的 GitHub Pages。"
    },
    subtitle: {
      create: "同步 Overleaf 项目到您的永久链接。",
      delete: "从系统中移除您的项目。"
    },
    mode: {
      create: "开始同步",
      delete: "停止同步"
    },
    form: {
      nickname: "网页名称 (URL 路径)",
      nicknamePlaceholder: "例如：resume",
      email: "验证邮箱",
      emailPlaceholderCreate: "用于身份验证",
      emailPlaceholderDelete: "同步时使用的邮箱",
      projectId: "Overleaf 项目 ID",
      projectIdPlaceholder: "24 位 ID 或完整链接",
      submitCreate: "开启同步",
      submitDelete: "停止同步"
    },
    success: {
      titleCreate: "同步已启动",
      titleDelete: "项目已移除",
      descCreate: "您的资产正在被镜像。永久链接已激活：",
      descDelete: "该项目已从系统中移除。",
      copy: "复制链接",
      copied: "已复制！",
      download: "查看资产"
    },
    logs: {
      title: "同步引擎日志",
      successMsg: "处理完成。",
      deleteSuccess: "删除成功。"
    },
    footer: "OverLink • 为学术而生",
    features: {
      sync: {
        title: "自动同步",
        desc: "每晚 00:00 UTC 自动更新，无需手动操作。"
      },
      url: {
        title: "永久链接",
        desc: "链接终身有效。分享一次，永久可用。"
      },
      open: {
        title: "开源安全",
        desc: "完全透明的自动化流程。您的密钥，您的仓库。"
      }
    },
    help: {
      title: "如何找到项目 ID？",
      desc: "打开您的 Overleaf 项目。ID 是 URL 中 /project/ 后的 24 位字符串。"
    }
  }
};

type Lang = 'en' | 'zh';
type Theme = 'light' | 'dark';

function App() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [projectId, setProjectId] = useState('');
  const [mode, setMode] = useState<'create' | 'delete'>('create');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultUrl, setResultUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Language & Theme State
  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) setLang('zh');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const [isProduction] = useState(() => {
    const h = window.location.hostname;
    return h !== 'localhost' && h !== '127.0.0.1';
  });

  const pat = envToken || localStorage.getItem('github_pat') || '';
  const REPO_OWNER = 'geminilight';
  const REPO_NAME = 'overlink';

  const t = translations[lang];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([]);
    setStatus('loading');
    setErrorMsg('');
    setResultUrl('');

    if (isProduction) {
      if (!pat) {
        setErrorMsg(lang === 'zh' ? "GitHub PAT 缺失" : "GitHub PAT missing.");
        setStatus('idle');
        return;
      }
      try {
        setLogs(prev => [...prev, "Contacting OverLink Cloud..."]);
        const actionType = mode === 'create' ? 'add' : 'delete';
        const payload = {
          event_type: "update_cv",
          client_payload: { action: actionType, nickname, email, project_id: projectId }
        };
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${pat}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Cloud Error");
        setStatus('success');
        setLogs(prev => [...prev, "Success! Dispatch sent.", "Deploying assets usually takes 2 minutes."]);
        setResultUrl(`https://${REPO_OWNER}.github.io/${REPO_NAME}/pdfs/${nickname}.pdf`);
      } catch (err: any) {
        setErrorMsg("Cloud Communication Failed");
        setStatus('error');
      }
      return;
    }

    // Localhost minimal logic
    setTimeout(() => {
      setLogs(["Local Engine active...", "Process complete."]);
      setStatus('success');
      setResultUrl(`http://localhost:8000/pdfs/${nickname}.pdf`);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-700 bg-white dark:bg-slate-900 flex flex-col items-center relative overflow-x-hidden text-slate-900 dark:text-white pb-32">

      {/* Hero BG */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>

      {/* Top Navbar */}
      <nav className="w-full max-w-6xl flex justify-between items-center py-8 px-6 z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-2xl font-[Plus Jakarta Sans] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-white/70">{t.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-gray-400">
            {theme === 'light' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          </button>
          <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent backdrop-blur-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            {lang === 'en' ? 'CN 🇨🇳' : 'EN 🇺🇸'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center mt-12 mb-20 px-4 z-10 animate-fade-in">
        <h2 className="text-5xl md:text-7xl font-bold font-[Plus Jakarta Sans] tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-white/40 leading-[1.1]">
          {t.tagline}
        </h2>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium">
          {t.solution.desc}
        </p>
      </section>

      {/* Main Flow Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 z-10">

        {/* Intro Side */}
        <div className="space-y-12 animate-fade-in animate-delay-1">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t.problem.title}</h3>
            <div className="space-y-3">
              {t.problem.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                  <svg className="w-5 h-5 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  {it}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(t.features).map(([key, f]) => (
              <div key={key} className="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl group hover:border-blue-500/50 transition-all shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h4>
                <p className="text-xs text-slate-500 dark:text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Side */}
        <div className="animate-fade-in animate-delay-2">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl relative">

            <h3 className="text-2xl font-bold font-[Plus Jakarta Sans] mb-2">{mode === 'create' ? t.mode.create : t.mode.delete}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
              {mode === 'create' ? t.subtitle.create : t.subtitle.delete}
            </p>

            {/* Sub-Switcher */}
            <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-2xl mb-8">
              <button onClick={() => { setMode('create'); setStatus('idle'); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'create' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
                {t.mode.create}
              </button>
              <button onClick={() => { setMode('delete'); setStatus('idle'); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'delete' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-md' : 'text-slate-500'}`}>
                {t.mode.delete}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error & Status Display */}
              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold">
                  {errorMsg}
                </div>
              )}
              {logs.length > 0 && status === 'loading' && (
                <div className="p-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-mono text-slate-400 dark:text-slate-500 max-h-24 overflow-y-auto">
                  {logs.map((l, i) => <div key={i}>&gt; {l}</div>)}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.nickname}</label>
                <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder={t.form.nicknamePlaceholder} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-gray-700 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 transition-all font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">{t.form.email}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={mode === 'create' ? t.form.emailPlaceholderCreate : t.form.emailPlaceholderDelete} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-gray-700 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 transition-all font-medium" />
              </div>
              {mode === 'create' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.form.projectId}</label>
                    <button type="button" onClick={() => setShowHelp(!showHelp)} className="text-xs font-bold text-blue-600 hover:underline">?</button>
                  </div>
                  {showHelp && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-400/20 rounded-xl text-xs text-blue-800 dark:text-blue-200 animate-fade-in">
                      <p className="font-bold mb-1">{t.help.title}</p>
                      <p>{t.help.desc}</p>
                    </div>
                  )}
                  <input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder={t.form.projectIdPlaceholder} className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-gray-700 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50 transition-all font-medium" />
                </div>
              )}
              <button type="submit" disabled={status === 'loading'} className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {status === 'loading' ? 'ENGINE STARTING...' : (mode === 'create' ? t.form.submitCreate : t.form.submitDelete)}
              </button>
            </form>

            {/* Success State Overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center z-30 animate-fade-in border border-emerald-500/30">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-2xl font-bold mb-2">{mode === 'create' ? t.success.titleCreate : t.success.titleDelete}</h4>
                <p className="text-slate-500 mb-8 max-w-xs">{mode === 'create' ? t.success.descCreate : t.success.descDelete}</p>

                {mode === 'create' && (
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/40 p-2 pl-4 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-xs font-mono flex-1 overflow-hidden text-ellipsis text-slate-600 dark:text-emerald-100">{resultUrl}</span>
                      <button onClick={handleCopy} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                        {copySuccess ? t.success.copied : t.success.copy}
                      </button>
                    </div>
                    <a href={resultUrl} target="_blank" className="block w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">{t.success.download}</a>
                  </div>
                )}
                <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">BACK TO FORM</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-32 w-full text-center text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
        {t.footer}
      </footer>
    </div>
  );
}

export default App;
