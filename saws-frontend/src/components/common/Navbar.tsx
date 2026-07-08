import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Navbar() {
    return (
        <AppBar position="fixed">

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                    }}
                >
                    SmartCare Appointment & Wellness System
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <IconButton color="inherit">
                        <NotificationsIcon />
                    </IconButton>

                    <Avatar>T</Avatar>
                </Box>

            </Toolbar>

        </AppBar>
    );
}