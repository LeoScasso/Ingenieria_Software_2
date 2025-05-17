import { Typography, Grid, Card, CardMedia, CardContent, Box } from '@mui/material';

const cars = [
  {
    title: 'Sedán económico',
    description: 'Más espacio en el bolso, para poder trasladarte cómodo a todos lados',
    image: './logoAlquilapp.png', // reemplazá con la ruta real
  },
  {
    title: 'Sedán grande',
    description: 'Mayor comodidad y confort, para una conducción agradable a un precio asequible',
    image: '/logoAlquilapp.png',
  },
  {
    title: 'SUV económico',
    description: 'Mayor comodidad y confort, para un manejo seguro y agradable',
    image: '/logoAlquilapp.png',
  },
];

const FleetSection = () => {
  return (
    <Box sx={{ backgroundColor: '#244f5e', py: 6, px: 4 }}>
      <Typography variant="h5" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
        Nuestra flota de alquiler de vehículos
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {cars.map((car, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Card sx={{ backgroundColor: '#324151', color: 'white' }}>
              <CardMedia
                component="img"
                image={car.image}
                alt={car.title}
                sx={{ height: 160, objectFit: 'contain', backgroundColor: '#1c1c1c' }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {car.title}
                </Typography>
                <Typography variant="body2">{car.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FleetSection;
