import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  LogOut,
  Check,
  XCircle,
  Trash2,
  Loader2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.ts';
import type { GalleryImage, GalleryPaginatedResponse } from '../../types/index.ts';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(adminApi.isAuthenticated());

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => { adminApi.logout(); setAuthenticated(false); }} />;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      if (needsSetup) {
        await adminApi.setupAdmin(username, password);
        toast.success('Admin account created! Please login.');
        setNeedsSetup(false);
      } else {
        await adminApi.login(username, password);
        onLogin();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-slate-800 p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <Shield size={32} className="text-primary-400" />
          <h1 className="text-xl font-bold text-white">
            {needsSetup ? 'Create Admin Account' : 'Admin Login'}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={needsSetup ? 'Password (min 8 characters)' : 'Password'}
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {needsSetup ? 'Create Account' : 'Login'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setNeedsSetup(!needsSetup)}
          className="mt-4 w-full text-center text-xs text-slate-400 hover:text-primary-400"
        >
          {needsSetup ? 'Already have an account? Login' : 'First time? Create admin account'}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } | null>(null);
  const [pending, setPending] = useState<GalleryPaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectNoteId, setRejectNoteId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPending(page, 20),
      ]);
      setStats(s);
      setPending(p);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication')) {
        onLogout();
      }
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approve(id);
      toast.success('Approved');
      fetchData();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNote.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await adminApi.reject(id, rejectNote);
      toast.success('Rejected');
      setRejectNoteId(null);
      setRejectNote('');
      fetchData();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteImage(id);
      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    try {
      await adminApi.bulkApprove([...selectedIds]);
      toast.success(`Approved ${selectedIds.size} images`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error('Failed to bulk approve');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    const note = prompt('Enter rejection reason:');
    if (!note) return;
    try {
      await adminApi.bulkReject([...selectedIds], note);
      toast.success(`Rejected ${selectedIds.size} images`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error('Failed to bulk reject');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!pending) return;
    if (selectedIds.size === pending.images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pending.images.map((i) => i.id)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-primary-400" />
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-slate-400 hover:text-white">
              Back to Editor
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} icon={<BarChart3 size={20} />} />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Loader2 size={20} />}
              color="text-yellow-400"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={<Check size={20} />}
              color="text-green-400"
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={<XCircle size={20} />}
              color="text-red-400"
            />
          </div>
        )}

        {/* Pending submissions */}
        <div className="rounded-xl bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Pending Submissions ({pending?.total ?? 0})
            </h2>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
                >
                  <Check size={14} />
                  Approve {selectedIds.size}
                </button>
                <button
                  onClick={handleBulkReject}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                >
                  <XCircle size={14} />
                  Reject {selectedIds.size}
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
          )}

          {!loading && (!pending || pending.images.length === 0) && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
              <ImageOff size={40} />
              <span>No pending submissions</span>
            </div>
          )}

          {!loading && pending && pending.images.length > 0 && (
            <>
              {/* Select all */}
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === pending.images.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                <span className="text-xs text-slate-400">Select all</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pending.images.map((img) => (
                  <PendingCard
                    key={img.id}
                    image={img}
                    selected={selectedIds.has(img.id)}
                    showRejectInput={rejectNoteId === img.id}
                    rejectNote={rejectNote}
                    onToggleSelect={() => toggleSelect(img.id)}
                    onApprove={() => handleApprove(img.id)}
                    onStartReject={() => {
                      setRejectNoteId(img.id);
                      setRejectNote('');
                    }}
                    onReject={() => handleReject(img.id)}
                    onCancelReject={() => setRejectNoteId(null)}
                    onRejectNoteChange={setRejectNote}
                    onDelete={() => handleDelete(img.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pending.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-slate-400">
                    Page {page} of {pending.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pending.totalPages, p + 1))}
                    disabled={page >= pending.totalPages}
                    className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'text-slate-400',
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function PendingCard({
  image,
  selected,
  showRejectInput,
  rejectNote,
  onToggleSelect,
  onApprove,
  onStartReject,
  onReject,
  onCancelReject,
  onRejectNoteChange,
  onDelete,
}: {
  image: GalleryImage;
  selected: boolean;
  showRejectInput: boolean;
  rejectNote: string;
  onToggleSelect: () => void;
  onApprove: () => void;
  onStartReject: () => void;
  onReject: () => void;
  onCancelReject: () => void;
  onRejectNoteChange: (v: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border transition-colors ${
        selected ? 'border-primary-400 bg-slate-700' : 'border-slate-700 bg-slate-700/50'
      }`}
    >
      <div className="relative">
        <img
          src={image.thumbnailUrl}
          alt={image.name}
          className="h-40 w-full object-cover"
        />
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="absolute left-2 top-2 rounded"
        />
      </div>

      <div className="p-3">
        <h3 className="font-medium text-white">{image.name}</h3>
        <p className="text-xs text-slate-400">
          {image.category} &middot; {image.tags.join(', ') || 'No tags'}
        </p>
        <p className="text-xs text-slate-500">
          By {image.uploaderName} &middot;{' '}
          {new Date(image.uploadedAt).toLocaleDateString()}
        </p>

        {showRejectInput ? (
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={rejectNote}
              onChange={(e) => onRejectNoteChange(e.target.value)}
              placeholder="Rejection reason..."
              className="rounded bg-slate-600 px-2 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={onReject}
                className="flex-1 rounded bg-red-600 py-1 text-xs text-white hover:bg-red-500"
              >
                Confirm Reject
              </button>
              <button
                onClick={onCancelReject}
                className="rounded bg-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-1">
            <button
              onClick={onApprove}
              className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500"
            >
              <Check size={12} />
              Approve
            </button>
            <button
              onClick={onStartReject}
              className="flex items-center gap-1 rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-500"
            >
              <XCircle size={12} />
              Reject
            </button>
            <button
              onClick={onDelete}
              className="ml-auto rounded p-1 text-slate-400 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
