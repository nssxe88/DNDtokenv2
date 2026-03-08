import { useEffect, useState, useRef } from 'react';
import {
  X,
  FolderOpen,
  Save,
  FilePlus2,
  Trash2,
  Pencil,
  Download,
  Upload,
  Clock,
} from 'lucide-react';
import { useStore } from '../../store/index.ts';

export function ProjectManagerModal() {
  const open = useStore((s) => s.projectManagerOpen);
  const closeModal = useStore((s) => s.closeProjectManager);
  const savedProjects = useStore((s) => s.savedProjects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const currentProjectName = useStore((s) => s.currentProjectName);
  const projectDirty = useStore((s) => s.projectDirty);
  const loadSavedProjects = useStore((s) => s.loadSavedProjects);
  const saveCurrentProject = useStore((s) => s.saveCurrentProject);
  const loadProject = useStore((s) => s.loadProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const renameProject = useStore((s) => s.renameProject);
  const newProject = useStore((s) => s.newProject);
  const exportProjectFile = useStore((s) => s.exportProjectFile);
  const importProjectFile = useStore((s) => s.importProjectFile);

  const [saveName, setSaveName] = useState(currentProjectName);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync save name when project name changes or modal opens
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      loadSavedProjects();
    }
    prevOpen.current = open;
  }, [open, loadSavedProjects]);

  useEffect(() => {
    if (open) {
      setSaveName(currentProjectName);
    }
  }, [currentProjectName]); // eslint-disable-line react-hooks/set-state-in-effect

  if (!open) return null;

  const handleSave = () => {
    const name = saveName.trim() || 'Untitled Project';
    saveCurrentProject(name);
  };

  const handleLoad = (id: string) => {
    loadProject(id);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setConfirmDeleteId(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      renameProject(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importProjectFile(file);
    }
    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatDate = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-xl rounded-lg bg-slate-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-200">Projekt Kezel\u0151</h2>
          <button
            onClick={closeModal}
            className="text-slate-400 transition-colors hover:text-slate-200"
            aria-label="Bez\u00e1r\u00e1s"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Save current project */}
        <div className="border-b border-slate-700 px-6 py-4">
          <h3 className="mb-3 text-sm font-medium text-slate-300">Ment\u00e9s</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Projekt neve..."
              className="flex-1 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              <Save className="h-4 w-4" />
              Ment\u00e9s
            </button>
          </div>
          {projectDirty && (
            <p className="mt-1 text-xs text-amber-400">Nem mentett v\u00e1ltoz\u00e1sok</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 border-b border-slate-700 px-6 py-3">
          <button
            onClick={newProject}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            \u00daj Projekt
          </button>
          <button
            onClick={exportProjectFile}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export\u00e1l\u00e1s
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Import\u00e1l\u00e1s
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ftp,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Saved projects list */}
        <div className="max-h-80 overflow-y-auto px-6 py-4">
          <h3 className="mb-3 text-sm font-medium text-slate-300">Mentett Projektek</h3>
          {savedProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              M\u00e9g nincs mentett projekt
            </p>
          ) : (
            <div className="space-y-2">
              {savedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`group flex items-center gap-3 rounded-md border p-3 transition-colors ${
                    project.id === currentProjectId
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  {/* Thumbnail or placeholder */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-slate-700">
                    {project.thumbnailSrc ? (
                      <img
                        src={project.thumbnailSrc}
                        alt=""
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <FolderOpen className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    {renamingId === project.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(project.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onBlur={() => handleRenameSubmit(project.id)}
                        autoFocus
                        className="w-full rounded border border-blue-500 bg-slate-700 px-2 py-0.5 text-sm text-slate-200 focus:outline-none"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium text-slate-200">
                        {project.name}
                        {project.id === currentProjectId && (
                          <span className="ml-2 text-xs text-blue-400">(akt\u00edv)</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                      <span>\u00b7 {project.tokenCount} token</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleLoad(project.id)}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-600 hover:text-white"
                      title="Bet\u00f6lt\u00e9s"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setRenamingId(project.id);
                        setRenameValue(project.name);
                      }}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-600 hover:text-white"
                      title="\u00c1tnevez\u00e9s"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {confirmDeleteId === project.id ? (
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/30"
                      >
                        T\u00f6rl\u00e9s?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(project.id)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                        title="T\u00f6rl\u00e9s"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-700 px-6 py-3">
          <button
            onClick={closeModal}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-slate-200"
          >
            Bez\u00e1r\u00e1s
          </button>
        </div>
      </div>
    </div>
  );
}
