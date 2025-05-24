import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const hideRegisterButton = location.pathname === '/register';
  const hideLoginButton = location.pathname === '/login';

  return (
    <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logoAlquilapp.png" alt="Logo" style={{ height: 70, marginRight: 8 }} />
        </Box>

        {/* Botones */}
        <Box>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
