import { useEffect, useState, useCallback } from 'react';
import { Search, Upload, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import type { GalleryCategory, GalleryImage } from '../../types/index.ts';

const CATEGORIES: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'creature', label: 'Creatures' },
  { id: 'humanoid', label: 'Humanoids' },
  { id: 'undead', label: 'Undead' },
  { id: 'environment', label: 'Environment' },
  { id: 'item', label: 'Items' },
  { id: 'vehicle', label: 'Vehicles' },
  { id: 'effect', label: 'Effects' },
  { id: 'other', label: 'Other' },
];

export function GalleryPanel() {
  const {
    galleryImages,
    galleryLoading,
    galleryError,
    gallerySearchQuery,
    galleryActiveCategory,
    gallerySort,
    galleryPage,
    galleryTotalPages,
    fetchGalleryImages,
    setGallerySearchQuery,
    setGalleryActiveCategory,
    setGallerySort,
    setGalleryPage,
    setGalleryUploadModalOpen,
    useGalleryImage,
    myUploads,
    myUploadsLoading,
    fetchMyUploads,
    deleteMyUpload,
  } = useStore();

  const [tab, setTab] = useState<'browse' | 'my-uploads'>('browse');
  const [searchInput, setSearchInput] = useState(gallerySearchQuery);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages, galleryActiveCategory, gallerySort, galleryPage]);

  useEffect(() => {
    if (tab === 'my-uploads') fetchMyUploads();
  }, [tab, fetchMyUploads]);

  const handleSearch = useCallback(() => {
    setGallerySearchQuery(searchInput);
    fetchGalleryImages();
  }, [searchInput, setGallerySearchQuery, fetchGalleryImages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-slate-700/50 p-1">
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'browse' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Browse Gallery
        </button>
        <button
          onClick={() => setTab('my-uploads')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === 'my-uploads' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Uploads
        </button>
      </div>

      {/* Upload button */}
      <button
        onClick={() => setGalleryUploadModalOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500"
      >
        <Upload size={16} />
        Upload to Gallery
      </button>

      {tab === 'browse' ? (
        <BrowseView
          images={galleryImages}
          loading={galleryLoading}
          error={galleryError}
          searchInput={searchInput}
          activeCategory={galleryActiveCategory}
          sort={gallerySort}
          page={galleryPage}
          totalPages={galleryTotalPages}
          onSearchInput={setSearchInput}
          onSearch={handleSearch}
          onSearchKeyDown={handleKeyDown}
          onCategoryChange={setGalleryActiveCategory}
          onSortChange={setGallerySort}
          onPageChange={setGalleryPage}
          onUseImage={useGalleryImage}
        />
      ) : (
        <MyUploadsView
          uploads={myUploads}
          loading={myUploadsLoading}
          onDelete={deleteMyUpload}
        />
      )}
    </div>
  );
}

function BrowseView({
  images,
  loading,
  error,
  searchInput,
  activeCategory,
  sort,
  page,
  totalPages,
  onSearchInput,
  onSearch,
  onSearchKeyDown,
  onCategoryChange,
  onSortChange,
  onPageChange,
  onUseImage,
}: {
  images: GalleryImage[];
  loading: boolean;
  error: string | null;
  searchInput: string;
  activeCategory: GalleryCategory | null;
  sort: 'newest' | 'popular';
  page: number;
  totalPages: number;
  onSearchInput: (v: string) => void;
  onSearch: () => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onCategoryChange: (c: GalleryCategory | null) => void;
  onSortChange: (s: 'newest' | 'popular') => void;
  onPageChange: (p: number) => void;
  onUseImage: (img: GalleryImage) => void;
}) {
  return (
    <>
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search images..."
            className="w-full rounded-lg bg-slate-700 py-1.5 pl-8 pr-3 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </div>
        <button
          onClick={onSearch}
          className="rounded-lg bg-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-600"
        >
          Go
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id === 'all' ? null : cat.id)}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              (cat.id === 'all' && !activeCategory) || activeCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Sort:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as 'newest' | 'popular')}
          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/30 p-3 text-sm text-red-300">{error}</div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
          <ImageOff size={32} />
          <span className="text-sm">No images found</span>
        </div>
      )}

      {!loading && images.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <GalleryThumbnail key={img.id} image={img} onUse={onUseImage} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded p-1 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function GalleryThumbnail({
  image,
  onUse,
}: {
  image: GalleryImage;
  onUse: (img: GalleryImage) => void;
}) {
  return (
    <button
      onClick={() => onUse(image)}
      className="group relative aspect-square overflow-hidden rounded-lg bg-slate-700"
      title={`${image.name}\nClick to use as token`}
    >
      <img
        src={image.thumbnailUrl}
        alt={image.name}
        className="h-full w-full object-cover transition-transform group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <span className="w-full truncate px-1.5 pb-1.5 text-xs text-white">{image.name}</span>
      </div>
    </button>
  );
}

function MyUploadsView({
  uploads,
  loading,
  onDelete,
}: {
  uploads: GalleryImage[];
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
        <ImageOff size={32} />
        <span className="text-sm">No uploads yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {uploads.map((img) => (
        <div key={img.id} className="flex items-center gap-3 rounded-lg bg-slate-700/50 p-2">
          <img
            src={img.thumbnailUrl}
            alt={img.name}
            className="h-12 w-12 rounded object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm text-slate-200">{img.name}</p>
            <StatusBadge status={img.status} />
            {img.reviewNote && (
              <p className="mt-0.5 truncate text-xs text-slate-400">{img.reviewNote}</p>
            )}
          </div>
          {(img.status === 'pending' || img.isPrivate) && (
            <button
              onClick={() => onDelete(img.id)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/30"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-900/40 text-yellow-300',
    approved: 'bg-green-900/40 text-green-300',
    rejected: 'bg-red-900/40 text-red-300',
  };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[status] || ''}`}>
      {status}
    </span>
  );
}
