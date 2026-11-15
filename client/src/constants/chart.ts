/**
 * Chart tokens. The categorical order below was validated for colour-blind
 * separation on the app surface (#fffdf8) - keep it in this order and don't
 * add hues. Three slots sit under 3:1 contrast, so every chart that uses them
 * ships a legend and a table view.
 */
export const SERIES_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

/** Accent for single-series and "the one that matters" emphasis charts. */
export const ACCENT = "#2a78d6";
/** De-emphasis for context series (last month, the other weekdays, folded tails). */
export const MUTED_SERIES = "#b9b2a5";

/** Spending polarity: more than before is red, less is blue (neutral midpoint is the surface). */
export const DIVERGING = { more: "#e34948", less: "#2a78d6" };

/** Sequential blue for magnitude (heatmap), light to dark. */
export const SEQUENTIAL = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"];
/** A day with no spending - one step off the surface, not part of the ramp. */
export const EMPTY_CELL = "#efe8db";

export const CHART_SURFACE = "#fffdf8";
export const GRID_COLOR = "#ece5d8";
export const AXIS_TICK = {
  fill: "#5e6962",
  fontSize: 10,
  fontFamily: "IBM Plex Mono",
} as const;
