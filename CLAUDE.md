# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Next.js 16 App Router project. All components are in `components/`, all routes in `app/`.

**Data flow:**
1. User uploads an image via `ColorExtractor` (file input or drag-and-drop)
2. A `<img>` element loads the file as an object URL
3. `colorthief` (dynamically imported to avoid SSR) calls `getPalette()` on the loaded image element and returns 5 dominant RGB triplets via median-cut algorithm
4. Results are passed to `ColorPalette` for display

**Key files:**
- `components/ColorExtractor.tsx` — upload UI, orchestrates extraction
- `components/ColorPalette.tsx` — renders swatches and hex cards with clipboard copy
- `types/colorthief.d.ts` — manual type declaration for `colorthief` (no `@types` package)

## Notes

- `colorthief` must be dynamically imported (`await import("colorthief")`) because it accesses `HTMLImageElement` and cannot run server-side.
- The `<img>` element used for extraction must have `crossOrigin="anonymous"` set before the `src` is assigned; otherwise canvas reads are blocked by CORS for external URLs.
