import { useState, useEffect } from 'react';
import './App.css';

const translations = {
  en: {
    title: "CV Mirror",
    subtitle: {
      create: "Generate your Overleaf PDF instantly.",
      delete: "Remove your CV from the system."
    },
    mode: {
      create: "Create",
      delete: "Delete"
    },
    form: {
      nickname: "Nickname",
      nicknamePlaceholder: "e.g. geminilight",
      email: "Email",
      emailPlaceholderCreate: "Required for verification",
      emailPlaceholderDelete: "Email used for verification",
      projectId: "Overleaf Project ID",
      projectIdPlaceholder: "e.g. 64b1f... or project URL",
      submitCreate: "Mirror CV",
      submitDelete: "Delete CV"
    },
    success: {
      titleCreate: "Your CV is Ready",
      titleDelete: "CV Deleted Successfully",
      descCreate: "Access your document using the link below.",
      descDelete: "The associated file has been removed.",
      copy: "Copy",
      copied: "Copied!",
      download: "Download PDF"
    },
    logs: {
      title: "Process Log",
      successMsg: "Success!",
      deleteSuccess: "Delete successful."
    },
    footer: "CV Mirror • Powered by Overleaf Bot"
  },
  zh: {
    title: "CV Mirror",
    subtitle: {
      create: "即刻生成您的 Overleaf PDF 简历。",
      delete: "从系统中移除您的简历。"
    },
    mode: {
      create: "创建",
      delete: "删除"
    },
    form: {
      nickname: "昵称",
      nicknamePlaceholder: "例如：geminilight",
      email: "邮箱",
      emailPlaceholderCreate: "用于身份验证",
      emailPlaceholderDelete: "用于验证的邮箱",
      projectId: "Overleaf 项目 ID",
      projectIdPlaceholder: "例如：64b1f... 或项目链接",
      submitCreate: "镜像简历",
      submitDelete: "删除简历"
    },
    success: {
      titleCreate: "您的简历已就绪",
      titleDelete: "简历删除成功",
      descCreate: "使用下方链接访问您的文档。",
      descDelete: "相关文件已被移除。",
      copy: "复制",
      copied: "已复制！",
      download: "下载 PDF"
    },
    logs: {
      title: "处理日志",
      successMsg: "成功！",
      deleteSuccess: "删除成功。"
    },
    footer: "CV Mirror • 由 Overleaf Bot 驱动"
  }
};

