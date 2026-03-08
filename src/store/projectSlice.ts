import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import type { ProjectMeta, ProjectData } from '../services/projectStorage.ts';
import * as storage from '../services/projectStorage.ts';
import type { Token, PrintSettings } from '../types/index.ts';
import { t as translate } from '../i18n/index.ts';
import type { Language } from '../i18n/index.ts';

export interface ProjectSlice {
  // Current project info
  currentProjectId: string | null;
  currentProjectName: string;
  projectDirty: boolean;
  projectManagerOpen: boolean;
  savedProjects: ProjectMeta[];

  // Actions
  openProjectManager: () => void;
  closeProjectManager: () => void;
  loadSavedProjects: () => Promise<void>;
  saveCurrentProject: (name?: string) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
  newProject: () => void;
  markDirty: () => void;
  exportProjectFile: () => void;
  importProjectFile: (file: File) => Promise<void>;
}

interface FullState {
  tokens: Token[];
  paperSize: PrintSettings['paperSize'];
  customPaperSize: PrintSettings['customPaperSize'];
  orientation: PrintSettings['orientation'];
  margins: number;
  spacing: number;
  unit: PrintSettings['unit'];
  cutMarks: boolean;
  bleed: number;
  currentProjectId: string | null;
  currentProjectName: string;
  language: Language;
  clearHistory: () => void;
  clearAllTokens: () => void;
  clearSelection: () => void;
  loadProject: (id: string) => Promise<void>;
}

function getFullState(api: { getState: () => unknown }): FullState {
  return api.getState() as FullState;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get, api) => ({
  currentProjectId: null,
  currentProjectName: 'Untitled Project',
  projectDirty: false,
  projectManagerOpen: false,
  savedProjects: [],

  openProjectManager: () => set({ projectManagerOpen: true }),
  closeProjectManager: () => set({ projectManagerOpen: false }),

  loadSavedProjects: async () => {
    const projects = await storage.listProjects();
    set({ savedProjects: projects });
  },

  saveCurrentProject: async (name) => {
    const state = getFullState(api);

    const id = state.currentProjectId ?? uuidv4();
    const projectName = name ?? state.currentProjectName;
    const now = new Date().toISOString();

    // Get a thumbnail from the first token if available
    let thumbnailSrc: string | null = null;
    if (state.tokens.length > 0) {
      thumbnailSrc = state.tokens[0].originalSrc;
    }

    const data: ProjectData = {
      meta: {
        id,
        name: projectName,
        createdAt: state.currentProjectId
          ? ((await storage.loadProject(id))?.meta.createdAt ?? now)
          : now,
        updatedAt: now,
        tokenCount: state.tokens.length,
        thumbnailSrc,
      },
      tokens: state.tokens,
      printSettings: {
        paperSize: state.paperSize,
        customPaperSize: state.customPaperSize,
        orientation: state.orientation,
        margins: state.margins,
        spacing: state.spacing,
        unit: state.unit,
        cutMarks: state.cutMarks,
        bleed: state.bleed,
      },
    };

    await storage.saveProject(data);

    set({
      currentProjectId: id,
      currentProjectName: projectName,
      projectDirty: false,
    });

    // Refresh the project list
    const projects = await storage.listProjects();
    set({ savedProjects: projects });

    toast.success(translate(getFullState(api).language, 'project.projectSaved'));
  },

  loadProject: async (id) => {
    const data = await storage.loadProject(id);
    if (!data) {
      toast.error(translate(getFullState(api).language, 'project.projectNotFound'));
      // Refresh project list to remove stale entries
      const projects = await storage.listProjects();
      set({ savedProjects: projects });
      return;
    }

    const state = getFullState(api);

    // Apply project data to store
    api.setState({
      tokens: data.tokens,
      paperSize: data.printSettings.paperSize,
      customPaperSize: data.printSettings.customPaperSize,
      orientation: data.printSettings.orientation,
      margins: data.printSettings.margins,
      spacing: data.printSettings.spacing,
      unit: data.printSettings.unit,
      cutMarks: data.printSettings.cutMarks,
      bleed: data.printSettings.bleed,
      currentProjectId: data.meta.id,
      currentProjectName: data.meta.name,
      projectDirty: false,
      projectManagerOpen: false,
    } as Partial<ProjectSlice>);

    // Clear undo history and selection
    state.clearHistory();
    state.clearSelection();

    toast.success(translate(getFullState(api).language, 'project.projectLoaded', { name: data.meta.name }));
  },

  deleteProject: async (id) => {
    await storage.deleteProject(id);
    const { currentProjectId } = get();
    if (currentProjectId === id) {
      set({ currentProjectId: null, currentProjectName: 'Untitled Project', projectDirty: false });
    }
    const projects = await storage.listProjects();
    set({ savedProjects: projects });
    toast.success(translate(getFullState(api).language, 'project.projectDeleted'));
  },

  renameProject: async (id, newName) => {
    await storage.renameProject(id, newName);
    const { currentProjectId } = get();
    if (currentProjectId === id) {
      set({ currentProjectName: newName });
    }
    const projects = await storage.listProjects();
    set({ savedProjects: projects });
  },

  newProject: () => {
    const state = getFullState(api);

    state.clearAllTokens();
    state.clearSelection();
    state.clearHistory();

    set({
      currentProjectId: null,
      currentProjectName: 'Untitled Project',
      projectDirty: false,
    });

    toast.success(translate(getFullState(api).language, 'project.newProjectCreated'));
  },

  markDirty: () => {
    set({ projectDirty: true });
  },

  exportProjectFile: () => {
    const state = getFullState(api);

    const id = state.currentProjectId ?? uuidv4();
    const data: ProjectData = {
      meta: {
        id,
        name: state.currentProjectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tokenCount: state.tokens.length,
        thumbnailSrc: null,
      },
      tokens: state.tokens,
      printSettings: {
        paperSize: state.paperSize,
        customPaperSize: state.customPaperSize,
        orientation: state.orientation,
        margins: state.margins,
        spacing: state.spacing,
        unit: state.unit,
        cutMarks: state.cutMarks,
        bleed: state.bleed,
      },
    };

    storage.exportProjectAsJson(data);
  },

  importProjectFile: async (file) => {
    const data = await storage.importProjectFromFile(file);
    if (!data) {
      toast.error(translate(getFullState(api).language, 'project.importFailed'));
      return;
    }

    // Give it a new ID to avoid conflicts
    const newId = uuidv4();
    data.meta.id = newId;
    data.meta.updatedAt = new Date().toISOString();

    await storage.saveProject(data);

    const state = getFullState(api);
    await state.loadProject(newId);
  },
});
