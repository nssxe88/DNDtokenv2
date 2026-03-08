import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get, set, del } from 'idb-keyval';
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
  renameProject,
  importProjectFromFile,
  type ProjectData,
  type ProjectMeta,
} from '../../services/projectStorage.ts';

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

describe('projectStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should return empty array when no projects exist', async () => {
      vi.mocked(get).mockResolvedValue(undefined);

      const projects = await listProjects();

      expect(projects).toEqual([]);
      expect(get).toHaveBeenCalledWith('project-index');
    });

    it('should return sorted projects by updatedAt desc', async () => {
      const mockProjects: ProjectMeta[] = [
        {
          id: 'p1',
          name: 'Project 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 5,
          thumbnailSrc: null,
        },
        {
          id: 'p2',
          name: 'Project 2',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
          tokenCount: 3,
          thumbnailSrc: null,
        },
        {
          id: 'p3',
          name: 'Project 3',
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          tokenCount: 8,
          thumbnailSrc: null,
        },
      ];

      vi.mocked(get).mockResolvedValue(mockProjects);

      const projects = await listProjects();

      expect(projects).toHaveLength(3);
      expect(projects[0].id).toBe('p2'); // Most recently updated
      expect(projects[1].id).toBe('p3');
      expect(projects[2].id).toBe('p1');
    });
  });

  describe('saveProject', () => {
    it('should save new project and update index', async () => {
      vi.mocked(get).mockResolvedValue(undefined);
      vi.mocked(set).mockResolvedValue(undefined);

      const projectData: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Test Project',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 2,
          thumbnailSrc: null,
        },
        tokens: [],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      await saveProject(projectData);

      expect(set).toHaveBeenCalledWith('project:p1', projectData);
      expect(set).toHaveBeenCalledWith('project-index', [projectData.meta]);
    });

    it('should update existing project in index', async () => {
      const existingMeta: ProjectMeta = {
        id: 'p1',
        name: 'Old Name',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        tokenCount: 1,
        thumbnailSrc: null,
      };

      vi.mocked(get).mockResolvedValue([existingMeta]);
      vi.mocked(set).mockResolvedValue(undefined);

      const updatedProject: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Updated Name',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          tokenCount: 5,
          thumbnailSrc: null,
        },
        tokens: [],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      await saveProject(updatedProject);

      expect(set).toHaveBeenCalledWith('project:p1', updatedProject);
      expect(set).toHaveBeenCalledWith('project-index', [updatedProject.meta]);
    });
  });

  describe('loadProject', () => {
    it('should return null when project does not exist', async () => {
      vi.mocked(get).mockResolvedValue(undefined);

      const project = await loadProject('nonexistent');

      expect(project).toBeNull();
      expect(get).toHaveBeenCalledWith('project:nonexistent');
    });

    it('should load existing project', async () => {
      const mockProject: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Test Project',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 0,
          thumbnailSrc: null,
        },
        tokens: [],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      vi.mocked(get).mockResolvedValue(mockProject);

      const project = await loadProject('p1');

      expect(project).toEqual(mockProject);
      expect(get).toHaveBeenCalledWith('project:p1');
    });
  });

  describe('deleteProject', () => {
    it('should delete project and remove from index', async () => {
      const mockIndex: ProjectMeta[] = [
        {
          id: 'p1',
          name: 'Project 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 0,
          thumbnailSrc: null,
        },
        {
          id: 'p2',
          name: 'Project 2',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          tokenCount: 0,
          thumbnailSrc: null,
        },
      ];

      vi.mocked(get).mockResolvedValue(mockIndex);
      vi.mocked(del).mockResolvedValue(undefined);
      vi.mocked(set).mockResolvedValue(undefined);

      await deleteProject('p1');

      expect(del).toHaveBeenCalledWith('project:p1');
      expect(set).toHaveBeenCalledWith('project-index', [mockIndex[1]]);
    });

    it('should handle empty index', async () => {
      vi.mocked(get).mockResolvedValue(undefined);
      vi.mocked(del).mockResolvedValue(undefined);
      vi.mocked(set).mockResolvedValue(undefined);

      await deleteProject('p1');

      expect(del).toHaveBeenCalledWith('project:p1');
      expect(set).toHaveBeenCalledWith('project-index', []);
    });
  });

  describe('renameProject', () => {
    it('should rename project and update timestamp', async () => {
      const mockProject: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Old Name',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 0,
          thumbnailSrc: null,
        },
        tokens: [],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      vi.mocked(get).mockImplementation((key) => {
        if (key === 'project:p1') return Promise.resolve(mockProject);
        if (key === 'project-index') return Promise.resolve([mockProject.meta]);
        return Promise.resolve(undefined);
      });
      vi.mocked(set).mockResolvedValue(undefined);

      await renameProject('p1', 'New Name');

      expect(set).toHaveBeenCalledWith(
        'project:p1',
        expect.objectContaining({
          meta: expect.objectContaining({
            name: 'New Name',
          }),
        })
      );
    });

    it('should not throw if project does not exist', async () => {
      vi.mocked(get).mockResolvedValue(null);

      await expect(renameProject('nonexistent', 'New Name')).resolves.not.toThrow();
    });
  });

  describe('importProjectFromFile', () => {
    it('should import valid project file', async () => {
      const validProject: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Imported Project',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 1,
          thumbnailSrc: null,
        },
        tokens: [
          {
            id: 't1',
            originalSrc: 'test.jpg',
            sizeMm: 25,
          } as never,
        ],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      const file = new File([JSON.stringify(validProject)], 'project.ftp', {
        type: 'application/json',
      });

      const result = await importProjectFromFile(file);

      expect(result).not.toBeNull();
      expect(result?.meta.name).toBe('Imported Project');
    });

    it('should reject invalid project structure', async () => {
      const invalidProject = {
        meta: { id: 'p1' }, // Missing required fields
        tokens: [],
      };

      const file = new File([JSON.stringify(invalidProject)], 'invalid.ftp', {
        type: 'application/json',
      });

      const result = await importProjectFromFile(file);

      expect(result).toBeNull();
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['invalid json {{{'], 'invalid.ftp', {
        type: 'application/json',
      });

      const result = await importProjectFromFile(file);

      expect(result).toBeNull();
    });

    it('should sanitize project name', async () => {
      const projectWithDangerousName: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Test<script>alert("xss")</script>',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 0,
          thumbnailSrc: null,
        },
        tokens: [],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      const file = new File([JSON.stringify(projectWithDangerousName)], 'test.ftp', {
        type: 'application/json',
      });

      const result = await importProjectFromFile(file);

      expect(result?.meta.name).not.toContain('<');
      expect(result?.meta.name).not.toContain('>');
    });

    it('should reject project with invalid tokens', async () => {
      const invalidTokenProject: ProjectData = {
        meta: {
          id: 'p1',
          name: 'Test',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          tokenCount: 1,
          thumbnailSrc: null,
        },
        tokens: [{ invalid: 'token' } as never],
        printSettings: {
          paperSize: 'a4',
          customPaperSize: null,
          orientation: 'portrait',
          margins: 10,
          spacing: 5,
          unit: 'mm',
          cutMarks: false,
          bleed: 0,
        },
      };

      const file = new File([JSON.stringify(invalidTokenProject)], 'test.ftp', {
        type: 'application/json',
      });

      const result = await importProjectFromFile(file);

      expect(result).toBeNull();
    });
  });
});
