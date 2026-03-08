import { useCallback, useRef, useState } from 'react';
import { Upload, ImagePlus } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

export function UploadPanel() {
  const { t } = useTranslation();
  const addToken = useStore((s) => s.addToken);
  const openCropModal = useStore((s) => s.openCropModal);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      let lastTokenId: string | null = null;
      let loadedCount = 0;
      const totalCount = imageFiles.length;

      for (const file of imageFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (src) {
            const token = addToken(file, src);
            lastTokenId = token.id;
          }
          loadedCount++;
          if (loadedCount === totalCount && lastTokenId) {
            openCropModal(lastTokenId);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [addToken, openCropModal]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">{t('upload.title')}</h3>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-primary-400 bg-primary-400/10'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
        }`}
      >
        <div className="rounded-full bg-slate-700 p-3">
          {isDragging ? (
            <Upload size={24} className="text-primary-400" />
          ) : (
            <ImagePlus size={24} className="text-slate-400" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300">
            {isDragging ? t('upload.dropHere') : t('upload.dragAndDrop')}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t('upload.orClickToBrowse')}</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-slate-500">
        {t('upload.supportedFormats')}
      </p>
    </div>
  );
}
