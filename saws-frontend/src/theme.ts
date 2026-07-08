import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#00bcd4",
        },
        background: {
            default: "#f5f5f5",
        },
    },

    typography: {
        fontFamily: "Roboto, sans-serif",
    },

    shape: {
        borderRadius: 10,
    },
});

export default theme;