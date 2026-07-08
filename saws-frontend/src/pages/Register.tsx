import { Box, Paper, Typography } from "@mui/material";

export default function Register() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <Paper
                sx={{
                    width: 500,
                    p: 4,
                }}
            >
                <Typography variant="h5">
                    Register
                </Typography>

                {/* Registration Form */}

            </Paper>
        </Box>
    );
}