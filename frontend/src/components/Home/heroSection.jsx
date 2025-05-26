import DriveEtaIcon from '@mui/icons-material/DriveEta'
import { Box, Typography } from '@mui/material'

const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#44747f',
        color: 'white',
        py: 3,
        px: 2,
        textAlign: 'center',
      }}
    >
      <DriveEtaIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="h4" fontWeight="bold">
        ¡Disfrutá el camino!
      </Typography>
      <Typography variant="h5">Con tu auto a elección</Typography>
    </Box>
  )
}

export default HeroSection
