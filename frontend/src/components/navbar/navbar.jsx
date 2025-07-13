import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  useEffect(() => {
    setUserName(sessionStorage.getItem('name'))
    setRole(sessionStorage.getItem('role'))
  }, [location])

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logout')
      sessionStorage.clear()
      setUserName(null)
      setRole(null)
      setDrawerOpen(false)
      setAnchorEl(null)
      navigate('/')
      alert(response.data.message)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = () => {
    setDrawerOpen(false)
  }

  const renderUserMenuItems = () => {
    if (role === 'user') {
      return [
        { text: 'Mi Perfil', path: '/mi-perfil' },
        { text: 'Reservar', path: '/reservation' },
        { text: 'Mis Reservas', path: '/historial-alquileres' },
      ]
    } else if (role === 'employee') {
      return [
        { text: 'Mi Perfil', path: '/mi-perfil' },
        { text: 'Alta de alquileres', path: '/rental-registration' },
        { text: 'Registrar cliente', path: '/register' },
        { text: 'Crear Reserva', path: '/reservation' },
        { text: 'Historial Alquileres', path: '/rental-history-emp' },
        { text: 'Devoluciones', path: '/rental-to-return' },
        {text: 'Reservas Activas', path: '/user-reservations'}
      ]
    } else if (role === 'admin') {
      return [
        { text: 'Agregar Vehículo', path: '/vehicles/new' },
        { text: 'Registrar Empleado', path: '/employee-registration' },
        { text: 'Ver Sucursales', path: '/branches' },
        { text: 'Ver Empleados', path: '/employees' },
      ]
    }
    return []
  }

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, backgroundColor: 'darkBlue', color: 'white' }}>
        <Typography variant="h6" component="div">
          {userName ? `Hola, ${userName}!` : 'Menú'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {userName ? (
          <>
            {renderUserMenuItems().map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                onClick={handleMenuItemClick}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider />
            <ListItem
              component={Link}
              to="/vehicles"
              onClick={handleMenuItemClick}
              sx={{
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <ListItemText primary="Ver Flota" />
            </ListItem>
            <Divider />
            <ListItem
              onClick={() => {
                handleLogout()
                handleMenuItemClick()
              }}
              sx={{
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                cursor: 'pointer',
              }}
            >
              <ListItemText primary="Cerrar sesión" />
            </ListItem>
          </>
        ) : (
          <>
            {!hideLoginButton && (
              <ListItem
                component={Link}
                to="/login"
                onClick={handleMenuItemClick}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemText primary="Iniciar sesión" />
              </ListItem>
            )}
            {!hideRegisterButton && (
              <ListItem
                component={Link}
                to="/register"
                onClick={handleMenuItemClick}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ListItemText primary="Registrarse" />
              </ListItem>
            )}
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
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
                <Typography
                  sx={{
                    color: 'white',
                    marginRight: 2,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Hola, {userName}!
                </Typography>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                >
                  <MenuItem
                    onClick={handleProfileMenuClose}
                    component={Link}
                    to="/mi-perfil"
                  >
                    Mi Perfil
                  </MenuItem>
                  <MenuItem
                    onClick={handleProfileMenuClose}
                    component={Link}
                    to="/vehicles"
                  >
                    Ver Flota
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!hideLoginButton && (
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    color="primary"
                    sx={{
                      backgroundColor: 'beanBlue',
                      marginRight: 1,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    Iniciar sesión
                  </Button>
                )}
                {!hideRegisterButton && (
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{
                      borderColor: 'beige',
                      color: 'beige',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    Registrarse
                  </Button>
                )}
              </>
            )}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
