import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'

const Footer = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'darkBlue',
        color: 'white',
        py: { xs: 1, sm: 1.5, md: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 2, md: 3 },
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        gap: { xs: 1, sm: 0 },
        minHeight: { xs: '80px', sm: '100px', md: '120px' },
      }}
    >
      {/* Bloque izquierdo (logo y textos) */}
      <Stack
        direction="column"
        alignItems="center"
        spacing={{ xs: 0.5, sm: 0.75, md: 1 }}
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: 150 },
          order: { xs: 2, sm: 1 },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            lineHeight: { xs: 1, sm: 1.2 },
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          }}
        >
          Desarrollado por:
        </Typography>
        <img
          src="/chirimbolo.png"
          alt="LogoChir"
          style={{
            height: isMobile ? 40 : 50,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            lineHeight: { xs: 1, sm: 1.2 },
          }}
        >
          Todos los derechos reservados
        </Typography>
      </Stack>
    </Box>
  )
}

export default Footer
