import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'darkBlue' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logoAlquilapp.png" alt="Logo" style={{ height: 70, marginRight: 8 }} />
        </Box>

        {/* Botones */}
        <Box>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ backgroundColor: 'beanBlue', marginRight: 1 }}
          >
            Iniciar sesión
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            sx={{ borderColor: 'beige', color: 'beige' }}
          >
            Registrarse
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
