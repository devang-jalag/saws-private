import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            gap={3}
        >
            <Typography variant="h3" fontWeight={700}>
                SmartCare Appointment & Wellness System
            </Typography>

            <Typography variant="h6">
                Serverless Healthcare Management Platform
            </Typography>

            <Button
                component={Link}
                to="/login"
                variant="contained"
            >
                Login
            </Button>
        </Box>
    );
}