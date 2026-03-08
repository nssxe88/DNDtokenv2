import { get, set, del } from 'idb-keyval';
import type { Token } from '../types/index.ts';
import type { PrintSettings } from '../types/index.ts';

/** Lightweight project metadata stored as an index entry. */
export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tokenCount: number;
  thumbnailSrc: string | null;
}

/** Full project data persisted to IndexedDB. */
export interface ProjectData {
  meta: ProjectMeta;
  tokens: Token[];
  printSettings: PrintSettings;
}

const PROJECT_KEY_PREFIX = 'project:';
const META_INDEX_KEY = 'project-index';

function projectKey(id: string): string {
  return `${PROJECT_KEY_PREFIX}${id}`;
}

/** List all saved project metadata (sorted by updatedAt desc). */
export async function listProjects(): Promise<ProjectMeta[]> {
  const index = await get<ProjectMeta[]>(META_INDEX_KEY);
  if (!index) return [];
  return index.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Save or update a project. */
export async function saveProject(data: ProjectData): Promise<void> {
  // Persist full project data
  await set(projectKey(data.meta.id), data);

  // Update metadata index
  const index = (await get<ProjectMeta[]>(META_INDEX_KEY)) ?? [];
  const existingIdx = index.findIndex((m) => m.id === data.meta.id);
  if (existingIdx >= 0) {
    index[existingIdx] = data.meta;
  } else {
    index.push(data.meta);
  }
  await set(META_INDEX_KEY, index);
}

/** Load full project data. */
export async function loadProject(id: string): Promise<ProjectData | null> {
  const data = await get<ProjectData>(projectKey(id));
  return data ?? null;
}

/** Delete a project. */
export async function deleteProject(id: string): Promise<void> {
  await del(projectKey(id));

  const index = (await get<ProjectMeta[]>(META_INDEX_KEY)) ?? [];
  const filtered = index.filter((m) => m.id !== id);
  await set(META_INDEX_KEY, filtered);
}

/** Rename a project. */
export async function renameProject(id: string, newName: string): Promise<void> {
  const data = await loadProject(id);
  if (!data) return;

  data.meta.name = newName;
  data.meta.updatedAt = new Date().toISOString();
  await saveProject(data);
}

/** Export project as downloadable JSON. */
export function exportProjectAsJson(data: ProjectData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.meta.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ftp`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import project from a JSON file. Returns parsed data or null. */
export async function importProjectFromFile(file: File): Promise<ProjectData | null> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ProjectData;

    // Structural validation
    if (
      !data.meta?.id ||
      !data.meta?.name ||
      !Array.isArray(data.tokens) ||
      !data.printSettings
    ) {
      return null;
    }

    // Validate each token has required fields
    const validTokens = data.tokens.every(
      (t) =>
        typeof t.id === 'string' &&
        typeof t.originalSrc === 'string' &&
        typeof t.sizeMm === 'number'
    );
    if (!validTokens) return null;

    // Sanitize meta name
    data.meta.name = data.meta.name.replace(/[<>]/g, '');

    return data;
  } catch {
    return null;
  }
}
