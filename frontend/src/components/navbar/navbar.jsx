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
  const [role, setRole] = useState(null)

  useEffect(() => {
    setUserName(localStorage.getItem('name'))
    setRole(localStorage.getItem('role')) // <--- leemos el rol del usuario
  }, [location])

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logout')
      localStorage.clear()
      setUserName(null)
      setRole(null)
      navigate('/')
      alert(response.data.message)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userName ? (
            <>
              <Typography sx={{ color: 'white', marginRight: 2 }}>
                Hola, {userName}!
              </Typography>

              {role === 'user' && (
                <>
                  <Button
                    component={Link}
                    to="/mi-perfil"
                    variant="contained"
                    sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
                  >
                    Mi Perfil
                  </Button>
                  <Button
                    component={Link}
                    to="/reservation"
                    variant="contained"
                    sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
                  >
                    Reservar
                  </Button>
                  <Button
                    component={Link}
                    to="/"
                    variant="contained"
                    sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
                  >
                    Mis Reservas
                  </Button>
                </>
              )}

              {role === 'admin' && (
                <>
                  {/* Acá agregamos botones que usaría el admin */}
                  <Button
                    component={Link}
                    to="/vehicles/new"
                    variant="contained"
                    sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
                  >
                    Agregar Vehículo
                  </Button>
                </>
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
                  to="/login"
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
