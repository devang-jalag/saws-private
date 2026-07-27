import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Button } from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient, isCoordinator, logout, user } = useAuth();

  const getTabs = () => {
    if (!isAuthenticated) return [{ label: "Home", path: "/" }, { label: "Feedback", path: "/feedback" }];
    if (isPatient) {
      return [
        { label: "Appointments", path: "/appointments" },
        { label: "Chatbot", path: "/chatbot" },
        { label: "Messaging", path: "/messaging" },
        { label: "Notifications", path: "/notifications" },
        { label: "Feedback", path: "/feedback" }
      ];
    }
    if (isCoordinator) {
      return [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Analytics", path: "/analytics" },
        { label: "Messaging", path: "/messaging" },
        { label: "Notifications", path: "/notifications" }
      ];
    }
    return [];
  };

  const tabs = getTabs();
  // Find current tab index or default to false
  const currentIndex = tabs.findIndex(t => t.path === location.pathname);

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar>
        <MonitorHeartIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 0, mr: 4, cursor: 'pointer' }} onClick={() => navigate("/")}>
          SmartCare (SAWS)
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Tabs
            value={currentIndex !== -1 ? currentIndex : false}
            onChange={(_, idx) => navigate(tabs[idx].path)}
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
          </Tabs>
        </Box>
        <Box>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Hi, {user?.username || 'User'}</Typography>
              <Button variant="outlined" size="small" onClick={() => { logout(); navigate("/login"); }}>Logout</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined" size="small">Login</Button>
              <Button component={Link} to="/register" variant="contained" size="small">Register</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
