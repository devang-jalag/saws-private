import {
    Drawer,
    Toolbar,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PersonIcon from "@mui/icons-material/Person";

import { Link } from "react-router-dom";

const drawerWidth = 250;

export default function Sidebar() {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                },
            }}
        >
            <Toolbar />

            <List>

                <ListItemButton component={Link} to="/dashboard">
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>

                    <ListItemText primary="Dashboard" />
                </ListItemButton>

                <ListItemButton component={Link} to="/appointments">
                    <ListItemIcon>
                        <CalendarMonthIcon />
                    </ListItemIcon>

                    <ListItemText primary="Appointments" />
                </ListItemButton>

                <ListItemButton component={Link} to="/chatbot">
                    <ListItemIcon>
                        <SmartToyIcon />
                    </ListItemIcon>

                    <ListItemText primary="Chatbot" />
                </ListItemButton>

                <ListItemButton component={Link} to="/analytics">
                    <ListItemIcon>
                        <AnalyticsIcon />
                    </ListItemIcon>

                    <ListItemText primary="Analytics" />
                </ListItemButton>

                <ListItemButton component={Link} to="/profile">
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>

                    <ListItemText primary="Profile" />
                </ListItemButton>

            </List>

        </Drawer>
    );
}