import { Box, Toolbar } from "@mui/material";

import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    return (
        <>
            <Navbar />

            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: "250px",
                    mt: 8,
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    minHeight: "100vh",
                }}
            >
                <Toolbar />

                {children}
            </Box>
        </>
    );
}