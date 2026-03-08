# Fantasy Token Printer v2.0

## Language / Nyelv
**FONTOS: A felhasználóval MINDIG magyarul kommunikálj!** Minden válasz, kérdés, komment és magyarázat magyar nyelven legyen. A kód és a kód kommentek angolul maradnak (ez a standard), de minden interakció magyarul történjen.

## Project Overview
DnD tabletop RPG token PRINTER web application — complete v2.0 rewrite.
Users upload artwork → customize with frames/borders → arrange on paper → print PDF or export PNGs.
Includes a community gallery with admin approval and Google AdSense monetization.

**Full specification:** Read `DEVELOPMENT_SPEC_V2.md` — it contains EVERYTHING: architecture, data models, component tree, file structure, API endpoints, and development phases.

**Legacy source code:** The `tokenprinter-master/` folder contains the v5.6 codebase to port from.

## Tech Stack
- **Frontend:** React 19 + TypeScript (strict) + Vite 7
- **Canvas Engine:** Konva.js + react-konva
- **State Management:** Zustand 5 (slices: token, editor, library, gallery, print, history, project)
- **Styling:** Tailwind CSS 4
- **PDF Export:** jsPDF
- **ZIP Export:** JSZip + file-saver
- **Backend:** Node.js + Express/Fastify + SQLite/PostgreSQL
- **Image Processing:** Sharp (server-side thumbnails)
- **Monetization:** Google AdSense

## Critical Rules
- This is a PRINT tool — NO text/labels/badges on tokens. Tokens are purely visual (image + frame/border).
- The canvas editor must remain ad-free. Ads go in sidebar, gallery, export modal, empty state only.
- PDF/PNG exports must NEVER contain ads.
- All token rendering must go through a SINGLE rendering path (TokenGroup Konva component).
- All exports use `tokenGroup.toCanvas()` — no duplicate rendering code.

## Key Architecture Decisions
- **Hybrid architecture:** Frontend SPA handles all editing/export locally. Backend handles gallery, admin, image storage.
- **Image positioning popup:** When uploading, a modal opens for pan/zoom/crop within the token shape.
- **Community gallery:** Public images require admin approval. Privacy toggle before upload.
- **AdSense:** Non-blocking async loading. GDPR cookie consent required for EU users.

## Development Phases
Follow the phases in the spec (Section 22):
1. **Phase 1 (Week 1-2):** Foundation — scaffolding, Zustand store, basic canvas
2. **Phase 2 (Week 3-4):** Core features — shapes, frames, overlays, image positioning modal
3. **Phase 3 (Week 5-6):** Print & export — PDF, PNG, layout engine
4. **Phase 4 (Week 7-8):** Asset library — built-in frames/borders/textures
5. **Phase 5 (Week 9-11):** Gallery & backend — API, admin panel, community gallery
6. **Phase 6 (Week 12-14):** Polish — undo/redo, save/load, AdSense, keyboard shortcuts

## Commands
```bash
# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run test         # Vitest
npm run lint         # ESLint

# Backend
cd server && npm run dev    # Express/Fastify dev server
cd server && npm run test   # Backend tests
```

## Agent Workflow
- **frontend-dev agent:** Use for complex React/Konva component work
- **backend-dev agent:** Use for API endpoints, database, server-side logic
- **code-reviewer agent:** Run at the END of every phase before committing — review code quality, TypeScript errors, missing types
- **test-runner agent:** Run after code-reviewer passes — execute all tests, report failures
- **Workflow per phase:** Code → code-reviewer → fix issues → test-runner → fix failures → git commit & push

## Code Standards
- TypeScript strict mode — no `any` types
- Functional React components with hooks only
- Zustand slices for state — one file per slice
- Tailwind CSS classes — no inline styles
- Service layer interfaces (IProjectStorage, IAssetProvider, IGalleryService)
- All image sizes in mm (convert to px only at render time)
