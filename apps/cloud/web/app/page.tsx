
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

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">OverLink Cloud</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleLogin('github')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition w-64 text-center"
          >
            Login with GitHub
          </button>
          <button
            onClick={() => handleLogin('google')}
            className="bg-white text-black border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition w-64 text-center"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold">OverLink Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span>{session.user.email}</span>
            <button onClick={handleLogout} className="text-red-500 text-sm">Logout</button>
          </div>
        </header>

        {/* Add Project Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
          <form onSubmit={handleAddProject} className="grid grid-cols-2 gap-4">
            <input placeholder="Filename (e.g. cv)" value={filename} onChange={e => setFilename(e.target.value)} className="border p-2 rounded" required />
            <input placeholder="Overleaf Project ID / URL" value={projectId} onChange={e => setProjectId(e.target.value)} className="border p-2 rounded" required />
            <input placeholder="Overleaf Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
            <input type="password" placeholder="Overleaf Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
            <button disabled={loading} className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              {loading ? "Saving..." : "Add Project"}
            </button>
          </form>
        </div>

        {/* Project List */}
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{project.filename}</h3>
                <p className="text-gray-500 text-sm">{project.project_id}</p>
              </div>
              <div className="flex gap-2">
                <a href={`https://cdn.overlink.com/${project.filename}.pdf`} target="_blank" className="text-blue-500 underline mr-4">View PDF</a>
                <button onClick={() => handleSync(project.id)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">
                  Sync Now
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-center text-gray-400">No projects yet.</p>}
        </div>
      </div>
    </div>
  );
}
