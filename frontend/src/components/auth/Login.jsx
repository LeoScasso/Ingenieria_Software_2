import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import apiClient from '../../middleware/axios'

const Login = () => {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    mail: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/login', formData)
      const data = response.data

      localStorage.setItem('userId', data.user.id)
      console.log('Login successful:', data.user)
      alert('Login successful! Token: ' + data.token)
    } catch (error) {
      if (error.response) {
        console.error('Login failed - Server responded:', error.response.data)
        alert(
          'Login failed: ' + (error.response.data.message || 'Server error')
        )
      } else if (error.request) {
        console.error('Login failed - No response:', error.request)
        alert('Login error: No response from server.')
      } else {
        console.error('Login error - Request setup:', error.message)
        alert('Login error: ' + error.message)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      component="main"
      maxWidth="xs"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: theme.palette.darkBlue,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.slateGray,
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: theme.palette.beige }}>
            Iniciar Sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="mail"
              label="Correo Electrónico"
              name="mail"
              autoComplete="email"
              autoFocus
              value={formData.mail}
              onChange={handleChange}
              slotProps={{
                style: { color: theme.palette.beige },
              }}
              sx={{ 
                input: { 
                  color: theme.palette.beige,
                  '&:-webkit-autofill': { // Autofill styles
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                    caretColor: theme.palette.beige, // Cursor color during autofill
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.beanBlue,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.ming,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.beige,
                  },
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: theme.palette.beige },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ 
                input: { 
                  color: theme.palette.beige,
                  '&:-webkit-autofill': { // Autofill styles
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                    caretColor: theme.palette.beige, // Cursor color during autofill
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 100px ${theme.palette.slateGray} inset`,
                    WebkitTextFillColor: theme.palette.beige,
                  },
                },
                '.MuiIconButton-root': { color: theme.palette.beige },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.beanBlue,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.ming,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.beige,
                  },
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3, 
                mb: 2,
                backgroundColor: theme.palette.beanBlue,
                color: theme.palette.beige,
                '&:hover': {
                  backgroundColor: theme.palette.ming,
                }
              }}
            >
              Ingresar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default Login
