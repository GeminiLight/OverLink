
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [filename, setFilename] = useState("");
  const [projectId, setProjectId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    await supabase.auth.signInWithOAuth({ provider });
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
      alert("Failed to add project");
    }
    setLoading(false);
  };

  const handleSync = async (projId: string) => {
    if (!session) return;
    const res = await fetch("/api/sync", {
      method: "POST",
      body: JSON.stringify({ projectId: projId, userId: session.user.id })
    });
    if (res.ok) alert("Sync started!");
    else alert("Sync failed to start");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden text-slate-900 dark:text-white pb-32">
      {/* Hero BG */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none transition-colors duration-700"></div>

      {!session ? (
        // Login Hero Screen
        <div className="flex min-h-screen flex-col items-center justify-center p-8 z-10 animate-fade-in text-center">
          <h1 className="text-6xl font-bold font-[Plus Jakarta Sans] tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-white/40 leading-[1.1]">
            OverLink Cloud
          </h1>
          <p className="max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium mb-12">
            Sync your Overleaf projects to persistent, magic URLs. Zero friction.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button
              onClick={() => handleLogin('github')}
              className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <svg height="24" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true" className="fill-white">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              Continue with GitHub
            </button>
            <button
              onClick={() => handleLogin('google')}
              className="w-full py-4 bg-white text-black border border-slate-200 dark:border-white/10 rounded-xl font-bold shadow-md hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="fill-slate-900"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              Continue with Google
            </button>
          </div>
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
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</h1>
            </div>
            <div className="flex gap-4 items-center bg-white/50 backdrop-blur-md p-2 pl-4 rounded-full border border-white/20 shadow-sm">
              <span className="text-sm font-medium text-slate-600">{session.user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs font-bold transition-colors"
              >
                LOGOUT
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Project Form */}
            <div className="lg:col-span-1">
              <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden">
                <h2 className="text-xl font-bold mb-6">Add New Project</h2>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Filename</label>
                    <input
                      placeholder="e.g. resume"
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Overleaf URL / ID</label>
                    <input
                      placeholder="Link"
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Overleaf Email</label>
                    <input
                      placeholder="Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500/50"
                      required
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Project"}
                  </button>
                </form>
              </div>
            </div>

            {/* Project List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold mb-4 px-2">Your Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="glass p-6 rounded-2xl hover-lift group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-[4rem] pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{project.filename}.pdf</h3>
                        <p className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{project.project_id}</p>
                      </div>
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <a
                        href={`https://cdn.overlink.com/${project.filename}.pdf`}
                        target="_blank"
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold text-center hover:bg-slate-800 transition-colors"
                      >
                        VIEW PDF
                      </a>
                      <button
                        onClick={() => handleSync(project.id)}
                        className="px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center"
                      >
                        SYNC
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p>No projects yet. Add one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
