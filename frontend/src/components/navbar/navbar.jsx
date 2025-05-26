import { AppBar, Box, Button, Toolbar } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

export const Navbar = () => {
  const location = useLocation()
  const hideRegisterButton = location.pathname === '/register'
  const hideLoginButton =
    location.pathname === '/login' || location.pathname === '/loginAdmin'

  const handleClickLogin = () => {
    if (window.confirm('¿Querés iniciar como administrador?')) {
      console.log('Iniciando sesión como administrador')
      window.location.href = '/loginAdmin'
    } else {
      console.log('Iniciando sesión como usuario')
      window.location.href = '/login'
    }
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

        {/* Botones */}
        <Box>
          {!hideLoginButton && (
            <Button
              component={Link}
              variant="contained"
              color="primary"
              onClick={() => handleClickLogin()}
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
        </Box>
      </Toolbar>
    </AppBar>
  )
}
