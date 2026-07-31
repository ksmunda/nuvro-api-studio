/**
 * @nuvro/ui
 *
 * Shared React component library for NUVRO API Studio.
 *
 * Rules:
 * - Components are purely presentational — no data fetching, no Zustand
 * - Data flows in via props only
 * - All styling via Tailwind CSS + the `cn` helper
 * - No imports from apps/* or backend/*
 *
 * Components are added progressively in Phase 5.
 */

// Utilities
export { cn } from './utils/cn.ts';
