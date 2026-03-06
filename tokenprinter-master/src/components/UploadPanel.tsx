import { useRef } from 'react';
import { useTokenStore } from '../store/tokenStore';
import { processOriginalImage, createDefaultCroppedSrc, processFrameImage } from '../lib/imageProcessor';
import { ImagePlus, Images } from 'lucide-react';

export const UploadPanel = () => {
    const { addImages, addFrames } = useTokenStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const frameInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newTokens = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const origSrc = await processOriginalImage(file);
                const croppedSrc = await createDefaultCroppedSrc(origSrc);

                newTokens.push({
                    id: crypto.randomUUID(),
                    originalSrc: origSrc,
                    src: croppedSrc,
                    name: file.name,
                    preset: 'medium',
                    manualSizeMm: null,
                    count: 1,
                    selected: false,
                    cropEnabled: false, // Default to false based on user new rules (global handles it)
                    frameEnabled: false,
                    colorEnabled: false,
                    frameColor: null,
                    overlayEnabled: false
                });
            } catch (err) {
                console.error("Failed to process image", file.name, err);
            }
        }

        if (newTokens.length > 0) {
            addImages(newTokens);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFrameUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFrames = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const origSrc = await processOriginalImage(file);
                const processedSrc = await processFrameImage(origSrc);

                newFrames.push({
                    id: crypto.randomUUID(),
                    src: origSrc,
                    processedSrc: processedSrc,
                    saturatedSrc: processedSrc,
                    saturation: 100,
                    hue: 0,
                    name: file.name,
                    useForAll: false,
                    checked: false
                });
            } catch (err) {
                console.error("Failed to process frame", file.name, err);
            }
        }

        if (newFrames.length > 0) {
            addFrames(newFrames);
        }
        if (frameInputRef.current) frameInputRef.current.value = '';
    };

    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
            />
            <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                ref={frameInputRef}
                onChange={handleFrameUpload}
            />

            <button
                className="btn"
                style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleImageUpload({ target: { files: e.dataTransfer.files } } as any);
                    }
                }}
            >
                <ImagePlus size={18} />
                Upload Tokens
            </button>

            <button
                className="btn"
                style={{ flex: 1, backgroundColor: '#10b981', color: 'white' }}
                onClick={() => frameInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFrameUpload({ target: { files: e.dataTransfer.files } } as any);
                    }
                }}
            >
                <Images size={18} />
                Upload Frames
            </button>
        </div>
    );
};
