import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#FF8370",
    },
    secondary: {
      main: "#FEC84D",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212529",
      secondary: "#495057",
    },
    success: {
      main: "#00B1B0",
    },
    error: {
      main: "#E42256",
    },
    warning: {
      main: "#f8961e",
    },
    info: {
      main: "#FF8370",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          color: "#FFFFFF",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#FEC84D",
        },
      },
    },
  },
});
