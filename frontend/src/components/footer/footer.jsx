import { Typography, Box, Stack } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ 
      backgroundColor: 'darkBlue', 
      color: 'white', 
      py: 1,
      display: 'flex',
      alignItems: 'flex-start', // Alineación arriba para mejor distribución
      justifyContent: 'space-between',
      px: 1
    }}>
      {/* Bloque izquierdo (logo y textos) */}
      <Stack 
        direction="column" 
        alignItems="center" 
        spacing={1} 
        sx={{ 
          flexShrink: 0,
          width: 150 // Ancho fijo para mejor alineación
        }}
      >
        <Typography variant="caption" sx={{ textAlign: 'center', lineHeight: 1.2 }}>
          Desarrollado por:
        </Typography>
        <img 
          src="/chirimbolo.png" 
          alt="LogoChir" 
          style={{ 
            height: 60, 
            borderRadius: '50%',
            objectFit: 'cover'
          }} 
        />
        <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.7rem' }}>
          Todos los derechos reservados
        </Typography>
      </Stack>

      <Typography 
        variant="body2" 
        sx={{ 
          flexGrow: 1,
          textAlign: 'center',
          mx: 2,
          alignSelf: 'center'
        }}
      >
        INFO DE PIE DE PÁGINA
      </Typography>
    </Box>
  );
};

export default Footer;