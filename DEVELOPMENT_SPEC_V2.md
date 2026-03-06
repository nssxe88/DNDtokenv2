# Fantasy Token Printer v2.0 — Full Development Specification

> **Project:** DnD Tabletop RPG Token Creator & Editor
> **URL:** https://token.mandostudio.hu
> **Current Version:** v5.6 (legacy codebase to be fully rewritten)
> **Target Version:** v2.0 (complete rewrite)
> **Language:** English (technical spec for Claude Code)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis (v5.6)](#2-current-state-analysis-v56)
3. [Technology Stack (v2.0)](#3-technology-stack-v20)
4. [Architecture Overview](#4-architecture-overview)
5. [Canvas Engine Decision](#5-canvas-engine-decision)
6. [Backend vs. Frontend-Only Decision](#6-backend-vs-frontend-only-decision)
7. [Feature Specification](#7-feature-specification)
8. [Data Models & State Management](#8-data-models--state-management)
9. [Component Architecture](#9-component-architecture)
10. [File & Folder Structure](#10-file--folder-structure)
11. [UI/UX Design System](#11-uiux-design-system)
12. [Export & Print Pipeline](#12-export--print-pipeline)
13. [Built-in Token Asset Library](#13-built-in-token-asset-library)
14. [Image Positioning & Cropping System](#14-image-positioning--cropping-system)
15. [Community Gallery & Admin System](#15-community-gallery--admin-system)
16. [Backend Architecture](#16-backend-architecture)
17. [Monetization — Google AdSense Integration](#17-monetization--google-adsense-integration)
18. [Performance & Optimization](#18-performance--optimization)
19. [Testing Strategy](#19-testing-strategy)
20. [Deployment & Build](#20-deployment--build)
21. [Migration Plan from v5.6](#21-migration-plan-from-v56)
22. [Development Phases & Milestones](#22-development-phases--milestones)

---

## 1. Executive Summary

Fantasy Token Printer v2.0 is a complete rewrite of the existing token printing tool. The goal is to transform a basic "upload → arrange → print PDF" workflow into a fully-featured **visual token editor** with canvas-based drag & drop editing, a built-in asset library (frames, borders, textures), an image positioning/cropping popup, a community gallery system, and professional export capabilities.

### Primary Use Case
**Mass-printing physical DnD tokens** — Users upload character/creature artwork, customize with decorative frames and borders, arrange efficiently on paper (A4/A3/Letter), and print or export as PDF/PNG. The tokens are then cut out and used as physical game pieces on a tabletop battle map.

### Key Goals
- **Canvas-based visual editor** with real-time manipulation (drag, resize, rotate, layers)
- **Built-in token asset library** with pre-made decorative frames, borders, textures, and DnD-themed ornaments
- **Image positioning/cropping popup** — When adding an image to a token, a modal opens where the user can pan, zoom, and position the uploaded image within the token shape (circle/square/hex)
- **Community gallery** — Users can browse and use images uploaded by other users, with privacy controls and admin approval workflow
- **Optimized batch workflow** for efficiently creating and arranging large quantities of tokens for printing
- **All existing v5.6 features preserved** (upload, crop, frame, overlay, PDF/PNG export, print layout)
- **Modern architecture** with TypeScript strict mode, clean component boundaries, and extensibility
- **Frontend SPA + lightweight backend** — Frontend handles all editing/export; backend handles gallery, user uploads, and admin approval (see Sections 15–16)

### What This App is NOT
- ❌ NOT a Virtual Tabletop (VTT) — no HP/AC tracking, no initiative, no gameplay mechanics
- ❌ NOT a digital token viewer — the output is physical printed paper
- ❌ NOT a character sheet tool — no stats, no abilities, no game rules
- ❌ NOT a text/label tool — no character names, no badges, no text overlays on tokens (these are useless on printed tokens)
- ✅ IS a professional token PRINTER with rich visual customization and a community gallery

---

## 2. Current State Analysis (v5.6)

### 2.1 Current Tech Stack
| Component | Technology |
|-----------|-----------|
| Framework | React 19.2 |
| Language | TypeScript |
| Build Tool | Vite 7.3 |
| State Management | Zustand 5.0 |
| Canvas | Konva.js 10.2 + react-konva 19.2 (declared in deps but NOT used in code) |
| PDF Generation | jsPDF 4.2 |
| ZIP Export | JSZip 3.10 + file-saver 2.0 |
| Icons | lucide-react 0.577 |
| Bundle | vite-plugin-singlefile (single HTML output) |

### 2.2 Current Features
1. **Token Upload** — Multi-file image upload with drag & drop support
2. **Frame/Overlay Upload** — Separate upload for overlay frames with hue/saturation controls
3. **Token Settings** — Per-token size (mm/inch), count, crop toggle, frame toggle, custom color, overlay toggle
4. **Global Settings** — Shape (circle/square), CUT frame (mm), Frame thickness (mm), color picker, unit toggle
5. **Print Settings** — Paper size (A4/Letter/A3), gap between tokens, page margin
6. **Print Preview** — Real-time canvas preview with zoom control, multi-page support
7. **MaxRects Bin Packing** — Custom layout engine for optimal token placement on pages
8. **PDF Export** — Direct PDF generation with jsPDF (accurate mm measurements)
9. **PNG Export** — Individual token export as ZIP with configurable resolution (256–2048px)
10. **DnD Size Presets** — Tiny (12mm), Small (20mm), Medium (20mm), Large (40mm), Huge (65mm), Gargantuan (90mm)

### 2.3 Current Code Issues & Limitations
- **No actual Konva usage** — react-konva is in package.json but all rendering uses raw HTML5 Canvas API
- **Heavy inline styles** — Almost zero CSS classes; everything is inline `style={{}}` objects
- **No component separation** — Token rendering logic duplicated across PrintPreview, pdfExporter, and TokenSaveModal
- **No undo/redo** — State changes are immediate and irreversible
- **No drag & drop on canvas** — Preview is read-only; no interactive manipulation
- **No asset library** — Every frame/overlay must be manually uploaded
- **No image positioning** — Cannot adjust image placement within the token shape
- **No project save/load** — Work is lost on page refresh
- **No responsive design** — Fixed 520px sidebar, hardcoded widths

---

## 3. Technology Stack (v2.0)

### 3.1 Core Stack (Confirmed)
| Component | Technology | Version | Reason |
|-----------|-----------|---------|--------|
| **Framework** | React | 19.x | User requirement; excellent ecosystem |
| **Language** | TypeScript (strict mode) | 5.9+ | User requirement; type safety |
| **Build Tool** | Vite | 7.x | User requirement; fast DX, proven in v5.6 |
| **Canvas Engine** | **Konva.js + react-konva** | 10.x / 19.x | See Section 5 for decision rationale |
| **State Management** | Zustand | 5.x | Already proven in v5.6; lightweight, flexible |
| **Styling** | Tailwind CSS 4.x | 4.x | Utility-first; replaces inline styles |
| **PDF Export** | jsPDF | 4.x | Proven in v5.6; mm-accurate output |
| **ZIP Export** | JSZip + file-saver | 3.x / 2.x | Proven in v5.6 |
| **Icons** | lucide-react | latest | Already used; comprehensive icon set |
| **Routing** | React Router | 7.x | For multi-page layout (editor, library, settings) |
| **DnD (Drag & Drop)** | Built into Konva | — | Native object dragging on canvas |

### 3.2 New Dependencies
| Package | Purpose |
|---------|---------|
| `@tailwindcss/vite` | Tailwind CSS Vite integration |
| `immer` | Immutable state updates for complex nested state |
| `zustand/middleware` | Undo/redo middleware, persist middleware |
| `react-colorful` | Lightweight color picker component |
| `react-hot-toast` | Toast notifications |
| `uuid` | Stable unique IDs (instead of crypto.randomUUID for SSR compat) |
| `idb-keyval` | IndexedDB wrapper for project persistence |
| `axios` or `ky` | HTTP client for gallery API communication |

### 3.3 Dev Dependencies
| Package | Purpose |
|---------|---------|
| `vitest` | Unit testing |
| `@testing-library/react` | Component testing |
| `playwright` | E2E testing |
| `eslint-config-prettier` | Code formatting |
| `prettier` | Code formatting |
| `prettier-plugin-tailwindcss` | Tailwind class sorting |

---

## 4. Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React App Shell                       │
│  ┌─────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ Sidebar  │  │  Canvas Editor   │  │  Asset Library     │  │
│  │ Panel    │  │  (Konva Stage)   │  │  (Modal/Panel)     │  │
│  │          │  │                  │  │                    │  │
│  │ • Tokens │  │  • Token Layer   │  │  • Frames          │  │
│  │ • Props  │  │  • Overlay Layer │  │  • Borders         │  │
│  │ • Export │  │  • Guide Layer   │  │  • Textures        │  │
│  │ • Print  │  │                  │  │  • Community Imgs  │  │
│  └─────────┘  └──────────────────┘  └────────────────────┘  │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              │     Zustand Store       │                     │
│              │  ┌───────────────────┐  │                     │
│              │  │ tokenSlice        │  │                     │
│              │  │ editorSlice       │  │                     │
│              │  │ librarySlice      │  │                     │
│              │  │ gallerySlice      │  │                     │
│              │  │ printSlice        │  │                     │
│              │  │ historySlice      │  │                     │
│              │  │ projectSlice      │  │                     │
│              │  └───────────────────┘  │                     │
│              └─────────────────────────┘                     │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │                   Service Layer                        │   │
│  │  • ImageProcessor  • LayoutEngine  • PDFExporter      │   │
│  │  • PNGExporter     • ProjectIO     • AssetManager     │   │
│  │  • GalleryAPI      • AdminAPI      • AuthService      │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow

```
User Action → Zustand Action → State Update → React Re-render → Konva Canvas Update
                                    │
                                    ├─→ History Stack (undo/redo)
                                    └─→ Auto-save to IndexedDB (debounced)
```

### 4.3 Module Boundaries

| Module | Responsibility | Depends On |
|--------|---------------|------------|
| `store/` | State management, slices, middleware | zustand, immer |
| `canvas/` | Konva components, layers, transformers | react-konva, store |
| `components/` | UI panels, forms, modals, dialogs | React, store |
| `services/` | Image processing, PDF/PNG export, layout | jsPDF, JSZip |
| `library/` | Asset catalog, categories, search | store |
| `api/` | Gallery API, admin API, auth | axios/ky, backend |
| `types/` | TypeScript interfaces and type definitions | — |
| `utils/` | Pure utility functions (mm↔px, color, math) | — |
| `hooks/` | Custom React hooks | React, store |
| `assets/` | Static assets (built-in frames, icons, fonts) | — |

---

## 5. Canvas Engine Decision

### 5.1 Comparison Matrix

| Criteria | **Konva.js** | Fabric.js | PixiJS |
|----------|:----------:|:---------:|:------:|
| React integration | ✅ react-konva (first-class) | ❌ Wrapper needed | ❌ Wrapper needed |
| Object manipulation (drag/resize/rotate) | ✅ Built-in Transformer | ✅ Built-in controls | ❌ Manual implementation |
| Layer management | ✅ Native Layer/Group | ⚠️ Object z-index | ❌ Container hierarchy |
| Event system | ✅ Per-node events | ✅ Per-object events | ✅ Per-display-object |
| Text rendering | ✅ Good (Text node) | ✅ Excellent (IText) | ⚠️ Basic |
| Image filters | ✅ Built-in filters | ✅ Built-in filters | ✅ WebGL filters |
| Export to image | ✅ stage.toDataURL() | ✅ canvas.toDataURL() | ✅ renderer.extract |
| Performance (100+ objects) | ✅ Good | ⚠️ Moderate | ✅ Excellent (WebGL) |
| Bundle size | ~150KB | ~300KB | ~200KB |
| Learning curve | Low (React-like) | Medium | High |
| Already in project | ✅ In package.json | ❌ | ❌ |
| Community/maintenance | ✅ Active | ✅ Active | ✅ Active |

### 5.2 Decision: **Konva.js + react-konva**

**Rationale:**
1. **Already a dependency** — Konva and react-konva are already in package.json (just unused)
2. **Best React integration** — react-konva provides declarative JSX syntax for canvas objects; components like `<Circle>`, `<Image>`, `<Text>`, `<Transformer>` map directly to React's mental model
3. **Built-in Transformer** — The `<Transformer>` component provides drag, resize, and rotate handles out of the box — the exact UX needed for token editing
4. **Layer system** — Native `<Layer>` and `<Group>` components map perfectly to the token editor's needs (token layer, overlay layer, text layer, guide layer)
5. **Good enough performance** — For a token editor (typically 1–50 objects), Konva's Canvas 2D performance is more than sufficient; WebGL (PixiJS) is overkill
6. **Export compatibility** — `stage.toDataURL()` and `stage.toCanvas()` integrate seamlessly with the existing jsPDF pipeline

---

## 6. Architecture Decision: Frontend SPA + Lightweight Backend

### 6.1 Decision: **Hybrid Architecture**

**The token editor** (canvas, frames, overlays, export, PDF generation) is a **pure frontend SPA** — all editing operations happen in the browser, offline-capable.

**The community gallery** requires a **lightweight backend** — image storage, moderation queue, admin approval, and serving gallery content to all users.

**Rationale for hybrid approach:**
- The editor is a **creative tool** — local image manipulation must be fast and work offline
- **IndexedDB** provides project save/load persistence (up to hundreds of MB)
- The gallery is a **shared community resource** — requires server-side storage, moderation, and serving images to all visitors
- Admin approval workflow requires server-side state management
- Separating editor (client-only) from gallery (client+server) keeps the architecture clean

### 6.2 What Runs Where

| Feature | Frontend (Browser) | Backend (Server) |
|---------|:-----------------:|:----------------:|
| Token editing (canvas, drag, resize) | ✅ | — |
| Frame/overlay application | ✅ | — |
| Image positioning/cropping | ✅ | — |
| PDF/PNG export | ✅ | — |
| Print layout engine | ✅ | — |
| Project save/load | ✅ (IndexedDB) | — |
| Built-in asset library | ✅ (bundled) | — |
| Gallery browsing & search | ✅ (UI) | ✅ (API + storage) |
| Image upload to gallery | ✅ (UI) | ✅ (storage + processing) |
| Admin approval panel | ✅ (UI) | ✅ (auth + moderation) |

### 6.3 Service Layer Architecture
All data access goes through a **service layer** with interfaces:
- `IProjectStorage` — Default: IndexedDB; could swap to cloud sync
- `IAssetProvider` — Default: bundled static assets; also fetches from gallery API
- `IGalleryService` — REST API client for gallery operations
- `IAdminService` — REST API client for admin operations
- Asset URLs are configurable (local bundled vs. CDN vs. API)

---

## 7. Feature Specification

### 7.1 Feature Matrix (Priority Order)

| # | Feature | Priority | New/Existing | Complexity |
|---|---------|----------|:------------:|:----------:|
| 1 | Token Image Upload (multi-file, drag & drop) | P0 | Existing | Low |
| 2 | Canvas-based Token Preview (Konva) | P0 | **New** | High |
| 3 | Token Manipulation (drag, resize, rotate) | P0 | **New** | High |
| 4 | Shape Masking (circle, square, hexagon) | P0 | Enhanced | Medium |
| 5 | Frame/Border System (thickness, color, style) | P0 | Enhanced | Medium |
| 6 | Overlay System (upload + apply) | P0 | Existing | Medium |
| 7 | Print Layout Engine (MaxRects bin packing) | P0 | Existing | Low (port) |
| 8 | PDF Export (mm-accurate, print-optimized) | P0 | Existing | Low (port) |
| 9 | PNG Export (ZIP, configurable resolution) | P0 | Existing | Low (port) |
| 10 | DnD Size Presets (Tiny → Gargantuan) | P0 | Existing | Low |
| 11 | **Built-in Asset Library** (frames, borders, textures) | P1 | **New** | High |
| 12 | **Image Positioning/Cropping Popup** | P0 | **New** | Medium |
| 13 | **Cut Marks & Print Guides** | P1 | **New** | Medium |
| 14 | Layer Management (z-order, visibility, lock) | P1 | **New** | Medium |
| 15 | Undo/Redo (full history stack) | P1 | **New** | Medium |
| 16 | Project Save/Load (IndexedDB) | P1 | **New** | Medium |
| 17 | **Batch Print Workflow** (select all → configure → print) | P1 | **New** | Medium |
| 18 | Image Filters (brightness, contrast, saturation, hue) | P2 | Enhanced | Medium |
| 19 | Custom Shape Masks (polygon editor) | P2 | **New** | High |
| 20 | Batch Operations (apply frame/overlay to all) | P2 | Enhanced | Medium |
| 21 | Keyboard Shortcuts | P2 | **New** | Low |
| 22 | **Community Image Gallery** (browse, search, use shared images) | P1 | **New** | High |
| 23 | **Admin Approval Panel** (review, approve/reject gallery submissions) | P1 | **New** | Medium |
| 24 | **Privacy Toggle** (mark uploads as private before submitting) | P1 | **New** | Low |
| 25 | **Token Sheet Templates** (pre-configured sheets: "20× Medium", "Mixed Party") | P2 | **New** | Medium |
| 26 | **Encounter Quick-Print** (paste D&D Beyond encounter URL → auto-generate token sheet) | P3 | **New** | High |
| 27 | **Background Removal** (AI/ML auto-remove background from uploaded images) | P2 | **New** | Medium |
| 28 | **Color Tinting** (tint entire token image for team-based coloring: red enemies, blue allies) | P2 | **New** | Low |
| 29 | **Token Back Side** (design a reverse side for double-sided printing: "bloodied", NPC info) | P3 | **New** | High |
| 30 | **Print History** (remember last-printed configurations for quick reprints) | P2 | **New** | Low |
| 31 | **Multi-Shape per Sheet** (mix circles and squares on the same print page) | P2 | **New** | Medium |
| 32 | Import from URL (paste image link) | P3 | **New** | Low |
| 33 | **Favorites / Collections** (save favorite gallery images for quick access) | P2 | **New** | Low |
| 34 | Dark Mode | P3 | **New** | Low |
| 35 | Responsive/Mobile Layout | P3 | **New** | Medium |

### 7.2 Feature Details

#### 7.2.1 Canvas-Based Token Editor (P0)

The heart of v2.0. Replace the read-only canvas preview with a fully interactive Konva Stage.

**Requirements:**
- Each token is a **Konva Group** containing: Image node, Frame/border shape, Overlay image
- **Selection** — Click to select a token; selection shows transform handles (resize + rotate)
- **Multi-select** — Shift+click or drag-selection box for multiple tokens
- **Drag** — Move tokens freely on canvas in "Edit Mode"
- **Resize** — Corner handles to resize proportionally; edge handles for free resize
- **Rotate** — Rotation handle above the token
- **Snap to grid** — Optional snap-to-grid (1mm increments) with visual grid overlay
- **Zoom & Pan** — Mouse wheel zoom + drag to pan (or dedicated zoom controls)
- **Two modes:**
  - **Edit Mode** — Free canvas, drag tokens anywhere, edit individual tokens
  - **Print Layout Mode** — Automatic bin-packing layout (existing MaxRects engine), read-only arrangement

**Konva Component Structure:**
```tsx
<Stage>
  <Layer name="background">
    {/* Paper rectangle, margin guides, grid */}
  </Layer>
  <Layer name="tokens">
    {tokens.map(token => (
      <TokenGroup key={token.id} token={token}>
        {/* Image, Frame, Overlay, Text — all as Konva nodes */}
      </TokenGroup>
    ))}
  </Layer>
  <Layer name="guides">
    {/* Snap lines, alignment guides, selection box */}
  </Layer>
  <Layer name="ui">
    {/* Transformer for selected tokens */}
    <Transformer />
  </Layer>
</Stage>
```

#### 7.2.2 Built-in Asset Library (P1)

A categorized, searchable collection of pre-made assets bundled with the application.

**Categories:**
| Category | Description | Examples |
|----------|------------|---------|
| **Frames** | Decorative borders that wrap around the token | Gold ornate, stone, wooden, elvish, dwarven, infernal |
| **Borders** | Simple geometric borders | Solid, dashed, double-line, gradient |
| **Textures** | Background textures/patterns | Parchment, leather, stone, metal, wood grain |
| **DnD Icons** | Class/race/status icons | Sword (fighter), staff (wizard), skull (undead), shield (paladin) |
| **Color Rings** | Solid color identification rings | Party colors, enemy indicators, NPC markers |
| **Community** | User-uploaded images from the gallery | Shared creature art, character portraits |

**Implementation:**
- Assets stored as optimized SVG/PNG files in `/src/assets/library/`
- Manifest file (`library-manifest.json`) with metadata: category, name, tags, preview thumbnail
- Assets are lazy-loaded; thumbnails are inlined as base64 in the manifest
- Search by name and tags
- Each asset has a `type` field: `frame`, `border`, `texture`, `icon`, `ring`
- User can apply any library asset to a token with one click
- User-uploaded frames are treated the same way (stored in "My Uploads" category)

**Asset Application Logic:**
```
frame → Rendered BEHIND the token image, sized to include the border area
border → Rendered as a Konva shape (Ring, Rect, etc.) ON TOP of the image
texture → Rendered AS the background BEHIND the token image (with opacity control)
icon → Rendered as a small overlay at a configurable position (corner, center)
ring → Rendered as a colored circle/square border around the entire token
```

#### 7.2.3 Image Positioning & Cropping Popup (P0)

When a user uploads an image to create a token, a **modal popup** opens allowing them to precisely position and crop the image within the token shape. This is critical for ensuring the right part of the artwork appears in the final printed token.

> **Design Principle:** Users upload artwork of varying sizes and aspect ratios. The token shape (circle/square/hex) acts as a "window" through which the user can see a portion of the image. The user must be able to pan, zoom, and position the image so the desired part shows through the token shape.

**Popup Features:**
- **Token shape preview** — The modal displays the token shape (circle/square/hex) as a mask/viewport, with the uploaded image behind it
- **Image pan** — Click and drag to move the image behind the token shape window
- **Image zoom** — Scroll wheel or pinch-to-zoom to scale the image up/down
- **Image rotate** — Optional rotation handle to correct image orientation
- **Reset button** — Reset to auto-fit (image centered and scaled to fill the token shape)
- **Confirm / Cancel** — "Apply" saves the positioning, "Cancel" uses default auto-fit
- **Real-time preview** — The token shape mask shows exactly what will appear on the printed token
- **Aspect ratio lock** — Image always scales proportionally (no stretching)

**UX Flow:**
```
1. User uploads image(s) via drag & drop or file picker
2. For EACH uploaded image, the positioning popup opens
3. Image is initially auto-fitted (centered, scaled to fill the shape)
4. User can adjust position/zoom/rotation
5. User clicks "Apply" → token is created with saved transform
6. User can re-open the positioning popup later via a button on the token card
```

**Technical Implementation:**
```typescript
interface ImageCropTransform {
  offsetX: number;     // Image pan offset X (px relative to token center)
  offsetY: number;     // Image pan offset Y (px relative to token center)
  scale: number;       // Zoom factor (1.0 = auto-fit, >1.0 = zoomed in)
  rotation: number;    // Image rotation in degrees (independent of token rotation)
}
```

The popup uses a Konva Stage with the token shape as a clip mask and the image as a draggable node inside it. The saved `ImageCropTransform` is stored on the Token and used during all rendering (canvas, PDF export, PNG export).

---

## 8. Data Models & State Management

### 8.1 Core Data Types

```typescript
// ============================================================
// TOKEN
// ============================================================
interface Token {
  id: string;

  // Image data
  originalSrc: string;          // Original uploaded image (data URL or blob URL)
  processedSrc: string;         // Processed/cropped version for display
  fileName: string;

  // Dimensions & positioning
  sizeMm: number;               // Physical size in mm (diameter for circle, side for square)
  sizePreset: DnDSizePreset | null;  // If using a preset, stores the key
  position: { x: number; y: number };  // Canvas position (mm from origin)
  rotation: number;             // Degrees
  scale: { x: number; y: number };    // Scale factors (for non-uniform resize)

  // Shape & frame
  shape: TokenShape;
  frame: TokenFrameConfig;
  crop: TokenCropConfig;

  // Overlays
  overlayId: string | null;     // Reference to applied overlay from library
  overlayOpacity: number;

  // Image positioning (from cropping popup)
  imageCrop: ImageCropTransform;

  // Filters
  filters: TokenFilterConfig;

  // Metadata
  count: number;                // Number of copies for print layout
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

type TokenShape = 'circle' | 'square' | 'hexagon';

type DnDSizePreset = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

interface TokenFrameConfig {
  enabled: boolean;
  thicknessMm: number;
  color: string;
  style: 'solid' | 'dashed' | 'double' | 'ornate';
  libraryAssetId: string | null;  // If using a frame from the asset library
}

interface TokenCropConfig {
  enabled: boolean;
  cutFrameMm: number;           // Inward crop amount
}

interface TokenFilterConfig {
  brightness: number;           // 0–200 (100 = normal)
  contrast: number;             // 0–200 (100 = normal)
  saturation: number;           // 0–200 (100 = normal)
  hue: number;                  // -180 to 180 degrees
  blur: number;                 // 0–10 px
  grayscale: boolean;
  sepia: boolean;
}

// ============================================================
// OVERLAY / FRAME ASSET
// ============================================================
interface OverlayAsset {
  id: string;
  src: string;
  processedSrc: string;
  name: string;
  category: 'frame' | 'border' | 'texture' | 'icon' | 'ring';
  source: 'library' | 'user-upload';

  // Adjustable properties
  hue: number;
  saturation: number;
  opacity: number;
}

// ============================================================
// PRINT SETTINGS
// ============================================================
interface PrintSettings {
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  margins: number;              // mm
  spacing: number;              // mm (gap between tokens)
  unit: 'mm' | 'inch';
  cutMarks: boolean;            // Print cut marks around tokens
  bleed: number;                // mm (bleed area for professional printing)
}

type PaperSize = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid' | 'custom';

interface CustomPaperSize {
  width: number;  // mm
  height: number; // mm
}

// ============================================================
// EDITOR STATE
// ============================================================
interface EditorState {
  mode: 'edit' | 'print-layout';
  selectedTokenIds: string[];
  zoom: number;
  panOffset: { x: number; y: number };
  gridEnabled: boolean;
  gridSizeMm: number;
  snapToGrid: boolean;
  showGuides: boolean;
  showCutMarks: boolean;
}

// ============================================================
// PROJECT
// ============================================================
interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tokens: Token[];
  overlayAssets: OverlayAsset[];  // User-uploaded overlays
  printSettings: PrintSettings;
  editorState: EditorState;
  presets: Record<DnDSizePreset, number>;  // Customizable preset values
}
```

### 8.2 Zustand Store Structure

The store is split into **slices** for maintainability:

```typescript
// Store slices (each in its own file)

// tokenSlice — CRUD operations on tokens
// editorSlice — Editor mode, selection, zoom, pan, grid
// librarySlice — Built-in + user assets, categories, search
// gallerySlice — Community gallery browsing, uploads, admin state
// printSlice — Print settings, layout computation
// historySlice — Undo/redo stack (wraps other slices)
// projectSlice — Project save/load to IndexedDB
```

### 8.3 Undo/Redo System

Use Zustand middleware that captures state snapshots:

```typescript
// History middleware records state diffs on every action
// Max history depth: 50 steps
// Actions that trigger history: token add/remove/update, overlay changes, setting changes
// Actions that do NOT trigger history: zoom, pan, selection changes, UI state

interface HistorySlice {
  past: Partial<StoreState>[];
  future: Partial<StoreState>[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

---

## 9. Component Architecture

### 9.1 Page-Level Components

```
App
├── EditorPage (main editing view — default route)
│   ├── Sidebar
│   │   ├── UploadPanel
│   │   ├── TokenListPanel
│   │   │   └── TokenListItem (per token controls)
│   │   ├── OverlayPanel
│   │   │   └── OverlayListItem
│   │   ├── GalleryPanel (community gallery browsing)
│   │   └── PrintSettingsPanel
│   ├── CanvasArea
│   │   ├── CanvasToolbar (mode switch, zoom, grid toggle, undo/redo)
│   │   ├── KonvaCanvas (the main Stage + Layers)
│   │   │   ├── BackgroundLayer
│   │   │   ├── TokenLayer
│   │   │   │   └── TokenGroup (per token: image + frame + overlay)
│   │   │   ├── GuideLayer (snap lines, selection rect)
│   │   │   └── TransformerLayer
│   │   └── CanvasStatusBar (token count, page info, zoom %)
│   └── AssetLibraryDrawer (slide-out panel)
│       ├── LibraryCategoryTabs
│       ├── LibrarySearchBar
│       └── LibraryAssetGrid
├── ImagePositionModal (crop/position image within token shape)
├── ExportModal
│   ├── PDFExportTab
│   └── PNGExportTab
├── GalleryUploadModal (upload image to gallery with privacy toggle)
├── ProjectManagerModal (save/load/new)
└── AdminPage (admin route — gallery approval panel)
    ├── PendingSubmissionsList
    ├── SubmissionPreview
    └── ApproveRejectControls
```

### 9.2 Key Canvas Components (Konva)

```typescript
// TokenGroup — The core canvas component for a single token
// Renders as a Konva.Group containing all visual layers of one token

<Group id={token.id} x={token.position.x} y={token.position.y}
       rotation={token.rotation} draggable={editorMode === 'edit'}>

  {/* 1. Background texture (if any) */}
  {token.textureAssetId && <Image image={texture} filters={[...]} />}

  {/* 2. Clipping group for shape mask */}
  <Group clipFunc={(ctx) => drawShapeMask(ctx, token.shape, tokenSizePx)}>

    {/* 3. Token image */}
    <Image image={tokenImage} />

    {/* 4. Overlay frame image */}
    {token.overlayId && <Image image={overlayImage} opacity={token.overlayOpacity} />}

  </Group>

  {/* 5. Frame border (on top of clip group) */}
  {token.frame.enabled && <TokenFrame config={token.frame} shape={token.shape} />}

</Group>
```

---

## 10. File & Folder Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root component with routing
├── index.css                         # Tailwind base imports
│
├── types/                            # TypeScript type definitions
│   ├── token.ts                      # Token, TokenShape, TokenFrameConfig, etc.
│   ├── overlay.ts                    # OverlayAsset
│   ├── print.ts                      # PrintSettings, PaperSize
│   ├── editor.ts                     # EditorState
│   ├── project.ts                    # Project
│   ├── library.ts                    # LibraryAsset, LibraryCategory
│   └── index.ts                      # Re-exports
│
├── store/                            # Zustand state management
│   ├── index.ts                      # Combined store
│   ├── tokenSlice.ts                 # Token CRUD actions
│   ├── editorSlice.ts                # Editor state actions
│   ├── librarySlice.ts               # Asset library state
│   ├── printSlice.ts                 # Print settings & layout
│   ├── historySlice.ts               # Undo/redo middleware
│   └── projectSlice.ts              # Project save/load
│
├── canvas/                           # Konva canvas components
│   ├── KonvaCanvas.tsx               # Main Stage + event handlers
│   ├── BackgroundLayer.tsx           # Paper background, margins, grid
│   ├── TokenLayer.tsx                # Container for all token groups
│   ├── TokenGroup.tsx                # Single token (image + frame + overlay + text)
│   ├── TokenFrame.tsx                # Frame/border rendering
│   ├── TokenMask.tsx                 # Shape clipping (circle, square, hex)
│   ├── ImagePositionStage.tsx        # Konva stage inside the crop/position modal
│   ├── GuideLayer.tsx                # Snap lines, alignment guides
│   ├── TransformerWrapper.tsx        # Konva Transformer for selected tokens
│   └── PrintLayoutRenderer.tsx       # Read-only bin-packed layout view
│
├── components/                       # React UI components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── CanvasArea.tsx
│   │   └── CanvasToolbar.tsx
│   ├── panels/
│   │   ├── UploadPanel.tsx
│   │   ├── TokenListPanel.tsx
│   │   ├── TokenListItem.tsx
│   │   ├── OverlayPanel.tsx
│   │   ├── OverlayListItem.tsx
│   │   ├── GalleryPanel.tsx           # Community gallery browsing panel
│   │   └── PrintSettingsPanel.tsx
│   ├── library/
│   │   ├── AssetLibraryDrawer.tsx
│   │   ├── LibraryCategoryTabs.tsx
│   │   ├── LibrarySearchBar.tsx
│   │   └── LibraryAssetGrid.tsx
│   ├── modals/
│   │   ├── ImagePositionModal.tsx    # Image crop/position within token shape
│   │   ├── ExportModal.tsx
│   │   ├── PDFExportTab.tsx
│   │   ├── PNGExportTab.tsx
│   │   ├── GalleryUploadModal.tsx    # Upload to community gallery with privacy toggle
│   │   └── ProjectManagerModal.tsx
│   ├── admin/                        # Admin panel (separate route)
│   │   ├── AdminPage.tsx             # Admin dashboard
│   │   ├── PendingSubmissions.tsx    # List of images awaiting approval
│   │   └── SubmissionReview.tsx      # Preview + approve/reject controls
│   └── ui/                           # Reusable UI primitives
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── ColorPicker.tsx
│       ├── Select.tsx
│       ├── Input.tsx
│       ├── Toggle.tsx
│       ├── Tooltip.tsx
│       └── Toast.tsx
│
├── services/                         # Business logic (no UI)
│   ├── imageProcessor.ts             # Image crop, resize, filter pipeline
│   ├── layoutEngine.ts               # MaxRects bin-packing (ported from v5.6)
│   ├── pdfExporter.ts                # PDF generation with jsPDF
│   ├── pngExporter.ts                # PNG/ZIP export
│   ├── projectStorage.ts             # IndexedDB save/load
│   └── assetManager.ts               # Asset loading, caching, manifest parsing
│
├── hooks/                            # Custom React hooks
│   ├── useCanvasZoom.ts              # Zoom & pan logic
│   ├── useKeyboardShortcuts.ts       # Global keyboard handlers
│   ├── useTokenDrag.ts               # Token drag & snap logic
│   ├── useHistory.ts                 # Undo/redo hook
│   ├── useAutoSave.ts               # Debounced auto-save to IndexedDB
│   └── useImageLoader.ts             # Async image loading with caching
│
├── utils/                            # Pure utility functions
│   ├── units.ts                      # mm↔px conversion, snap-to-grid
│   ├── color.ts                      # hexToRgb, color manipulation
│   ├── math.ts                       # Geometry helpers, bounding box, rotation
│   ├── constants.ts                  # Paper sizes, DnD presets, defaults
│   └── validators.ts                 # Input validation helpers
│
├── assets/                           # Static assets
│   ├── library/                      # Built-in asset library
│   │   ├── manifest.json             # Asset catalog with metadata
│   │   ├── frames/                   # Frame PNG/SVG files
│   │   ├── borders/                  # Border assets
│   │   ├── textures/                 # Texture assets
│   │   ├── icons/                    # DnD class/status icons
│   │   └── thumbnails/              # Small previews for library UI
│   └── logo/                         # Application logo
│
├── api/                              # Backend API communication
│   ├── galleryApi.ts                 # Gallery CRUD, search, pagination
│   ├── adminApi.ts                   # Admin approval/rejection endpoints
│   └── authApi.ts                    # Admin authentication
│
└── __tests__/                        # Test files (mirrors src/ structure)
    ├── services/
    ├── store/
    └── utils/
```

---

## 11. UI/UX Design System

### 11.1 Design Tokens (Tailwind Config)

```
Color Palette:
  Primary:     Indigo (from v5.6: #5a67d8 → Tailwind indigo-500/600)
  Success:     Emerald (#10b981)
  Danger:      Red (#f56565)
  Warning:     Amber (#eab308)  — used for "active" toggles in v5.6
  Background:  Slate gradient (keeping the existing feel)
  Surface:     White with glass-morphism

Typography:
  Font:        Inter (already used) + fantasy fonts for token text
  Sizes:       Tailwind default scale

Spacing:
  Base unit:   4px (Tailwind default)

Border Radius:
  sm: 4px, md: 8px, lg: 16px, xl: 24px

Shadows:
  sm, md, lg (keep existing custom shadows)
```

### 11.2 Layout Specification

```
┌─────────────────────────────────────────────────────────────────┐
│  App Header (optional: project name, save/load, settings)       │
├──────────┬──────────────────────────────────────────────────────┤
│          │  Canvas Toolbar                                      │
│          │  [Edit|Print] [Undo][Redo] [Grid] [Snap] [Zoom: 77%]│
│ Sidebar  ├──────────────────────────────────────────────────────┤
│ (380px)  │                                                      │
│          │           Main Canvas Area                           │
│ [Upload] │           (Konva Stage)                              │
│ [Tokens] │                                                      │
│ [Overlays│           ┌────────────────────────┐                 │
│ [Gallery]│           │  A4 Paper Preview      │                 │
│ [Print]  │           │  with tokens           │                 │
│          │           │                        │                 │
│          │           └────────────────────────┘                 │
│          │                                                      │
│          ├──────────────────────────────────────────────────────┤
│          │  Status Bar: "12 tokens • 2 pages • A4 • 77%"       │
├──────────┴──────────────────────────────────────────────────────┤
│  [Asset Library Drawer — slides from right when toggled]        │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Sidebar Tab Design

The sidebar uses vertical tabs (icons + labels), similar to v5.6 but redesigned:

| Tab | Icon | Contains |
|-----|------|----------|
| Upload | `ImagePlus` | Upload buttons (tokens + overlays), drag & drop zone |
| Tokens | `CircleUser` | List of uploaded tokens with per-token controls |
| Library | `Library` | Quick access to built-in assets (also opens full drawer) |
| Gallery | `Globe` | Browse community gallery images, upload to gallery |
| Overlays | `Layers` | List of overlays with hue/saturation controls |
| Print | `Printer` | Paper size, margins, spacing, cut marks, bleed, export buttons |

---

## 12. Export & Print Pipeline

### 12.1 PDF Export Pipeline

```
1. User clicks "Print PDF"
2. Collect all tokens with their current state (position, size, frame, overlay, image crop transform)
3. If mode === 'print-layout':
   a. Run MaxRects bin-packing (existing layoutEngine.ts)
   b. Get positions for all tokens across pages
4. If mode === 'edit':
   a. Use current canvas positions
   b. Calculate which tokens fit on which page
5. For each page:
   a. Create jsPDF page with correct dimensions
   b. For each token on this page:
      i.   Render token to offscreen canvas (using Konva's toCanvas())
      ii.  This captures: image (with crop transform) + mask + frame + overlay
      iii. Add rendered image to PDF at exact mm position
   c. Optionally draw cut marks
6. Save PDF
```

### 12.2 PNG Export Pipeline

```
1. User opens Export Modal → PNG Tab
2. User selects: resolution (256/512/1024/2048), background (transparent/white/custom)
3. For each token:
   a. Isolate the TokenGroup on a temporary Konva Stage
   b. Set stage size to selected resolution
   c. Export using stage.toDataURL('image/png')
   d. Add to ZIP archive with descriptive filename
4. Download ZIP
```

### 12.3 Key Principle: Single Rendering Path

**CRITICAL:** Unlike v5.6 where token rendering is duplicated across PrintPreview, pdfExporter, and TokenSaveModal, v2.0 must have a **single rendering function** for each token. The `TokenGroup` Konva component IS the canonical render, and all exports use `tokenGroup.toCanvas()` or `tokenGroup.toDataURL()`.

---

## 13. Built-in Token Asset Library

### 13.1 Asset Manifest Format

```json
{
  "version": "1.0",
  "assets": [
    {
      "id": "frame-gold-ornate-01",
      "name": "Gold Ornate Frame",
      "category": "frame",
      "tags": ["gold", "ornate", "royal", "cleric", "paladin"],
      "file": "frames/gold-ornate-01.png",
      "thumbnail": "thumbnails/frame-gold-ornate-01.webp",
      "size": { "width": 512, "height": 512 },
      "compatibleShapes": ["circle", "square"],
      "author": "MandoStudio",
      "license": "CC-BY-4.0"
    }
  ]
}
```

### 13.2 Asset Loading Strategy

1. **Manifest** is loaded at app startup (small JSON, <10KB)
2. **Thumbnails** are loaded lazily as user scrolls through the library grid
3. **Full-resolution assets** are loaded on-demand when user applies an asset to a token
4. Loaded assets are cached in memory (`Map<string, HTMLImageElement>`)
5. For offline support, the full library is bundled in the build (tree-shakeable via dynamic imports)

### 13.3 Initial Asset Collection

For v2.0 launch, include at minimum:

- **6 Frames:** Gold ornate, Silver ornate, Stone, Wood, Elvish vine, Dark/infernal
- **4 Borders:** Solid colored ring, Double line, Dashed, Gradient glow
- **4 Textures:** Parchment, Leather, Stone wall, Dark fabric
- **12 DnD Icons:** One per class (Fighter, Wizard, Rogue, Cleric, Ranger, Barbarian, Bard, Druid, Monk, Paladin, Sorcerer, Warlock)
- **6 Color Rings:** Red, Blue, Green, Yellow, Purple, Orange

**Total: ~32 assets** — enough for a rich initial experience. The community gallery will expand available images over time.

> **NOTE for development:** The actual asset image files need to be created/sourced. The developer should create placeholder assets (solid colors, simple shapes) during development, and final artwork can be added later. All asset handling code should be fully functional with placeholders.

---

## 14. Image Positioning & Cropping System

> **KEY FEATURE:** This modal popup is the primary way users control how their uploaded artwork appears within the token shape. It replaces any text/label system — tokens are purely visual (image + frame/border) with no text overlays.

### 14.1 Crop Modal UI Layout

```
┌────────────────────────────────────────────────────────┐
│  Position Image Within Token                      [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│       ┌─────────────────────────────────┐              │
│       │                                 │              │
│       │      ╭───────────────╮          │              │
│       │      │               │          │              │
│       │      │  Token Shape  │          │              │
│       │      │  (clip mask)  │          │              │
│       │      │               │          │              │
│       │      ╰───────────────╯          │              │
│       │                                 │              │
│       │   (drag image to reposition)    │              │
│       └─────────────────────────────────┘              │
│                                                        │
│  Zoom: [─────●───────] 135%       [↺ Reset]            │
│                                                        │
│              [Cancel]        [✔ Apply]                  │
└────────────────────────────────────────────────────────┘
```

### 14.2 Implementation Details

**Konva Stage inside the modal:**
```typescript
// The crop modal uses its own Konva Stage
<Stage width={previewSize} height={previewSize}>
  <Layer>
    {/* Clip group defines the token shape viewport */}
    <Group clipFunc={(ctx) => drawShapeMask(ctx, tokenShape, previewSize)}>
      <Image
        image={uploadedImage}
        x={cropTransform.offsetX}
        y={cropTransform.offsetY}
        scaleX={cropTransform.scale}
        scaleY={cropTransform.scale}
        rotation={cropTransform.rotation}
        draggable={true}
        onDragEnd={(e) => updateCropOffset(e.target.x(), e.target.y())}
      />
    </Group>
    {/* Semi-transparent overlay outside the token shape for visual clarity */}
    <ShapeMaskOverlay shape={tokenShape} size={previewSize} />
  </Layer>
</Stage>
```

**Auto-fit algorithm:**
```typescript
function autoFitImage(imageWidth: number, imageHeight: number, tokenSize: number): ImageCropTransform {
  // Scale to COVER the token shape (no empty space)
  const scale = Math.max(tokenSize / imageWidth, tokenSize / imageHeight);
  return {
    offsetX: (tokenSize - imageWidth * scale) / 2,
    offsetY: (tokenSize - imageHeight * scale) / 2,
    scale,
    rotation: 0,
  };
}
```

### 14.3 Re-crop Access

Users can re-open the crop modal at any time:
- **Token card button** — Each token in the sidebar list has a "Crop/Position" icon button
- **Double-click on canvas** — Double-clicking a token on the canvas opens the crop modal
- **Right-click context menu** — "Reposition Image" option

---

## 15. Community Gallery & Admin System

### 15.1 Overview

The Community Gallery is a shared image repository where users can browse, search, and use token images uploaded by other users. This transforms the app from a solo tool into a community-powered resource.

### 15.2 Gallery Features

**For Regular Users:**
- **Browse gallery** — Grid view of approved community images, categorized and searchable
- **Search & filter** — By category (creature type, race, class, environment), tags, name
- **Use in token** — One-click to add a gallery image as a new token (opens the crop/position modal)
- **Upload to gallery** — Submit own images for community use
- **Privacy toggle** — Before uploading, user can mark image as "Private" (won't appear in public gallery, stays only in their local project) or "Public" (submitted for admin review)
- **My Uploads** — View own submitted images and their approval status (pending/approved/rejected)

**For Admin:**
- **Pending queue** — List of all images submitted as "Public" awaiting approval
- **Preview** — Full-size preview of submitted image
- **Approve/Reject** — One-click approve (image goes live in gallery) or reject (with optional reason message)
- **Gallery management** — Edit tags/categories, remove inappropriate content, feature images
- **Bulk actions** — Approve/reject multiple submissions at once

### 15.3 Gallery Data Model

```typescript
interface GalleryImage {
  id: string;
  originalUrl: string;           // Full-resolution image URL (cloud storage)
  thumbnailUrl: string;          // Optimized thumbnail for grid view
  uploaderName: string;          // Display name (or "Anonymous")
  uploadedAt: string;            // ISO timestamp

  // Categorization
  name: string;                  // Image title (e.g., "Red Dragon")
  category: GalleryCategory;
  tags: string[];                // Searchable tags

  // Moderation
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewNote?: string;           // Admin note (shown to uploader on rejection)

  // Stats
  usageCount: number;            // How many times this image has been used

  // Privacy
  isPrivate: boolean;            // If true, only visible to uploader
}

type GalleryCategory =
  | 'creature'      // Monsters, beasts, dragons
  | 'humanoid'      // NPCs, characters, villains
  | 'undead'        // Zombies, skeletons, liches
  | 'environment'   // Terrain tokens, obstacles
  | 'item'          // Treasure, traps, objects
  | 'vehicle'       // Ships, wagons, mounts
  | 'effect'        // Spell effects, auras
  | 'other';

interface GalleryUploadRequest {
  image: File;                   // The uploaded file
  name: string;                  // Title
  category: GalleryCategory;
  tags: string[];
  isPrivate: boolean;            // Privacy toggle
}
```

### 15.4 Gallery API Endpoints

```
GET    /api/gallery                  — List approved images (paginated, filterable)
GET    /api/gallery/:id              — Get single image details
POST   /api/gallery/upload           — Upload new image (multipart form)
GET    /api/gallery/my-uploads       — List current user's uploads with status
DELETE /api/gallery/my-uploads/:id   — Remove own pending upload

# Admin endpoints (authenticated)
GET    /api/admin/pending            — List all pending submissions
POST   /api/admin/approve/:id        — Approve a submission
POST   /api/admin/reject/:id         — Reject a submission (with reason)
DELETE /api/admin/gallery/:id        — Remove an approved image
PATCH  /api/admin/gallery/:id        — Edit tags/category of an image
```

### 15.5 Upload Flow

```
1. User clicks "Upload to Gallery" button
2. GalleryUploadModal opens:
   a. Image file picker
   b. Name input field
   c. Category dropdown
   d. Tags input (comma-separated or autocomplete)
   e. [●] Public / [○] Private toggle (default: Public)
3. User submits → image uploaded to backend
4. If Public: status = 'pending', enters admin review queue
5. If Private: image saved to user's personal storage only, never shown to others
6. User sees confirmation with status
```

### 15.6 Admin Panel

Accessible via `/admin` route, protected by admin authentication (simple password or OAuth).

```
┌────────────────────────────────────────────────────────┐
│  🛡️ Admin Panel — Gallery Moderation                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Pending Submissions (12)           [Approve All Sel.] │
│  ┌──────┬──────┬──────┬──────┐                         │
│  │ [☐]  │ [☐]  │ [☐]  │ [☐]  │   Selected: Red Dragon │
│  │ img1 │ img2 │ img3 │ img4 │   Category: creature   │
│  └──────┴──────┴──────┴──────┘   Tags: red, dragon,   │
│  ┌──────┬──────┬──────┬──────┐         fire, boss      │
│  │ [☐]  │ [☐]  │ [☐]  │ [☐]  │   Uploaded: 2 hrs ago  │
│  │ img5 │ img6 │ img7 │ img8 │   By: user123          │
│  └──────┴──────┴──────┴──────┘                         │
│                                   [✔ Approve] [✖ Rej.] │
└────────────────────────────────────────────────────────┘
```

---

## 16. Backend Architecture

> **ARCHITECTURE CHANGE:** The community gallery and admin approval features require a backend. The editor itself remains fully client-side (all token editing, export, and PDF generation happens in the browser). The backend is ONLY responsible for: image storage, gallery data, admin auth, and the approval workflow.

### 16.1 Recommended Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| **Runtime** | Node.js 20+ | Same language as frontend (TypeScript) |
| **Framework** | Express.js or Fastify | Lightweight, proven, easy to deploy |
| **Database** | SQLite (via better-sqlite3) or PostgreSQL | SQLite for simple deployment; Postgres for scale |
| **Image Storage** | Local filesystem + Cloudflare R2 / AWS S3 | Thumbnails generated server-side; originals in cloud |
| **Auth** | Simple admin password (bcrypt) or OAuth | Only admin needs auth; regular users are anonymous |
| **Image Processing** | Sharp | Thumbnail generation, image validation, size limits |
| **API Style** | REST JSON | Simple, well-understood |

### 16.2 Backend Project Structure

```
server/
├── index.ts                     # Entry point, Express/Fastify setup
├── routes/
│   ├── gallery.ts               # Public gallery endpoints
│   └── admin.ts                 # Admin-only endpoints (auth middleware)
├── middleware/
│   ├── auth.ts                  # Admin authentication
│   ├── upload.ts                # Multer/Busboy file upload handling
│   └── rateLimit.ts             # Rate limiting for uploads
├── services/
│   ├── imageService.ts          # Image processing (Sharp), thumbnail generation
│   ├── storageService.ts        # File storage abstraction (local / S3 / R2)
│   └── galleryService.ts        # Gallery CRUD, search, moderation
├── db/
│   ├── schema.sql               # Database schema
│   ├── migrations/              # Database migrations
│   └── queries.ts               # Prepared statements / query builders
├── config.ts                    # Environment configuration
└── types.ts                     # Shared TypeScript types
```

### 16.3 Database Schema

```sql
CREATE TABLE gallery_images (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,               -- JSON array stored as text
  original_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  uploader_id TEXT,                 -- Anonymous ID (cookie-based or IP hash)
  uploader_name TEXT DEFAULT 'Anonymous',
  is_private BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',    -- 'pending', 'approved', 'rejected'
  review_note TEXT,
  reviewed_at TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_gallery_status ON gallery_images(status);
CREATE INDEX idx_gallery_category ON gallery_images(category);
CREATE INDEX idx_gallery_uploader ON gallery_images(uploader_id);

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### 16.4 Image Upload Pipeline

```
1. User submits image via multipart POST
2. Server validates: file type (PNG/JPG/WebP), file size (<10MB), dimensions (<4096×4096)
3. Server generates unique ID + filename
4. Sharp processes image:
   a. Original: saved as-is (or resized if >2048px)
   b. Thumbnail: resized to 256×256, WebP format, quality 80
5. Files stored to disk (or cloud storage)
6. Database record created with status='pending' (or status='private')
7. Response: { id, thumbnailUrl, status }
```

### 16.5 Deployment

The backend can be deployed alongside the frontend or separately:
- **Same server:** Vite frontend served as static files by the same Express/Fastify server
- **Separate:** Frontend on Netlify/Vercel, backend on a VPS (DigitalOcean, Railway, Fly.io)
- **Docker:** Simple Dockerfile for the full-stack app

---

## 17. Monetization — Google AdSense Integration

> **CRITICAL ARCHITECTURE REQUIREMENT:** The app must be built from day one with ad placement in mind. Ad containers must be part of the layout system, not bolted on later. This ensures clean integration without breaking the editor UX.

### 17.1 Ad Placement Strategy

The editor canvas must remain **ad-free** to not disrupt the creative workflow. Ads appear in non-intrusive, high-visibility locations:

| Placement | Location | Ad Type | When Visible |
|-----------|----------|---------|-------------|
| **Sidebar Bottom** | Below the token list in the sidebar | Display Ad (300×250) | Always visible when scrolled down |
| **Gallery Page** | Between gallery image rows | In-feed Ad (native) | While browsing community gallery |
| **Export Modal** | Below export options, above action buttons | Display Ad (728×90 banner) | When user opens export modal |
| **Between Pages** | In print preview, between page thumbnails | Display Ad (300×250) | Multi-page print preview |
| **Welcome/Empty State** | Center of canvas when no tokens loaded | Display Ad (336×280) | Only when canvas is empty |
| **Admin Panel** | Sidebar or header | Display Ad (728×90) | Admin panel pages |

### 17.2 Implementation Architecture

**AdSense Component System:**
```typescript
// Reusable ad component that handles loading, sizing, and fallback
interface AdSlotProps {
  slotId: string;              // Google AdSense ad slot ID
  format: 'display' | 'in-feed' | 'in-article' | 'auto';
  layout?: 'fixed' | 'responsive';
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;  // Shown while ad loads or if blocked
}

// Component: <AdSlot slotId="1234567890" format="display" width={300} height={250} />
```

**Ad Configuration (Environment Variables):**
```typescript
// .env
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX   // Your AdSense publisher ID
VITE_ADSENSE_ENABLED=true                          // Toggle ads on/off
VITE_AD_SLOT_SIDEBAR=1234567890                    // Sidebar ad slot
VITE_AD_SLOT_GALLERY=2345678901                    // Gallery in-feed slot
VITE_AD_SLOT_EXPORT=3456789012                     // Export modal slot
VITE_AD_SLOT_PREVIEW=4567890123                    // Print preview slot
VITE_AD_SLOT_WELCOME=5678901234                    // Empty state slot
```

### 17.3 Technical Requirements

**Script Loading:**
```html
<!-- Added to index.html <head> — loaded async to not block rendering -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

**React Integration:**
```typescript
// hooks/useAdSense.ts
// Custom hook that initializes adsbygoogle on component mount
// Handles: script loading, ad refresh, error handling, adblocker detection

// components/ui/AdSlot.tsx
// Renders <ins class="adsbygoogle" ...> with proper data attributes
// Uses useEffect to push to (adsbygoogle = window.adsbygoogle || []).push({})
// Shows fallback content if ad fails to load or is blocked
```

**Key Principles:**
- **Non-blocking:** Ad scripts load async; never delay app rendering
- **Graceful degradation:** If AdSense fails or is blocked, show fallback (empty space or self-promo)
- **No ads on canvas:** The editing canvas and print preview content are NEVER obscured by ads
- **Responsive ads:** Use responsive ad units that adapt to container width
- **Ad-free export:** PDF and PNG exports never contain ads
- **Cookie consent:** Implement cookie consent banner (GDPR) — AdSense requires user consent in EU
- **ads.txt:** Serve `ads.txt` file from the root domain for AdSense verification

### 17.4 Cookie Consent (GDPR)

```typescript
// Required for AdSense in EU
// Before loading personalized ads, user must consent to cookies

interface CookieConsent {
  analytics: boolean;
  advertising: boolean;       // Must be true for personalized AdSense ads
  necessary: boolean;         // Always true
}

// If user declines advertising cookies:
// → Load AdSense in non-personalized mode (npa=1)
// → Or don't load ads at all
```

### 17.5 File Structure Addition

```
src/
├── components/
│   ├── ads/
│   │   ├── AdSlot.tsx                # Reusable ad container component
│   │   ├── AdSenseProvider.tsx       # Context provider for ad config
│   │   ├── CookieConsentBanner.tsx   # GDPR cookie consent
│   │   └── adConfig.ts              # Ad slot IDs, sizes, placements
```

### 17.6 Ad Placement Layout Rules

```
SIDEBAR:
┌──────────────┐
│ Token List   │
│ ...          │
│ ...          │
├──────────────┤
│ ┌──────────┐ │
│ │  AD SLOT │ │  ← 300×250 display ad
│ │  300×250 │ │
│ └──────────┘ │
└──────────────┘

GALLERY PAGE:
┌──────────────────────────────────┐
│ 🖼️ 🖼️ 🖼️ 🖼️  (gallery images)    │
│ 🖼️ 🖼️ 🖼️ 🖼️                      │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │     IN-FEED AD (native)     │ │  ← Blends with gallery grid
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ 🖼️ 🖼️ 🖼️ 🖼️  (more images)       │
└──────────────────────────────────┘

EXPORT MODAL:
┌────────────────────────────┐
│  Export Settings           │
│  • Format: PDF / PNG       │
│  • Resolution: 300 DPI     │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │   AD BANNER 728×90     │ │  ← Banner above export button
│ └────────────────────────┘ │
├────────────────────────────┤
│  [Cancel]    [🖨️ Export]   │
└────────────────────────────┘
```

---

## 18. Performance & Optimization

### 18.1 Canvas Performance

- **Batch rendering** — Use `layer.batchDraw()` instead of individual redraws
- **Image caching** — Konva's built-in `cache()` method for complex groups; re-cache only on property change
- **Offscreen canvas** — Render token thumbnails on offscreen canvas for sidebar list
- **Layer separation** — Static elements (background, guides) on separate layers from dynamic (tokens)
- **Throttle transforms** — Throttle drag/resize events to 60fps using `requestAnimationFrame`

### 18.2 Memory Management

- **Blob URLs** — Use `URL.createObjectURL()` for large images instead of data URLs
- **Image resolution limits** — Auto-downscale uploaded images to max 2048x2048 for canvas usage (keep original for export)
- **Cleanup** — Revoke blob URLs when tokens are removed; implement proper cleanup in useEffect return functions
- **Lazy loading** — Library assets loaded only when visible (Intersection Observer)

### 18.3 Build Optimization

- **Code splitting** — Lazy-load the library drawer and export modals
- **Tree shaking** — Import only needed Konva modules
- **Asset optimization** — Compress all library assets; use WebP for thumbnails, PNG for full resolution
- **Bundle analysis** — Target <500KB initial JS bundle (without library assets)

---

## 19. Testing Strategy

### 19.1 Unit Tests (Vitest)

| Module | Test Focus |
|--------|-----------|
| `layoutEngine.ts` | Bin-packing correctness, edge cases (oversized tokens, empty input) |
| `imageProcessor.ts` | Image crop math, filter calculations, mm↔px conversions |
| `utils/*` | All pure utility functions |
| `store/tokenSlice.ts` | CRUD operations, state integrity |
| `store/historySlice.ts` | Undo/redo correctness, stack limits |

### 19.2 Component Tests (@testing-library/react)

- Sidebar panels render correctly
- Upload triggers correct store actions
- Token list shows correct data
- Export modal options work

### 19.3 E2E Tests (Playwright)

- Full workflow: upload image → edit on canvas → export PDF
- Multi-page layout with various token sizes
- Asset library: browse → apply frame → verify on canvas
- Image positioning: upload image → adjust crop/position in modal → verify in export
- Gallery: browse gallery → use image → verify token created
- Admin: login → approve submission → verify image appears in gallery

---

## 20. Deployment & Build

### 20.1 Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),  // Keep single-file build option
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          konva: ['konva', 'react-konva'],
          pdf: ['jspdf'],
          zip: ['jszip', 'file-saver'],
        }
      }
    }
  }
});
```

### 20.2 Build Modes

1. **Development** — `npm run dev` — Vite dev server with HMR
2. **Production (multi-file)** — `npm run build` — Standard Vite build with code splitting
3. **Production (single-file)** — `npm run build:single` — Single HTML file via vite-plugin-singlefile (for simple deployment)

### 20.3 Deployment Target

- **Frontend:** Static hosting (Netlify, Vercel, or custom server at mandostudio.hu) — CDN-friendly (all assets hashed, long cache)
- **Backend:** VPS or managed hosting (Railway, Fly.io, DigitalOcean) for gallery API + image storage
- **Combined option:** Single Express/Fastify server serving both frontend static files and API endpoints

---

## 21. Migration Plan from v5.6

### 21.1 What to Keep (Port to v2.0)

| v5.6 Module | v2.0 Destination | Changes |
|-------------|-----------------|---------|
| `layoutEngine.ts` (MaxRects) | `services/layoutEngine.ts` | Minor refactor; add TypeScript strict types |
| `imageProcessor.ts` (utilities) | `utils/units.ts` + `utils/color.ts` | Split into focused utility files |
| `tokenStore.ts` (Zustand) | `store/tokenSlice.ts` | Restructure into slices; new data model |
| DnD size presets | `utils/constants.ts` | Keep values, better typing |
| PDF generation logic | `services/pdfExporter.ts` | Rewrite to use Konva's toCanvas() |
| PNG/ZIP export | `services/pngExporter.ts` | Rewrite to use Konva's toCanvas() |

### 21.2 What to Replace

| v5.6 Component | Replacement |
|----------------|------------|
| Raw Canvas 2D rendering in PrintPreview | Konva Stage + Layers |
| Inline styles everywhere | Tailwind CSS classes |
| Duplicated rendering logic (3 places) | Single TokenGroup Konva component |
| No undo/redo | Zustand history middleware |
| No persistence | IndexedDB via idb-keyval |
| No image positioning | Crop/position modal with Konva |
| No asset library | Built-in manifest + lazy loading |
| No community features | Gallery with admin approval backend |

### 21.3 What to Remove

- `react-konva` dependency import workarounds (will be used properly now)
- Duplicate rendering code
- vite-plugin-singlefile as default (keep as optional build mode)
- Inline style objects

---

## 22. Development Phases & Milestones

### Phase 1: Foundation (Week 1–2)
**Goal:** Project scaffolding, core architecture, basic canvas rendering

- [ ] Initialize new Vite + React + TypeScript project with strict config
- [ ] Set up Tailwind CSS 4
- [ ] Set up ESLint + Prettier
- [ ] Define all TypeScript interfaces (`types/`)
- [ ] Implement Zustand store with slices (token, editor, print)
- [ ] Create basic app layout (sidebar + canvas area)
- [ ] Implement `KonvaCanvas` with background layer (paper, margins, grid)
- [ ] Implement basic `TokenGroup` (image only, no frame/overlay/text yet)
- [ ] Implement image upload → store → canvas flow
- [ ] Implement token drag & drop on canvas
- [ ] Implement `Transformer` for resize & rotate

### Phase 2: Core Token Features (Week 3–4)
**Goal:** Full token editing with shapes, frames, crops, overlays, image positioning

- [ ] Implement shape masking (circle, square, hexagon)
- [ ] Implement `TokenFrame` component (border rendering)
- [ ] Implement crop system (CUT frame)
- [ ] Implement **Image Positioning Modal** (crop/pan/zoom image within token shape)
- [ ] Implement `ImageCropTransform` data model and auto-fit algorithm
- [ ] Wire upload flow: upload → crop modal → token creation
- [ ] Implement overlay upload and application
- [ ] Implement overlay hue/saturation controls
- [ ] Port and integrate DnD size presets
- [ ] Implement per-token settings panel in sidebar
- [ ] Implement multi-select and batch operations
- [ ] Implement zoom & pan with mouse wheel
- [ ] Implement `TokenListPanel` with all per-token controls

### Phase 3: Print & Export (Week 5–6)
**Goal:** PDF and PNG export, print layout mode

- [ ] Port `layoutEngine.ts` (MaxRects bin packing)
- [ ] Implement Print Layout Mode (auto-arranged, read-only)
- [ ] Implement `PrintSettingsPanel`
- [ ] Implement PDF export using Konva `toCanvas()` + jsPDF
- [ ] Implement PNG/ZIP export using Konva `toDataURL()`
- [ ] Implement `ExportModal` with PDF and PNG tabs
- [ ] Implement cut marks rendering (optional)
- [ ] Test print accuracy (mm measurements)

### Phase 4: Asset Library (Week 7–8)
**Goal:** Built-in frame/border/texture library with UI

- [ ] Create `library-manifest.json` structure
- [ ] Create/source initial asset collection (40+ assets with placeholders)
- [ ] Implement `AssetLibraryDrawer` component
- [ ] Implement category tabs, search, grid view
- [ ] Implement asset preview and one-click apply
- [ ] Implement "My Uploads" category for user-uploaded overlays
- [ ] Implement asset lazy loading and caching
- [ ] Implement `librarySlice` in store

### Phase 5: Community Gallery & Backend (Week 9–11)
**Goal:** Backend API, community image gallery, admin approval panel

- [ ] Set up backend project (Express/Fastify + TypeScript)
- [ ] Implement database schema (SQLite or PostgreSQL)
- [ ] Implement image upload endpoint with Sharp thumbnail generation
- [ ] Implement gallery listing API (pagination, search, filter by category)
- [ ] Implement admin authentication (bcrypt password or OAuth)
- [ ] Implement admin approval/rejection endpoints
- [ ] Implement frontend `GalleryPanel` in sidebar (browse, search, use images)
- [ ] Implement `GalleryUploadModal` with privacy toggle
- [ ] Implement "My Uploads" view with status tracking
- [ ] Implement admin panel page (`/admin` route) with pending queue
- [ ] Implement bulk approve/reject in admin panel
- [ ] Implement `gallerySlice` in Zustand store
- [ ] Implement `galleryApi.ts` and `adminApi.ts` for frontend↔backend communication
- [ ] Implement cut marks and print guides for easier token cutting

### Phase 6: Polish & Advanced Features (Week 12–14)
**Goal:** Undo/redo, project save/load, keyboard shortcuts, final polish

- [ ] Implement undo/redo (`historySlice`)
- [ ] Implement project save/load to IndexedDB
- [ ] Implement `ProjectManagerModal`
- [ ] Implement keyboard shortcuts (Ctrl+Z, Ctrl+S, Delete, etc.)
- [ ] Implement image filters (brightness, contrast, saturation)
- [ ] Implement layer z-order management
- [ ] Implement token lock/visibility toggles
- [ ] Performance optimization pass
- [ ] Accessibility improvements
- [ ] Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- [ ] Final QA and bug fixes

---

## Appendix A: DnD Size Presets Reference

| Size | Grid Squares | Suggested mm | Suggested px (for digital VTT) |
|------|:------------:|:------------:|:------------------------------:|
| Tiny | 0.5 × 0.5 | 12 | 35 |
| Small | 1 × 1 | 20 | 70 |
| Medium | 1 × 1 | 20 | 70 |
| Large | 2 × 2 | 40 | 140 |
| Huge | 3 × 3 | 65 | 210 |
| Gargantuan | 4 × 4 | 90 | 280 |

## Appendix B: Paper Size Reference

| Name | Width (mm) | Height (mm) |
|------|:----------:|:-----------:|
| A5 | 148 | 210 |
| A4 | 210 | 297 |
| A3 | 297 | 420 |
| US Letter | 216 | 279 |
| US Legal | 216 | 356 |
| Tabloid | 279 | 432 |

## Appendix C: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` | Save project |
| `Ctrl+A` | Select all tokens |
| `Delete` / `Backspace` | Delete selected tokens |
| `Ctrl+D` | Duplicate selected tokens |
| `Ctrl+G` | Toggle grid |
| `Ctrl+P` | Export PDF |
| `Escape` | Deselect all |
| `+` / `-` | Zoom in / out |
| `0` | Reset zoom to fit |
| `Space + Drag` | Pan canvas |
| `Shift + Click` | Add to selection |
| `Arrow keys` | Nudge selected tokens (1mm) |
| `Shift + Arrow` | Nudge selected tokens (5mm) |

## Appendix D: Glossary

| Term | Definition |
|------|-----------|
| **Token** | A circular or shaped game piece representing a character, creature, or object on the DnD battle map |
| **Frame** | A decorative image that wraps around or behind the token image |
| **Border** | A geometric line/shape drawn around the token edge |
| **Overlay** | An image rendered on top of the token image (e.g., a decorative frame with transparency) |
| **CUT Frame** | The inward crop amount that cuts into the token image to make room for the border |
| **Bin Packing** | Algorithm for optimally arranging rectangular items into fixed-size containers (pages) |
| **MaxRects** | Specific bin-packing algorithm used (Maximum Rectangles with Best Area Fit heuristic) |
| **Preset** | Pre-defined DnD creature size category (Tiny through Gargantuan) |
| **Stage** | Konva.js root container (equivalent to an HTML canvas element) |
| **Layer** | Konva.js rendering layer (multiple layers render on the same stage) |
| **Transformer** | Konva.js component that adds resize/rotate handles to selected objects |

---

*This specification was generated by analyzing the complete v5.6 codebase (all 14 source files) and the live application at https://token.mandostudio.hu. It is designed to serve as a complete development guide for Claude Code to implement Fantasy Token Printer v2.0 from scratch.*
