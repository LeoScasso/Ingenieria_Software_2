import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { theme } from '../../theme/theme'

export const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const hideRegisterButton = location.pathname === '/register'
  const hideLoginButton = location.pathname === '/login'
  const hideProfileButton = location.pathname === '/mi-perfil'

  const [userName, setUserName] = useState(null)

  useEffect(() => {
    const storedName = localStorage.getItem('name')
    setUserName(storedName)
  }, [location])

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logout')

      localStorage.clear()
      setUserName(null)
      navigate('/')
      alert(response.data.message)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleClickLogin = () => {
    window.location.href = '/login'
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
        </Box>

        {/* Saludo o botones */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userName ? (
            <>
              <Typography sx={{ color: 'white', marginRight: 2 }}>
                Hola, {userName}!
              </Typography>
              
              {(
                <Button
                  component={Link}
                  to="/mi-perfil"
                  variant="contained"
                  sx={{
                    backgroundColor: 'beanBlue',
                    marginRight: 1
                  }}
                >
                  Mi Perfil
                </Button>
              )}
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
