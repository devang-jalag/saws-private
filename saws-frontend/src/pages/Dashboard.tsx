import { Typography } from "@mui/material";

export default function Dashboard() {
    return (
        <>
            <Typography
                variant="h4"
                fontWeight={600}
            >
                Dashboard
            </Typography>

            <Typography mt={2}>
                Welcome to SmartCare Appointment & Wellness System.
            </Typography>
        </>
    );
}