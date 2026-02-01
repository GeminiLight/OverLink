import { useState } from 'react';
import './App.css';

function App() {
  const [nickname, setNickname] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultUrl, setResultUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !projectId) return;

    setStatus('loading');
    setErrorMsg('');
    setResultUrl('');

    try {
      const response = await fetch('http://localhost:8000/api/mirror', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, project_id: projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to mirror CV');
      }

      const fullUrl = `http://localhost:8000${data.url}`;
      setResultUrl(fullUrl);
      setStatus('success');
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
        <p className="text-gray-400 text-center mb-8">Generate your Overleaf PDF instantly.</p>

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

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {status === 'loading' ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Mirror CV'}
          </button>
        </form>

        {status === 'error' && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 p-6 bg-green-500/10 border border-green-500/50 rounded-lg text-center animate-fade-in-up">
            <p className="text-green-200 font-medium mb-3">Your CV is ready!</p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors shadow-lg hover:shadow-green-500/25"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-gray-600 text-xs text-center w-full">
        Powered by Overleaf Bot
      </div>
    </div>
  );
}

export default App;
