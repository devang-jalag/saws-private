import { CircularProgress, Box } from "@mui/material";

export default function Loader() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
        >
            <CircularProgress />
        </Box>
    );
}