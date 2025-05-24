import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material'
import { theme } from '../../theme/theme'

const FleetSection = () => {
  return (
    <Box sx={{ backgroundColor: theme.palette.slateGray, py: 6, px: 4 }}>
      <Typography
        variant="h5"
        sx={{ color: 'white', mb: 4, textAlign: 'center' }}
      >
        {' '}
        Nuestra flota de alquiler de vehículos
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {categories.map((category, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Card sx={{ backgroundColor: '#324151', color: 'white' }}>
              <CardMedia
                component="img"
                image={'./logoAlquilapp.png'}
                alt={category.name}
                sx={{
                  height: 160,
                  objectFit: 'contain',
                  backgroundColor: '#1c1c1c',
                }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {category.name}
                </Typography>
                <Typography variant="body2">{car.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FleetSection
