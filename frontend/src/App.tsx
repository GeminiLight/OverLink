import { useState } from 'react';
import './App.css';

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
        // Delete uses standard JSON
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
        setLogs(prev => [...prev, "Delete successful."]);

      } else {
        // Create uses StreamingResponse
        const endpoint = 'http://localhost:8000/api/mirror';
        // Note: For 'create', strict email check might be handled by backend or relaxed here
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
                setLogs(prev => [...prev, "Success!"]);
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

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 z-10 relative">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 text-center tracking-tight">CV Mirror</h1>
        <p className="text-gray-400 text-center mb-8">
          {mode === 'create' ? 'Generate your Overleaf PDF instantly.' : 'Remove your CV from the system.'}
        </p>

        <div className="flex justify-center mb-6 bg-black/20 p-1 rounded-lg">
          <button
            onClick={() => { setMode('create'); setStatus('idle'); setErrorMsg(''); }}
            className={`flex-1 py-1 px-4 rounded-md text-sm font-medium transition-all ${mode === 'create' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Create
          </button>
          <button
            onClick={() => { setMode('delete'); setStatus('idle'); setErrorMsg(''); }}
            className={`flex-1 py-1 px-4 rounded-md text-sm font-medium transition-all ${mode === 'delete' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">Nickname</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all"
              placeholder="e.g. geminilight"
              required
            />
          </div>

          {mode === 'create' && (
            <div>
              <label htmlFor="create-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="create-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all"
                placeholder="Required for verification"
                required
              />
            </div>
          )}

          {mode === 'create' && (
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-300 mb-1">Overleaf Project ID</label>
              <input
                type="text"
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all"
                placeholder="e.g. 64b1f..."
                required
              />
            </div>
          )}

          {mode === 'delete' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-600 outline-none transition-all"
                placeholder="Email used for verification"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full py-3.5 px-6 font-semibold rounded-lg shadow-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-white
                ${mode === 'create'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/25'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 hover:shadow-red-500/25'}`}
          >
            {status === 'loading' ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (mode === 'create' ? 'Mirror CV' : 'Delete CV')}
          </button>
        </form>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-emerald-500/30 rounded-xl text-center animate-fade-in-up backdrop-blur-sm shadow-xl">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-emerald-100 font-semibold text-lg mb-1">
              {mode === 'create' ? 'Your CV is Ready' : 'CV Deleted Successfully'}
            </p>
            <p className="text-emerald-200/60 text-sm mb-5">
              {mode === 'create' ? 'Access your document using the link below.' : 'The associated file has been removed.'}
            </p>

            {mode === 'create' && (
              <div className="flex flex-col gap-4">
                {/* Copy Link Section */}
                <div className="relative group">
                  <div className="flex items-center bg-black/40 p-1.5 pl-3 rounded-lg border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                    <input
                      readOnly
                      value={resultUrl}
                      className="bg-transparent border-none text-emerald-100 text-sm flex-1 focus:ring-0 outline-none w-full font-mono tracking-tight"
                    />
                    <button
                      onClick={handleCopy}
                      className={`ml-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                              ${copySuccess
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white'}`}
                    >
                      {copySuccess ? (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PDF
                </a>
              </div>
            )}
          </div>
        )}

        {(status === 'loading' || (status === 'success' && logs.length > 0)) && (
          <div className="mt-6 rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117] font-mono text-xs">
            <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <span className="ml-3 text-gray-500 text-[10px] uppercase tracking-wider">Process Log</span>
            </div>
            <div className="p-4 h-40 overflow-y-auto text-gray-300 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-600 select-none">$</span>
                  <span className={log.includes("Error") ? "text-red-400" : (log.includes("Success") ? "text-emerald-400 font-bold" : "text-gray-300")}>
                    {log}
                  </span>
                </div>
              ))}
              {status === 'loading' && <div className="animate-pulse flex gap-2"><span className="text-gray-600">$</span><span className="text-gray-500">_</span></div>}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-gray-600/50 text-xs text-center w-full select-none">
        CV Mirror &bull; Powered by Overleaf Bot
      </div>
    </div>
  );
}

export default App;