type Lang = 'en' | 'zh';

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

  // Language State
  const [lang, setLang] = useState<Lang>('en');

  // Auto-detect language
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      setLang('zh');
    } else {
      setLang('en');
    }
  }, []);

  // Production Mode State
  const [isProduction, setIsProduction] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    // Detect if we are in production (not localhost)
    const hostname = window.location.hostname;
    const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1';
    setIsProduction(isProd);

    if (isProd) {
      // Fetch users list
      fetch('./users.json')
        .then(res => res.json())
        .then(data => setUsersList(data))
        .catch(err => console.error("Failed to load users list", err));
    }
  }, []);

  const t = translations[lang];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      if (!nickname || !projectId || !email) return;
    } else {
      if (!nickname || !email) return;
    }

    setLogs([]);
    setStatus('loading');
    setErrorMsg('');
    setResultUrl('');

    try {
      if (mode === 'delete') {
        const endpoint = 'http://localhost:8000/api/delete';
        const payload = { username: nickname, email };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Failed to delete');
        setStatus('success');
        setLogs(prev => [...prev, t.logs.deleteSuccess]);

      } else {
        const endpoint = 'http://localhost:8000/api/mirror';
        const payload = { nickname, project_id: projectId, email };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'status') {
                setLogs(prev => [...prev, data.message]);
              } else if (data.type === 'result') {
                const fullUrl = `http://localhost:8000${data.url}`;
                setResultUrl(fullUrl);
                setStatus('success');
                setLogs(prev => [...prev, t.logs.successMsg]);
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setLang(prev => prev === 'en' ? 'zh' : 'en')}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {lang === 'en' ? 'English' : '中文'}
        </button>
      </div>

      {/* Increased container width from max-w-md to max-w-lg or xl for desktop */}
      <div className="w-full max-w-lg md:max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 z-10 relative transition-all duration-300">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 text-center tracking-tight">{t.title}</h1>

        {isProduction ? (
          <>
            <p className="text-gray-400 text-center mb-8 text-base md:text-lg">
              {lang === 'en' ? 'Download your latest mirrored CVs.' : '下载您最新的镜像简历。'}
            </p>
            <div className="space-y-4">
              {usersList.length > 0 ? usersList.map((user, idx) => (
                <a
                  key={idx}
                  href={`./pdfs/${user.username}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg text-emerald-400 group-hover:text-emerald-300">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.url.substring(0, 30)}...</div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </a>
              )) : (
                <div className="text-center text-gray-500 py-8">
                  {lang === 'en' ? 'No public CVs found.' : '未找到公开简历。'}
                </div>
              )}
            </div>
            <div className="mt-8 text-center text-xs text-gray-500">
              {lang === 'en'
                ? 'To add your CV, please run the application locally or edit users.json in the repository.'
                : '如需添加简历，请在本地运行程序或编辑仓库中的 users.json 文件。'}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-400 text-center mb-10 text-base md:text-lg">
              {mode === 'create' ? t.subtitle.create : t.subtitle.delete}
            </p>

            <div className="flex justify-center mb-8 bg-black/20 p-1.5 rounded-xl">
              <button
                onClick={() => { setMode('create'); setStatus('idle'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 px-6 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${mode === 'create' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {t.mode.create}
              </button>
              <button
                onClick={() => { setMode('delete'); setStatus('idle'); setErrorMsg(''); }}
                className={`flex-1 py-2.5 px-6 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${mode === 'delete' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {t.mode.delete}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div>
                <label htmlFor="nickname" className="block text-sm md:text-base font-medium text-gray-300 mb-2">{t.form.nickname}</label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-5 py-4 bg-black/30 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all text-base md:text-lg"
                  placeholder={t.form.nicknamePlaceholder}
                  required
                />
              </div>

              {mode === 'create' && (
                <div>
                  <label htmlFor="create-email" className="block text-sm md:text-base font-medium text-gray-300 mb-2">{t.form.email}</label>
                  <input
                    type="email"
                    id="create-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/30 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all text-base md:text-lg"
                    placeholder={t.form.emailPlaceholderCreate}
                    required
                  />
                </div>
              )}

              {mode === 'create' && (
                <div>
                  <label htmlFor="projectId" className="block text-sm md:text-base font-medium text-gray-300 mb-2">{t.form.projectId}</label>
                  <input
                    type="text"
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-5 py-4 bg-black/30 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all text-base md:text-lg"
                    placeholder={t.form.projectIdPlaceholder}
                    required
                  />
                </div>
              )}

              {mode === 'delete' && (
                <div>
                  <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-300 mb-2">{t.form.email}</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/30 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all text-base md:text-lg"
                    placeholder={t.form.emailPlaceholderDelete}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-white
                    ${mode === 'create'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/30'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 hover:shadow-red-500/30'}`}
              >
                {status === 'loading' ? (
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (mode === 'create' ? t.form.submitCreate : t.form.submitDelete)}
              </button>
            </form>

            {status === 'error' && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-base text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {status === 'success' && (
              <div className="mt-8 p-8 bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-2xl text-center animate-fade-in-up backdrop-blur-sm shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-emerald-100 font-bold text-2xl mb-2">
                  {mode === 'create' ? t.success.titleCreate : t.success.titleDelete}
                </p>
                <p className="text-emerald-200/60 text-base mb-6">
                  {mode === 'create' ? t.success.descCreate : t.success.descDelete}
                </p>

                {mode === 'create' && (
                  <div className="flex flex-col gap-5">
                    {/* Copy Link Section */}
                    <div className="relative group">
                      <div className="flex items-center bg-black/40 p-2 pl-4 rounded-xl border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        <input
                          readOnly
                          value={resultUrl}
                          className="bg-transparent border-none text-emerald-100 text-base flex-1 focus:ring-0 outline-none w-full font-mono tracking-tight"
                        />
                        <button
                          onClick={handleCopy}
                          className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                                  ${copySuccess
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white'}`}
                        >
                          {copySuccess ? (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span>{t.success.copied}</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              <span>{t.success.copy}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <a
                      href={resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      {t.success.download}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Terminal Logs */}
            {(status === 'loading' || (status === 'success' && logs.length > 0)) && (
              <div className="mt-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117] font-mono text-sm leading-relaxed">
                <div className="flex items-center px-4 py-2.5 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <span className="ml-4 text-gray-500 text-xs font-semibold uppercase tracking-widest">{t.logs.title}</span>
                </div>
                <div className="p-5 h-48 overflow-y-auto text-gray-300 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-gray-600 select-none font-bold">$</span>
                      <span className={log.includes("Error") ? "text-red-400" : (log.includes("Success") ? "text-emerald-400 font-bold" : "text-gray-300")}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {status === 'loading' && <div className="animate-pulse flex gap-3"><span className="text-gray-600 font-bold">$</span><span className="text-gray-500 text-lg leading-none">_</span></div>}
                </div>
              </div>
            )}
          </>
        )}</div>

      <div className="absolute bottom-6 text-gray-500/50 text-sm text-center w-full select-none font-medium">
        {t.footer}
      </div>
    </div>
  );
}

export default App;
