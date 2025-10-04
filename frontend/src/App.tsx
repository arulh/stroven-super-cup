import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./theme";
import Home from "./pages/Home";
import PlayerInfo from "./pages/PlayerInfo";
import Competitors from "./pages/Competitors";
import About from "./pages/About";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "#091442",
          position: "relative",
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player/:playerId" element={<PlayerInfo />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
