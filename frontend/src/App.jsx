import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container, useMediaQuery } from "@mui/material";
import { buildTheme } from "./theme/muiTheme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import Appointment from "./pages/Appointment";
import Chatbot from "./pages/Chatbot";
// Import Messaging and Notifications (we'll create these next)
import Messaging from "./pages/Messaging";
import Notifications from "./pages/Notifications";

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/feedback" element={<Feedback />} />
      
      {/* Patient Routes */}
      <Route path="/appointments" element={
        <ProtectedRoute requiredRole="PATIENT">
          <Appointment />
        </ProtectedRoute>
      } />
      <Route path="/chatbot" element={
        <ProtectedRoute requiredRole="PATIENT">
          <Chatbot />
        </ProtectedRoute>
      } />
      
      {/* Coordinator Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="COORDINATOR">
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Shared Authenticated Routes */}
      <Route path="/messaging" element={
        <ProtectedRoute>
          <Messaging />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => buildTheme(prefersDark ? "dark" : "light"), [prefersDark]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <NavBar />
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <AppRoutes />
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
