import { createTheme } from "@mui/material/styles";
import { chrome, categorical } from "./palette";

export function buildTheme(mode) {
  const tokens = mode === "dark" ? chrome.dark : chrome.light;
  return createTheme({
    palette: {
      mode,
      background: {
        default: tokens.page,
        paper: tokens.surface,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textSecondary,
      },
      primary: {
        main: mode === "dark" ? categorical.blue.dark : categorical.blue.light,
      },
      divider: tokens.gridline,
    },
    typography: {
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", sans-serif',
    },
    shape: { borderRadius: 10 },
  });
}
