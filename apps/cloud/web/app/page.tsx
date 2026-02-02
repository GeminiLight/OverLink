"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { translations, Lang } from "@/lib/translations";

import { LandingHero } from "@/components/hero/LandingHero";
import { FAQ } from "@/components/hero/FAQ";
import { Features } from "@/components/hero/Features";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { AddProjectModal } from "@/components/modals/AddProjectModal";
import { EditProjectModal } from "@/components/modals/EditProjectModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  // Global Logic
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];

  // Auth & Data
  const { session, user, profile, loading: authLoading, login, logout, updateNickname } = useAuth();
  const { projects, syncingIds, loading: projectLoading, addProject, updateProject, deleteProject, syncProject } = useProjects(user?.id);

  // UI State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection State
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Form State
  const [filename, setFilename] = useState("");
  const [projectId, setProjectId] = useState("");
  const [editFilename, setEditFilename] = useState("");
  const [editProjectId, setEditProjectId] = useState("");

  // Auto-detect Language
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) setLang('zh');
  }, []);

  // Notifications helper
  const notify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addProject(filename, projectId);
    if (result.success) {
      if (result.data?.id) syncProject(result.data.id);
      notify("Project added successfully!", 'success');
      setFilename(""); setProjectId("");
      setIsAddOpen(false);
    } else {
      notify(t.alert.addFail, 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const success = await updateProject(selectedProject.id, editFilename, editProjectId);
    if (success) {
      notify(t.alert.updateSuccess, 'success');
      setIsEditOpen(false);
      setSelectedProject(null);
    } else {
      notify(t.alert.updateFail, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    const success = await deleteProject(selectedProject.id);
    if (success) {
      notify(t.alert.deleteSuccess, 'success');
      setIsDeleteOpen(false);
      setSelectedProject(null);
    } else {
      notify(t.alert.deleteFail, 'error');
    }
  };

  const handleCopyUrl = (fname: string) => {
    const url = `${process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.overlink.com'}/${fname}.pdf`;
    navigator.clipboard.writeText(url);
    notify(t.alert.copySuccess, 'success');
  };

  // Loading Screen
  if (authLoading && !session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-x-hidden text-foreground bg-background pb-32 transition-colors duration-500">
      {/* Background FX */}
      <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[160px] pointer-events-none transition-colors duration-700 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-700"></div>

      {/* Navbar Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button onClick={toggleTheme} className="p-3 rounded-2xl bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition-all text-slate-800 dark:text-gray-200 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl group active:scale-95">
          {theme === 'light' ? <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        </button>
        <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-5 py-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/40 dark:hover:bg-white/10 transition-all text-foreground active:scale-95">
          {lang === 'en' ? '🇬🇧 EN' : '🇨🇳 中文'}
        </button>
      </div>

      {!session ? (
        <>
          <LandingHero lang={lang} onLogin={login} />
          <Features lang={lang} />
          <FAQ lang={lang} />
        </>
      ) : (
        <div className="w-full max-w-7xl px-8 z-10 animate-fade-in pt-12">
          <UserProfile
            profile={profile}
            session={session}
            lang={lang}
            onUpdateNickname={(name) => {
              updateNickname(name).then(ok => ok ? notify("Nickname updated!", 'success') : notify("Failed to update nickname", 'error'));
            }}
            onLogout={logout}
          />

          <div className="w-full space-y-8">
            <div className="flex justify-between items-end px-2">
              <h2 className="text-4xl font-black tracking-tighter text-foreground opacity-90">{t.yourProjects}</h2>
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">{projects.length} {(t.misc as any).projectsCount}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => setIsAddOpen(true)}
                className="group relative flex flex-col items-center justify-center gap-6 glass p-8 rounded-[2.5rem] cursor-pointer hover-lift border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-100/50 dark:hover:bg-blue-500/10 min-h-[320px] transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="font-black text-lg text-blue-600 dark:text-blue-400 uppercase tracking-widest">{(t.misc as any).createNew}</p>
              </div>

              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  lang={lang}
                  session={session}
                  isSyncing={syncingIds.has(project.id)}
                  onSync={syncProject}
                  onEdit={(p) => {
                    setSelectedProject(p);
                    setEditFilename(p.filename);
                    setEditProjectId(p.project_id);
                    setIsEditOpen(true);
                  }}
                  onDelete={(p) => {
                    setSelectedProject(p);
                    setIsDeleteOpen(true);
                  }}
                  onCopyUrl={handleCopyUrl}
                />
              ))}

              {projects.length === 0 && (
                <div className="col-span-full py-32 text-center opacity-20 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.5em]">{t.empty}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Toasts */}
      <AddProjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
        filename={filename}
        setFilename={setFilename}
        projectId={projectId}
        setProjectId={setProjectId}
        lang={lang}
        loading={projectLoading}
      />

      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        filename={editFilename}
        setFilename={setEditFilename}
        projectId={editProjectId}
        setProjectId={setEditProjectId}
        lang={lang}
        loading={projectLoading}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        lang={lang}
        loading={projectLoading}
      />

      <Toast notification={notification} />
    </div>
  );
}
