import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, useMediaQuery } from "@mui/material";
import { buildTheme } from "./theme/muiTheme";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";

export default function App() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => buildTheme(prefersDark ? "dark" : "light"), [prefersDark]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}
