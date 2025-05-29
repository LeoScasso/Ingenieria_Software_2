import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const hideRegisterButton = location.pathname === '/register'
  const hideLoginButton = location.pathname === '/login'

  const [userName, setUserName] = useState(null)

  useEffect(() => {
    const storedName = localStorage.getItem('name')
    setUserName(storedName)
  }, [location])

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logout')

      // Limpiar local storage
      localStorage.clear()
      setUserName(null)
      // Redirigir a la página de inicio
      navigate('/')
      //Alerta de mensaje retornado del back
      alert(response.data.message)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleClickLogin = () => {
    window.confirm('¿Querés iniciar sesión como admin?')
      ? (window.location.href = '/loginAdmin')
      : (window.location.href = '/login')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <img
            src="/logoAlquilapp.png"
            alt="Logo"
            style={{ height: 70, marginRight: 8 }}
          />
        </Box>

        {/* Saludo o botones */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userName ? (
            <>
              <Typography sx={{ color: 'white', marginRight: 2 }}>
                Hola, {userName}!
              </Typography>
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{ borderColor: 'beige', color: 'beige' }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              {!hideLoginButton && (
                <Button
                  component={Link}
                  onClick={handleClickLogin}
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
                >
                  Iniciar sesión
                </Button>
              )}
              {!hideRegisterButton && (
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  sx={{ borderColor: 'beige', color: 'beige' }}
                >
                  Registrarse
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
