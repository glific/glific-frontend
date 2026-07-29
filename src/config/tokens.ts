/**
 * Design tokens.
 *
 * Only the subset MUI's palette actually needs as real hex strings lives here — its
 * internal lighten/darken/contrastText math needs a resolvable color, not a CSS var()
 * reference. Everything else (text colors, hover backgrounds, table/divider colors used
 * only inside CSS) lives directly as `--app-color-*` custom properties in src/index.css;
 * there's no need to duplicate those here since nothing in JS/TS reads their value.
 *
 * Primitive values here must match src/index.css's `--app-color-*` block exactly — kept
 * in sync by hand. Grows incrementally as each feature's CSS gets migrated onto tokens,
 * not speculatively upfront.
 */

// Primitives
export const COLOR_GREEN_PRIMARY = '#119656';
export const COLOR_GRAY_PRIMARY = '#777777';
export const COLOR_RED_PRIMARY = '#fb5c5c';
export const COLOR_RED_SECONDARY = '#dd1f1f';

// Semantics — theme.tsx imports these, not the primitives above
export const COLOR_BRAND_PRIMARY = COLOR_GREEN_PRIMARY;
export const COLOR_BRAND_SECONDARY = COLOR_GRAY_PRIMARY;
export const COLOR_ERROR = COLOR_RED_PRIMARY;
export const COLOR_WARNING = COLOR_RED_SECONDARY;
