import React from 'react';
import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';
import AppRouter from './router';
import { Box } from '@mui/material'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App" sx={{
        height: '100vh'
      }}>
        <AppRouter />
      </Box>
    </ThemeProvider>
  );
}

export default App;
