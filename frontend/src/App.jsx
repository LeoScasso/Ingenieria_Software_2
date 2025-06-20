import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import React from 'react'
import './App.css'
import AppRouter from './router'
import { theme } from './theme/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className="App"
        sx={{
          height: '100%',
          display: 'flex',
        }}
      >
        <AppRouter />
      </Box>
    </ThemeProvider>
  )
}

export default App
