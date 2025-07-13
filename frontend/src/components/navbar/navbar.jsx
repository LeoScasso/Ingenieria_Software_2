import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import ReplayIcon from '@mui/icons-material/Replay';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BuildIcon from '@mui/icons-material/Build';
import InsightsIcon from '@mui/icons-material/Insights';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PersonIcon from '@mui/icons-material/Person';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const menuConfig = {
  user: [
    {
      label: 'Alquileres',
      items: [
        { to: '/reservation', icon: <ListAltIcon />, text: 'Reservar' },
        { to: '/historial-alquileres', icon: <HistoryIcon />, text: 'Mis Reservas' },
      ],
    },
    {
      items: [
        { to: '/branches', icon: <HomeWorkIcon />, text: 'Ver Sucursales' },
        { to: '/vehicles', icon: <DirectionsCarIcon />, text: 'Ver Flota' },
      ],
    },
  ],
  employee: [
    {
      label: 'Reservas',
      items: [
        { to: '/reservation', icon: <ListAltIcon />, text: 'Crear Reserva' },
        { to: '/user-reservations', icon: <TrackChangesIcon />, text: 'Reservas Activas' },
      ],
    },
    {
      label: 'Alquileres',
      items: [
        { to: '/rental-registration', icon: <AssignmentIndIcon />, text: 'Alta de alquileres' },
        { to: '/rental-history-emp', icon: <HistoryIcon />, text: 'Historial Alquileres' },
        { to: '/rental-to-return', icon: <ReplayIcon />, text: 'Devoluciones' },
      ],
    },
    {
      label: 'Vehículos',
      items: [{ to: '/maintenance-vehicles', icon: <BuildIcon />, text: 'Vehículos en Mantenimiento' }],
    },
    {
      label: 'Usuarios',
      items: [{ to: '/register', icon: <GroupAddIcon />, text: 'Registrar cliente' }],
    },
    {
      items: [
        { to: '/branches', icon: <HomeWorkIcon />, text: 'Ver Sucursales' },
        { to: '/vehicles', icon: <DirectionsCarIcon />, text: 'Ver Flota' },
      ],
    },
  ],
  admin: [
    {
      label: 'Administración',
      items: [
        { to: '/vehicles/new', icon: <AddBusinessIcon />, text: 'Agregar Vehículo' },
        { to: '/employee-registration', icon: <GroupAddIcon />, text: 'Registrar Empleado' },
        { to: '/employees', icon: <AssignmentIndIcon />, text: 'Ver Empleados' },
      ],
    },
    {
      label: 'Métricas',
      items: [{ to: '/registered-users-metric', icon: <InsightsIcon />, text: 'Usuarios Registrados' }],
    },
    {
      items: [
        { to: '/branches', icon: <HomeWorkIcon />, text: 'Ver Sucursales' },
        { to: '/vehicles', icon: <DirectionsCarIcon />, text: 'Ver Flota' },
      ],
    },
  ],
};

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hideRegisterButton = location.pathname === '/register';
  const hideLoginButton = location.pathname === '/login';

  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setUserName(sessionStorage.getItem('name'));
    setRole(sessionStorage.getItem('role'));
  }, [location]);

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logout');
      sessionStorage.clear();
      setUserName(null);
      setRole(null);
      setDrawerOpen(false);
      setAnchorEl(null);
      navigate('/');
      alert(response.data.message);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleMenuItemClick = () => setDrawerOpen(false);

  const Item = ({ to, icon, text }) => (
    <ListItem
      component={Link}
      to={to}
      onClick={handleMenuItemClick}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        '& .MuiListItemIcon-root': { color: 'inherit' },
        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  );

  const renderMenuSections = (sections) =>
    sections.map((section, idx) => (
      <Box key={idx}>
        {section.label && (
          <>
            <ListSubheader>{section.label}</ListSubheader>
            <Divider sx={{ mb: 1 }} />
          </>
        )}
        {section.items.map(({ to, icon, text }) => (
          <Item key={to} to={to} icon={icon} text={text} />
        ))}
      </Box>
    ));

  const drawerContent = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2, backgroundColor: 'darkBlue', color: 'white' }}>
        <Typography variant="h6">{userName ? `Hola, ${userName}!` : 'Menú'}</Typography>
      </Box>
      <Divider />
      <List>
        {userName ? (
          <>
            <Item to="/mi-perfil" icon={<PersonIcon />} text="Mi Perfil" />
            {renderMenuSections(menuConfig[role] || [])}
            <Divider sx={{ my: 1 }} />
            <ListItem
              onClick={() => {
                handleLogout();
                handleMenuItemClick();
              }}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '& .MuiListItemIcon-root': { color: 'inherit' },
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                cursor: 'pointer',
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItem>
          </>
        ) : (
          <>
            {!hideLoginButton && <Item to="/login" icon={<LoginIcon />} text="Iniciar sesión" />}
            {!hideRegisterButton && <Item to="/register" icon={<AppRegistrationIcon />} text="Registrarse" />}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logoAlquilapp.png" alt="Logo" style={{ height: 70, marginRight: 8 }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {userName ? (
              <>
                <Typography sx={{ color: 'white', marginRight: 2, display: { xs: 'none', sm: 'block' } }}>
                  Hola, {userName}!
                </Typography>
                <IconButton onClick={handleProfileMenuOpen} color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                >
                  <MenuItem onClick={handleProfileMenuClose} component={Link} to="/mi-perfil">
                    Mi Perfil
                  </MenuItem>
                  <MenuItem onClick={handleProfileMenuClose} component={Link} to="/vehicles">
                    Ver Flota
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!hideLoginButton && (
                  <Button component={Link} to="/login" variant="contained" color="primary" sx={{ marginRight: 1 }}>
                    Iniciar sesión
                  </Button>
                )}
                {!hideRegisterButton && (
                  <Button component={Link} to="/register" variant="outlined" sx={{ borderColor: 'beige', color: 'beige' }}>
                    Registrarse
                  </Button>
                )}
              </>
            )}
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ ml: 1 }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'beige',
            color: 'black',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
