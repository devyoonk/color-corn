# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Commit Message Convention

Use the format: `태그 : 제목` with a single space after the colon only.
- `feat` : 새로운 기능 추가
- `fix` : 버그 수정
- `docs` : 문서 수정
- `style` : 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `refactor` : 코드 리팩토링
- `test` : 테스트 코드 작성 또는 테스트 코드 리팩토링
- `chore` : 빌드 업무 수정, 패키지 매니저 수정
Note: When adding a new feature, complete implementation and run tests before returning the git commit message.
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
