import type {
  GalleryCategory,
  GalleryPaginatedResponse,
} from '../types/index.ts';

const API_BASE = '/api';
const AUTH_TOKEN_KEY = 'admin_auth_token';

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new Error('Authentication expired');
  }

  return response;
}

export const adminApi = {
  async login(username: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json() as { token: string };
    setAuthToken(data.token);
    return data;
  },

  async getPending(page = 1, limit = 20): Promise<GalleryPaginatedResponse> {
    const response = await authFetch(
      `${API_BASE}/admin/pending?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pending images: ${response.statusText}`);
    }

    return response.json() as Promise<GalleryPaginatedResponse>;
  },

  async approve(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/approve/${encodeURIComponent(id)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to approve image: ${response.statusText}`);
    }
  },

  async reject(id: string, reviewNote?: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/reject/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewNote }),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject image: ${response.statusText}`);
    }
  },

  async deleteImage(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/gallery/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.statusText}`);
    }
  },

  async updateImage(
    id: string,
    updates: { name?: string; category?: GalleryCategory; tags?: string[] }
  ): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/gallery/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update image: ${response.statusText}`);
    }
  },

  async bulkApprove(ids: string[]): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/bulk-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk approve: ${response.statusText}`);
    }
  },

  async bulkReject(ids: string[], reviewNote?: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/admin/bulk-reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, reviewNote }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk reject: ${response.statusText}`);
    }
  },

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const response = await authFetch(`${API_BASE}/admin/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return response.json() as Promise<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>;
  },

  async setupAdmin(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Admin setup failed: ${response.statusText}`);
    }
  },

  logout(): void {
    clearAuthToken();
  },

  isAuthenticated(): boolean {
    return getAuthToken() !== null;
  },
};
