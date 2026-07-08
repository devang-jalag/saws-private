import { Box, Paper, Typography } from "@mui/material";

export default function Login() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <Paper
                sx={{
                    width: 420,
                    p: 4,
                }}
            >
                <Typography
                    variant="h5"
                    mb={3}
                >
                    Login
                </Typography>

                {/* Login Form will be added next */}

            </Paper>
        </Box>
    );
}