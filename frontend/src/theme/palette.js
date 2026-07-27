// Palette tokens per the dataviz skill's validated default palette.
// Categorical hues are assigned in this fixed order — never cycled or
// reassigned when a filter changes which series are visible.

export const categorical = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
  yellow: { light: "#eda100", dark: "#c98500" },
  green: { light: "#008300", dark: "#008300" },
  violet: { light: "#4a3aa7", dark: "#9085e9" },
  red: { light: "#e34948", dark: "#e66767" },
  magenta: { light: "#e87ba4", dark: "#d55181" },
  orange: { light: "#eb6834", dark: "#d95926" },
};

// Fixed state semantics — reserved for status, never reused as "series N".
export const status = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const chrome = {
  light: {
    surface: "#fcfcfb",
    page: "#f9f9f7",
    textPrimary: "#0b0b0b",
    textSecondary: "#52514e",
    muted: "#898781",
    gridline: "#e1e0d9",
    baseline: "#c3c2b7",
  },
  dark: {
    surface: "#1a1a19",
    page: "#0d0d0d",
    textPrimary: "#ffffff",
    textSecondary: "#c3c2b7",
    muted: "#898781",
    gridline: "#2c2c2a",
    baseline: "#383835",
  },
};

export const sentimentColor = {
  POSITIVE: status.good,
  NEUTRAL: chrome.light.muted,
  NEGATIVE: status.critical,
  MIXED: status.warning,
};

export const appointmentStatusColor = {
  PENDING: status.warning,
  CONFIRMED: status.good,
  COMPLETED: categorical.blue.light,
  CANCELLED: status.serious,
  REJECTED: status.critical,
};
