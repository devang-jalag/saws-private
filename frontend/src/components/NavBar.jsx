import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useLocation, useNavigate } from "react-router-dom";

const ROUTES = ["/", "/feedback"];

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = ROUTES.indexOf(location.pathname);

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar>
        <MonitorHeartIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 0, mr: 4 }}>
          SmartCare Analytics
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Tabs
            value={currentIndex === -1 ? 0 : currentIndex}
            onChange={(_, idx) => navigate(ROUTES[idx])}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Dashboard" />
            <Tab label="Feedback" />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
