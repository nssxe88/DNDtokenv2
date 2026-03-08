import { useState, useRef } from 'react';
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import type { GalleryCategory } from '../../types/index.ts';
import toast from 'react-hot-toast';

const CATEGORIES: { value: GalleryCategory; label: string }[] = [
  { value: 'creature', label: 'Creature' },
  { value: 'humanoid', label: 'Humanoid' },
  { value: 'undead', label: 'Undead' },
  { value: 'environment', label: 'Environment' },
  { value: 'item', label: 'Item' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'effect', label: 'Effect' },
  { value: 'other', label: 'Other' },
];

export function GalleryUploadModal() {
  const { galleryUploadModalOpen, setGalleryUploadModalOpen, uploadToGallery } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('creature');
  const [tagsInput, setTagsInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!galleryUploadModalOpen) return null;

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
    if (!name) {
      setName(selected.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      handleFileSelect(dropped);
    }
  };

  const handleSubmit = async () => {
    if (!file || !name.trim()) {
      toast.error('Please select an image and enter a name');
      return;
    }

    setUploading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await uploadToGallery({
        image: file,
        name: name.trim(),
        category,
        tags,
        isPrivate,
      });

      toast.success(
        isPrivate ? 'Image uploaded as private' : 'Image submitted for review'
      );
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('creature');
    setTagsInput('');
    setIsPrivate(false);
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleClose = () => {
    resetForm();
    setGalleryUploadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Upload to Gallery</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {/* File picker / preview */}
          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-600 p-8 text-slate-400 transition-colors hover:border-primary-400 hover:text-primary-400"
            >
              <ImagePlus size={32} />
              <span className="text-sm">Click or drop an image here</span>
              <span className="text-xs">PNG, JPG, WebP (max 10MB)</span>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="h-48 w-full rounded-lg object-contain bg-slate-900"
              />
              <button
                onClick={() => {
                  setFile(null);
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-slate-800/80 p-1 text-slate-300 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Red Dragon"
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Tags (comma-separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. dragon, fire, boss"
              className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>

          {/* Privacy toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative h-5 w-9 rounded-full transition-colors ${
                isPrivate ? 'bg-primary-600' : 'bg-slate-600'
              }`}
              onClick={() => setIsPrivate(!isPrivate)}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isPrivate ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-slate-300">
              {isPrivate ? 'Private — only you can see it' : 'Public — visible after admin approval'}
            </span>
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!file || !name.trim() || uploading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
